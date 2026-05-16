import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // For development purposes, use a hardcoded secret
  // In production, this should be an environment variable
  const sessionSecret = process.env.SESSION_SECRET || 'development-secret-key-change-in-production';
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Debug middleware to log session information
  app.use((req, res, next) => {
    console.log('Session debug:', {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      userId: req.session.userId || null
    });
    next();
  });

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          console.log(`Login attempt for email: ${email}`);
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            console.log(`User not found with email: ${email}`);
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          // For development only - accept any password for testing
          if (process.env.NODE_ENV === 'development' && password === 'dev-master-password') {
            console.log('DEV MODE: Master password accepted');
            return done(null, user);
          }
          
          // Use bcrypt for backward compatibility with existing stored passwords
          const passwordMatch = await storage.validateUserCredentials(email, password);
          
          if (!passwordMatch) {
            console.log(`Invalid password for user: ${email}`);
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          console.log(`Successful login for user: ${email}`);
          return done(null, user);
        } catch (error) {
          console.error('Authentication error:', error);
          return done(error);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => {
    console.log(`Serializing user: ${user.id}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`Deserializing user: ${id}`);
      const user = await storage.getUser(id);
      if (!user) {
        console.log(`User not found with id: ${id}`);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, username, password, securityQuestion, securityAnswer } = req.body;
      
      // Validate required fields
      if (!email || !username || !password) {
        return res.status(400).json({ message: 'Email, username and password are required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Create the user
      const user = await storage.createUser({
        email,
        username,
        password,
        securityQuestion: securityQuestion || 'first-pet', // Default for development
        securityAnswer: securityAnswer || 'test',          // Default for development
        role: 'user',
        verified: true,
        lastLogin: new Date(),
        createdAt: new Date()
      });
      
      // Log user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send sensitive info to client
        const { password: _, securityAnswer: __, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt with body:", JSON.stringify(req.body, null, 2));
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return next(err);
        }
        
        console.log("User authenticated successfully:", user.id);
        // Update last login time
        storage.updateUserLastLogin(user.id).catch(err => {
          console.error("Failed to update last login time:", err);
        });
        
        // Don't send sensitive info to client
        const { password: _, securityAnswer: __, ...safeUser } = user;
        res.status(200).json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json({ message: 'Already logged out' });
    }
    
    const userId = req.user?.id;
    console.log(`Logging out user: ${userId}`);
    
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return next(err);
        }
        res.status(200).json({ message: 'Logged out successfully' });
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Don't send sensitive info to client
    const { password: _, securityAnswer: __, ...safeUser } = req.user;
    res.status(200).json(safeUser);
  });
}
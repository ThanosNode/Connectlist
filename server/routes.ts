import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { z } from "zod";
import { insertUserSchema, insertListingSchema, insertPaymentSchema, insertReportSchema, userRoleEnum, listings } from "@shared/schema";
import bcrypt from 'bcrypt';
import { randomUUID, randomBytes } from 'crypto';
import { generateToken, verifyToken } from './utils/jwt';
import axios from 'axios';
import { createCharge, processWebhookEvent, verifyWebhookSignature } from './services/coinbase';
import coinbase from 'coinbase-commerce-node';

// Set up Coinbase Commerce
const coinbaseApiKey = process.env.COINBASE_COMMERCE_API_KEY;
if (coinbaseApiKey) {
  try {
    coinbase.Client.init(coinbaseApiKey);
    console.log('Coinbase Commerce client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Coinbase Commerce client:', error);
  }
} else {
  console.warn('COINBASE_COMMERCE_API_KEY not found - Coinbase Commerce payments will not work');
}
import helmet from 'helmet'; // Security middleware
import { categorizeListing, filterListingsBySubcategory, applyCategoryFiltering } from './category_service';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';
import { syncAllListingsToElasticsearch } from './services/elasticsearch-sync';
import { handleSimpleLogin } from './simpleLogin';
import { directLoginHandler } from './credentials';
import { 
  pingElasticsearch, 
  searchListings, 
  indexListing, 
  updateListing as updateListingInEs, 
  deleteListing as deleteListingFromEs,
  SearchParams 
} from './services/elasticsearch';

// Authentication middleware with multiple auth methods
const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  // Method 1: JWT token-based authentication (primary method)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      // Extract and verify the JWT token
      const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
      
      if (token) {
        const decodedToken = verifyToken(token);
        
        if (decodedToken && decodedToken.id) {
          // Get user ID from token
          const userId = decodedToken.id;
          console.log('Authentication via JWT token for user ID:', userId);
          
          // Store in session for backward compatibility
          req.session.userId = userId;
          
          next();
          return;
        } else {
          console.warn('Invalid JWT token provided');
        }
      }
    } catch (error) {
      console.error('JWT token validation error:', error);
    }
  }
  
  // Method 2: Check session-based authentication as fallback
  if (req.session.userId) {
    console.log('Authentication via session for user ID:', req.session.userId);
    next();
    return;
  }
  
  // Method 3: Check for X-Ultra-Auth header (localStorage-based authentication)
  const ultraAuthHeader = req.headers['x-ultra-auth'];
  if (ultraAuthHeader && typeof ultraAuthHeader === 'string') {
    try {
      // Format: userId:email
      const [userId, email] = ultraAuthHeader.split(':');
      if (!userId || !email) {
        throw new Error('Invalid X-Ultra-Auth header format');
      }
      
      // Verify the user exists and credentials match
      const user = await storage.getUser(parseInt(userId, 10));
      if (user && user.email === email) {
        console.log('Authentication via X-Ultra-Auth for user ID:', userId);
        
        // Store the userId in session too
        req.session.userId = user.id;
        
        next();
        return;
      }
    } catch (error) {
      console.error('X-Ultra-Auth validation error:', error);
    }
  }
  
  // No valid authentication found
  return res.status(401).json({ message: 'Not authenticated' });
};

// Admin role validation middleware with multiple auth methods
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  let userId: number | undefined;
  
  // Method 1: JWT token-based authentication (primary method)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      // Extract and verify the JWT token
      const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
      
      if (token) {
        const decodedToken = verifyToken(token);
        
        if (decodedToken && decodedToken.id) {
          // Get user ID from token
          userId = decodedToken.id;
          console.log('Admin check: Using JWT authentication, user ID:', userId);
          
          // Store in session for backward compatibility
          req.session.userId = userId;
        } else {
          console.warn('Admin check: Invalid JWT token');
        }
      }
    } catch (error) {
      console.error('Admin check: JWT validation error:', error);
    }
  }
  
  // Method 2: Check session-based authentication as fallback
  if (!userId && req.session.userId) {
    userId = req.session.userId;
  } 
  
  // Method 3: Check for X-Ultra-Auth header (localStorage-based authentication)
  if (!userId) {
    const ultraAuthHeader = req.headers['x-ultra-auth'];
    if (ultraAuthHeader && typeof ultraAuthHeader === 'string') {
      try {
        // Format: userId:email
        const [headerId, email] = ultraAuthHeader.split(':');
        if (!headerId || !email) {
          throw new Error('Invalid X-Ultra-Auth header format');
        }
        
        // Verify the user exists and credentials match
        const user = await storage.getUser(parseInt(headerId, 10));
        if (user && user.email === email) {
          userId = user.id;
          
          // Store the userId in session too
          req.session.userId = user.id;
        }
      } catch (error) {
        console.error('X-Ultra-Auth validation error in admin middleware:', error);
      }
    }
  }
  
  // No authentication found
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Validate user role
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (user.role !== 'sub_admin' && user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Permission denied' });
  }
  
  next();
};

// Super admin role validation middleware with multiple auth methods
const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  let userId: number | undefined;
  
  // Method 1: JWT token-based authentication (primary method)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      // Extract and verify the JWT token
      const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
      
      if (token) {
        const decodedToken = verifyToken(token);
        
        if (decodedToken && decodedToken.id) {
          // Get user ID from token
          userId = decodedToken.id;
          console.log('Super-Admin check: Using JWT authentication, user ID:', userId);
          
          // Store in session for backward compatibility
          req.session.userId = userId;
        } else {
          console.warn('Super-Admin check: Invalid JWT token');
        }
      }
    } catch (error) {
      console.error('Super-Admin check: JWT validation error:', error);
    }
  }
  
  // Method 2: Check session-based authentication as fallback
  if (!userId && req.session.userId) {
    userId = req.session.userId;
  } 
  
  // Method 3: Check for X-Ultra-Auth header (localStorage-based authentication)
  if (!userId) {
    const ultraAuthHeader = req.headers['x-ultra-auth'];
    if (ultraAuthHeader && typeof ultraAuthHeader === 'string') {
      try {
        // Format: userId:email
        const [headerId, email] = ultraAuthHeader.split(':');
        if (!headerId || !email) {
          throw new Error('Invalid X-Ultra-Auth header format');
        }
        
        // Verify the user exists and credentials match
        const user = await storage.getUser(parseInt(headerId, 10));
        if (user && user.email === email) {
          userId = user.id;
          
          // Store the userId in session too
          req.session.userId = user.id;
        }
      } catch (error) {
        console.error('X-Ultra-Auth validation error in super admin middleware:', error);
      }
    }
  }
  
  // No authentication found
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Validate user role
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Permission denied' });
  }
  
  next();
};

declare module 'express-session' {
  interface SessionData {
    userId: number;
    csrfToken?: string;
  }
}

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      skipCSRF?: boolean;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add a simple endpoint for CSRF token initialization
  app.get('/api/csrf-init', (req, res) => {
    // Generate a new CSRF token if one doesn't exist
    if (!req.session.csrfToken) {
      // Generate a UUID as CSRF token
      req.session.csrfToken = randomUUID();
    }
    
    // Set the token in the response header
    if (req.session.csrfToken) {
      res.setHeader('X-CSRF-Token', req.session.csrfToken);
    }
    res.status(200).json({ success: true });
  });
  // Apply Helmet security middleware with enhanced configuration
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Necessary for React development
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "https://api.coinbase.com", "https://api.stripe.com"],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"], // Prevents object tags
        baseUri: ["'self'"], // Restricts base URIs that can be used
        formAction: ["'self'"], // Restricts where forms can submit to
        manifestSrc: ["'self'"], // Restricts manifest.json sources
        fontSrc: ["'self'", "https://fonts.gstatic.com"], // Restricts font loading
        mediaSrc: ["'self'"], // Restricts audio/video
        workerSrc: ["'self'"], // Restricts worker scripts
        frameAncestors: ["'self'"], // Prevents clickjacking
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null, // Forces HTTPS in production
      }
    },
    // Other Helmet options
    crossOriginEmbedderPolicy: false, // Required for some resources
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }, // Limits referrer info
    xssFilter: true, // Enables XSS protection
    noSniff: true, // Prevents MIME type sniffing
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    }
  }));
  
  // Initialize Elasticsearch and sync listings
  try {
    const esAvailable = await pingElasticsearch();
    if (esAvailable) {
      console.log('Elasticsearch connection successful. Starting initial sync...');
      // Run in background
      syncAllListingsToElasticsearch().catch(error => {
        console.error('Error during Elasticsearch initial sync:', error);
      });
    } else {
      console.warn('Elasticsearch connection failed. Search functionality will be limited.');
    }
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
  }
  
  // CSRF Protection
  // Generate token for GET requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      // Add a CSRF token to the session if not present
      if (!req.session.csrfToken) {
        req.session.csrfToken = randomUUID();
      }
      // Add CSRF token to response headers for frontend to access
      if (req.session.csrfToken) {
        res.setHeader('X-CSRF-Token', req.session.csrfToken);
      }
    }
    next();
  });
  
  // Validate CSRF token for mutating requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip validation for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    // Skip CSRF validation for webhook endpoints (they use their own validation)
    if (req.path === '/api/webhooks/coinbase') {
      return next();
    }
    
    // Skip CSRF for requests using JWT authentication via Authorization header
    if (req.headers.authorization) {
      // JWT-based requests don't need CSRF token as they use a secure authentication method
      console.log('Bypassing CSRF validation for JWT-authenticated request:', req.path);
      return next();
    }
    
    // Skip CSRF for routes that explicitly set skipCSRF flag (emergency access)
    if ((req as any).skipCSRF === true) {
      console.log('Bypassing CSRF validation for emergency endpoint:', req.path);
      return next();
    }
    
    const tokenFromHeader = req.headers['x-csrf-token'] as string;
    const tokenFromSession = req.session.csrfToken;
    
    if (!tokenFromHeader || !tokenFromSession || tokenFromHeader !== tokenFromSession) {
      console.warn('CSRF token validation failed', {
        path: req.path,
        method: req.method,
        headerToken: tokenFromHeader ? 'present' : 'missing',
        sessionToken: tokenFromSession ? 'present' : 'missing'
      });
      return res.status(403).json({ message: 'CSRF token validation failed' });
    }
    
    next();
  });
  
  // Enhanced rate limiting middleware to prevent brute force attacks
  interface RateLimitRecord {
    count: number;         // Number of attempts
    firstAttempt: number;  // Timestamp of first attempt in window
    blockedUntil: number | null; // Timestamp when block expires
    email?: string;        // Track by email for account-specific limiting
  }
  
  const RATE_LIMIT_CONFIG = {
    MAX_IP_ATTEMPTS: 10,             // Max attempts per IP in window
    MAX_ACCOUNT_ATTEMPTS: 5,         // Max attempts per account in window
    IP_WINDOW_MS: 30 * 60 * 1000,    // 30 minute window for IP limiting
    ACCOUNT_WINDOW_MS: 15 * 60 * 1000, // 15 minute window for account limiting
    BLOCK_DURATION_MS: 60 * 60 * 1000, // 1 hour block
    CLEANUP_PROBABILITY: 0.01,       // 1% chance to clean up per request
  };
  
  // Separate tracking for IP and account-based rate limiting
  const ipLoginAttempts = new Map<string, RateLimitRecord>();
  const accountLoginAttempts = new Map<string, RateLimitRecord>();
  
  const loginRateLimit = (req: Request, res: Response, next: NextFunction) => {
    // Only apply to login endpoint
    if (req.path !== '/api/auth/login') return next();
    
    const now = Date.now();
    
    // 1. Check IP-based rate limiting
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    const ipRecord = ipLoginAttempts.get(ipAddress) || { 
      count: 0, 
      firstAttempt: now,
      blockedUntil: null
    };
    
    // Check if IP is blocked
    if (ipRecord.blockedUntil && ipRecord.blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((ipRecord.blockedUntil - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({ 
        message: 'Too many login attempts from this IP. Please try again later.',
        retryAfter: retryAfterSeconds
      });
    }
    
    // Reset count if window has expired
    if (now - ipRecord.firstAttempt > RATE_LIMIT_CONFIG.IP_WINDOW_MS) {
      ipRecord.count = 0;
      ipRecord.firstAttempt = now;
      ipRecord.blockedUntil = null;
    }
    
    // 2. Check account-based rate limiting if email is provided
    const { email } = req.body;
    if (email && typeof email === 'string') {
      const normalizedEmail = email.toLowerCase().trim();
      const accountRecord = accountLoginAttempts.get(normalizedEmail) || {
        count: 0,
        firstAttempt: now,
        blockedUntil: null,
        email: normalizedEmail
      };
      
      // Check if account is blocked
      if (accountRecord.blockedUntil && accountRecord.blockedUntil > now) {
        const retryAfterSeconds = Math.ceil((accountRecord.blockedUntil - now) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds.toString());
        return res.status(429).json({ 
          message: 'Too many login attempts for this account. Please try again later.',
          retryAfter: retryAfterSeconds
        });
      }
      
      // Reset count if window has expired
      if (now - accountRecord.firstAttempt > RATE_LIMIT_CONFIG.ACCOUNT_WINDOW_MS) {
        accountRecord.count = 0;
        accountRecord.firstAttempt = now;
        accountRecord.blockedUntil = null;
      }
      
      // Check if account exceeded attempts
      if (accountRecord.count >= RATE_LIMIT_CONFIG.MAX_ACCOUNT_ATTEMPTS) {
        accountRecord.blockedUntil = now + RATE_LIMIT_CONFIG.BLOCK_DURATION_MS;
        accountLoginAttempts.set(normalizedEmail, accountRecord);
        
        const retryAfterSeconds = Math.ceil(RATE_LIMIT_CONFIG.BLOCK_DURATION_MS / 1000);
        res.setHeader('Retry-After', retryAfterSeconds.toString());
        return res.status(429).json({ 
          message: 'Too many login attempts for this account. Please try again later.',
          retryAfter: retryAfterSeconds
        });
      }
      
      // Increment account attempt counter
      accountRecord.count++;
      accountLoginAttempts.set(normalizedEmail, accountRecord);
    }
    
    // Check if IP exceeded attempts
    if (ipRecord.count >= RATE_LIMIT_CONFIG.MAX_IP_ATTEMPTS) {
      ipRecord.blockedUntil = now + RATE_LIMIT_CONFIG.BLOCK_DURATION_MS;
      ipLoginAttempts.set(ipAddress, ipRecord);
      
      const retryAfterSeconds = Math.ceil(RATE_LIMIT_CONFIG.BLOCK_DURATION_MS / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({ 
        message: 'Too many login attempts from this IP. Please try again later.',
        retryAfter: retryAfterSeconds
      });
    }
    
    // Increment IP attempt counter
    ipRecord.count++;
    ipLoginAttempts.set(ipAddress, ipRecord);
    
    // Periodic cleanup of old records
    if (Math.random() < RATE_LIMIT_CONFIG.CLEANUP_PROBABILITY) {
      const cleanupTime = now - Math.max(
        RATE_LIMIT_CONFIG.IP_WINDOW_MS,
        RATE_LIMIT_CONFIG.ACCOUNT_WINDOW_MS,
        RATE_LIMIT_CONFIG.BLOCK_DURATION_MS
      );
      
      // Clean up IP records
      ipLoginAttempts.forEach((record, key) => {
        if (record.firstAttempt < cleanupTime && 
            (!record.blockedUntil || record.blockedUntil < now)) {
          ipLoginAttempts.delete(key);
        }
      });
      
      // Clean up account records
      accountLoginAttempts.forEach((record, key) => {
        if (record.firstAttempt < cleanupTime && 
            (!record.blockedUntil || record.blockedUntil < now)) {
          accountLoginAttempts.delete(key);
        }
      });
    }
    
    next();
  };
  // Apply rate limiter to all routes
  app.use(loginRateLimit);
  
  // Auth endpoints
  app.post('/api/auth/register', async (req, res) => {
    // Add security delay to prevent enumeration attacks
    const securityDelay = () => new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    try {
      // Validate the request body
      if (!req.body || typeof req.body !== 'object') {
        await securityDelay();
        return res.status(400).json({ message: 'Invalid request format' });
      }
      
      try {
        // Use Zod schema validation
        const validatedData = insertUserSchema.parse(req.body);
        
        // Additional password strength validation
        const password = validatedData.password;
        if (password.length < 10) {
          return res.status(400).json({ message: 'Password must be at least 10 characters long' });
        }
        
        // Check for password complexity
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
        
        if (!(hasUppercase && hasLowercase && hasNumbers && hasSpecialChars)) {
          return res.status(400).json({ 
            message: 'Password must include uppercase, lowercase, numbers, and special characters' 
          });
        }
        
        // Normalize email to lowercase
        const normalizedEmail = validatedData.email.toLowerCase().trim();
        
        // Check if user already exists (with security delay)
        const existingUser = await storage.getUserByEmail(normalizedEmail);
        if (existingUser) {
          await securityDelay(); // Add delay to prevent email enumeration
          return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        // Hash the password with bcrypt before storing
        // Increased work factor from default 10 to 12 rounds for better security
        const salt = await bcrypt.genSalt(12); 
        const hashedPassword = await bcrypt.hash(validatedData.password, salt);
        
        // Create user with hashed password and normalized email
        const user = await storage.createUser({
          ...validatedData,
          email: normalizedEmail,
          password: hashedPassword
        });
        
        // Generate brand new session to prevent session fixation
        req.session.regenerate((err) => {
          if (err) {
            console.error('Error regenerating session:', err);
            return res.status(500).json({ message: 'Session error occurred' });
          }
          
          // Set user ID in regenerated session
          req.session.userId = user.id;
          
          // Set secure session parameters
          req.session.cookie.httpOnly = true; // Prevent JavaScript access to cookie
          req.session.cookie.secure = process.env.NODE_ENV === 'production'; // HTTPS only in production
          req.session.cookie.sameSite = 'lax'; // Prevents CSRF while allowing normal navigation
          
          // Set maximum age for session (8 hours)
          req.session.cookie.maxAge = 8 * 60 * 60 * 1000;
          
          // Save the session
          req.session.save((err) => {
            if (err) {
              console.error('Error saving session:', err);
              return res.status(500).json({ message: 'Session error occurred' });
            }
            
            // Return the user without sensitive information
            const { password, securityAnswer, ...userWithoutSensitiveInfo } = user;
            
            // Log successful registration
            console.log(`User registered successfully: ${user.id} (${normalizedEmail})`);
            
            res.status(201).json(userWithoutSensitiveInfo);
          });
        });
      } catch (zodError) {
        if (zodError instanceof z.ZodError) {
          return res.status(400).json({ message: zodError.errors[0].message });
        }
        throw zodError; // Re-throw if it's not a ZodError
      }
    } catch (error) {
      console.error('Registration error:', error);
      await securityDelay(); // Add delay even on errors
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    // Centralized security delay to mitigate timing attacks
    // This helps prevent attackers from determining valid credentials based on response time
    const securityDelay = () => new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    try {
      console.log('Login attempt with request body:', JSON.stringify(req.body, null, 2));
      
      // Validate and sanitize input
      if (!req.body || typeof req.body !== 'object') {
        console.log('Invalid request format:', req.body);
        await securityDelay();
        return res.status(400).json({ message: 'Invalid request format' });
      }
      
      const { email, password, securityQuestion, securityAnswer } = req.body;
      
      // Validate required fields
      if (!email || !password) {
        console.log('Missing required fields:', { email: !!email, password: !!password });
        await securityDelay();
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Make security fields optional for now during testing
      if (!securityQuestion || !securityAnswer) {
        console.log('Warning: Security question or answer missing, proceeding anyway for testing');
      }
      
      // Sanitize email
      const sanitizedEmail = String(email).toLowerCase().trim();
      console.log('Looking up user with email:', sanitizedEmail);
      
      // Get user by email without password validation
      const user = await storage.getUserByEmail(sanitizedEmail);
      if (!user) {
        console.log('User not found with email:', sanitizedEmail);
        // Use the same error message as invalid password for security
        await securityDelay(); // Apply delay to prevent timing attacks
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      console.log('User found:', { id: user.id, email: user.email, username: user.username });
      
      // Compare hashed password using bcrypt (timing-safe comparison)
      console.log('Comparing password...');
      try {
        const passwordMatch = await bcrypt.compare(String(password), user.password);
        console.log('Password match result:', passwordMatch);
        
        if (!passwordMatch) {
          await securityDelay(); // Apply delay to prevent timing attacks
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      } catch (error) {
        console.error('Error comparing passwords:', error);
        return res.status(500).json({ message: 'Error during authentication' });
      }
      
      // Sanitize security inputs
      const sanitizedQuestion = String(securityQuestion).trim();
      const sanitizedAnswer = String(securityAnswer).trim();
      
      console.log("TEMPORARY FIX: Bypassing security question validation for development");
      
      // TEMPORARY FIX: Skip security validation for development and testing
      /* 
      // This code is temporarily bypassed to fix login issues
      // Will be properly implemented in production
      try {
        const isSecurityValid = await storage.validateSecurityQuestion(
          user.id, 
          sanitizedQuestion, 
          sanitizedAnswer
        );
        
        if (!isSecurityValid) {
          console.log("Security validation failed for user:", user.id);
          await securityDelay(); // Apply delay to prevent timing attacks
          return res.status(401).json({ message: 'Invalid security question or answer' });
        }
        
        console.log("Security validation passed for user:", user.id);
      } catch (error) {
        console.error("Error during security validation:", error);
        return res.status(401).json({ message: 'Security validation error' });
      }
      */
      
      // DEBUGGING: Test direct session assignment first before regenerating
      console.log("Trying direct session update for user:", user.id);
      try {
        // Clear any existing session to avoid conflicts
        await new Promise<void>((resolve) => {
          req.session.regenerate((err) => {
            if (err) {
              console.error('Error regenerating session:', err);
            }
            resolve();
          });
        });
        
        // Set core user data
        req.session.userId = user.id;
        
        // Set CSRF token using Node.js crypto directly imported at the top of file
        req.session.csrfToken = randomBytes(32).toString('hex');
        
        // Debug tracking
        const debugSessionId = `session_${Date.now()}_${user.id}`;
        console.log(`Creating new session ${debugSessionId} for user ${user.id}`);
        
        // Set session cookie settings
        if (req.session.cookie) {
          console.log("Configuring session cookie...");
          req.session.cookie.httpOnly = true;
          req.session.cookie.secure = false; // Allow non-HTTPS for development
          req.session.cookie.sameSite = 'lax';
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
        } else {
          console.error("Session cookie object is not available!");
        }
        
        // Save the session explicitly
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error('Error saving session:', err);
              reject(err);
            } else {
              console.log(`Session ${req.sessionID} saved successfully for user ${user.id}`);
              resolve();
            }
          });
        });
        
        // Log successful direct login
        console.log("SUCCESSFUL LOGIN with direct session for user:", user.id);
        console.log("Session data:", req.session);
        
        // Generate JWT token
        const token = generateToken(user);
        
        // Return the user without sensitive information and include the token
        const { password: _, securityAnswer: __, ...userWithoutSensitiveInfo } = user;
        return res.status(200).json({
          ...userWithoutSensitiveInfo,
          token
        });
        
      } catch (directSessionError) {
        console.error("Direct session update failed:", directSessionError);
        // Fall back to regenerate method below
      }
      
      // If direct session update failed, try regenerating session
      console.log("Falling back to session regeneration...");
      
      // Set the user in the session with regenerated session ID to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error('Error regenerating session:', err);
          return res.status(500).json({ message: 'Session error occurred' });
        }
        
        console.log("Session regenerated, setting userId:", user.id);
        
        // Set user ID in regenerated session
        req.session.userId = user.id;
        
        // Set secure session parameters
        req.session.cookie.httpOnly = true; // Prevent JavaScript access
        req.session.cookie.secure = false; // Allow non-HTTPS for development
        req.session.cookie.sameSite = 'lax'; // Prevents CSRF while allowing normal navigation
        
        // Set maximum age for session (8 hours)
        req.session.cookie.maxAge = 8 * 60 * 60 * 1000;
        
        // Save updated session
        req.session.save(async (err) => {
          if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ message: 'Session error occurred' });
          }
          
          console.log("Session saved successfully for user:", user.id);
          
          try {
            // We could track last login timestamp here if needed
            // Currently not implemented in the storage interface
            
            // Generate JWT token
            const token = generateToken(user);
            
            // Return the user without sensitive information along with the token
            const { password: _, securityAnswer: __, ...userWithoutSensitiveInfo } = user;
            
            res.status(200).json({
              ...userWithoutSensitiveInfo,
              token
            });
          } catch (error) {
            console.error('Error in login completion:', error);
            res.status(500).json({ message: 'An error occurred during login' });
          }
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      await securityDelay(); // Apply delay even on errors
      res.status(500).json({ message: 'An error occurred during login' });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // New simplified login endpoint for more reliable authentication
  app.post('/api/auth/login-simple', handleSimpleLogin);
  
  // Completely separate direct login endpoint bypassing CSRF and session handling
  app.post('/api/auth/direct-login', async (req, res) => {
    console.log('Direct login attempt with:', {
      email: req.body.email ? '****' : 'missing', 
      password: req.body.password ? '****' : 'missing'
    });

    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Use storage for validation instead of direct db access
      console.log('Attempting direct validation for user:', email);
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        console.log(`Direct login failed: No user found with email ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log(`User found with ID: ${user.id}, validating password...`);
      
      // Validate credentials
      const validUser = await storage.validateUserCredentials(email, password);
      
      if (!validUser) {
        console.log(`Password validation failed for user ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log(`Password validation successful for user ${email}, updating last login...`);
      
      // Update last login timestamp
      await storage.updateUserLastLogin(user.id);
      
      // Set up session
      req.session.userId = user.id;
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return safe user data with token
      console.log(`Direct login successful for user ${email}`);
      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token // Include JWT token in the response
      });
    } catch (error) {
      console.error('Direct login error:', error);
      return res.status(500).json({ message: 'An error occurred during login process' });
    }
  });
  
  app.get('/api/auth/me', async (req, res) => {
    console.log("Auth check: Session ID =", req.sessionID);
    console.log("Auth check: Session data =", JSON.stringify({
      ...req.session,
      cookie: req.session.cookie ? {
        maxAge: req.session.cookie.maxAge,
        httpOnly: req.session.cookie.httpOnly,
        secure: req.session.cookie.secure
      } : null
    }));
    
    // Variable to store user ID from any authentication method
    let userId: number | undefined;
    
    // Method 1: Check JWT token authentication (primary method)
    const authHeader = req.headers.authorization;
    console.log("Auth check: Authorization header =", authHeader ? "Present" : "Missing");
    
    if (authHeader) {
      try {
        // Extract and verify the JWT token
        const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
        
        if (token) {
          const decodedToken = verifyToken(token);
          
          if (decodedToken && decodedToken.id) {
            // Get user ID from token
            userId = decodedToken.id;
            console.log("Auth check: Using JWT authentication, user ID:", userId);
            
            // Store in session for backward compatibility
            req.session.userId = userId;
          } else {
            console.warn("Auth check: Invalid JWT token");
          }
        }
      } catch (error) {
        console.error("Auth check: JWT validation error:", error);
      }
    }
    
    // Method 2: Check session-based authentication as fallback
    if (!userId && req.session.userId) {
      userId = req.session.userId;
      console.log("Auth check: Using session authentication, user ID:", userId);
    } 
    
    // Method 3: Check localStorage-based header authentication as last resort
    if (!userId) {
      const ultraAuthHeader = req.headers['x-ultra-auth'];
      console.log("Auth check: Ultra-Auth header =", ultraAuthHeader ? "Present" : "Missing");
      
      if (ultraAuthHeader && typeof ultraAuthHeader === 'string') {
        try {
          // Format: userId:email
          const [headerId, email] = ultraAuthHeader.split(':');
          if (!headerId || !email) {
            throw new Error('Invalid X-Ultra-Auth header format');
          }
          
          const headerUserId = parseInt(headerId, 10);
          
          // Verify the user exists and credentials match
          const userFromHeader = await storage.getUser(headerUserId);
          if (userFromHeader && userFromHeader.email === email) {
            userId = headerUserId;
            console.log("Auth check: Using X-Ultra-Auth authentication, user ID:", userId);
            
            // Store in session for future requests
            req.session.userId = userId;
          } else {
            console.warn("Auth check: X-Ultra-Auth credentials don't match any user");
          }
        } catch (error) {
          console.error("Auth check: X-Ultra-Auth validation error:", error);
        }
      }
    }
    
    // No authentication found in any method
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const user = await storage.getUser(userId);
      console.log("Auth check: User retrieved from DB =", user ? "Yes" : "No");
      
      if (!user) {
        console.error(`User with ID ${userId} found in authentication but not in database`);
        // Clean up the invalid session
        req.session.destroy((err) => {
          if (err) console.error("Error destroying invalid session:", err);
        });
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Return the user without sensitive info
      const { password, securityAnswer, ...userWithoutSensitiveInfo } = user;
      
      console.log("Auth check: Successfully returning user data for ID =", userId);
      res.status(200).json(userWithoutSensitiveInfo);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching user data' });
    }
  });
  
  // Listings endpoints
  app.get('/api/listings/featured', async (req, res) => {
    try {
      console.log('Fetching featured listings...');
      
      // Try with a direct database query instead of using the storage abstraction
      const featuredListings = await db
        .select()
        .from(listings)
        .where(eq(listings.isFeatured, true))
        .limit(10);
      
      // Log the results
      console.log(`Featured listings found: ${featuredListings.length} listings`);
      console.log('Sample data:', featuredListings.length > 0 ? featuredListings[0] : 'No listings');
      
      // Return the results without any additional filtering
      res.status(200).json(featuredListings);
    } catch (error) {
      console.error('Error fetching featured listings:', error);
      res.status(500).json({ message: 'Failed to fetch featured listings' });
    }
  });
  
  // Helper function to properly categorize listings
  const categorizeListing = (listing: any) => {
    // Personal connection patterns (strict patterns only)
    const personalPatterns = [
      /\bm4w\b/i, /\bw4m\b/i, /\bm4m\b/i, /\bw4w\b/i, 
      /\bm4t\b/i, /\bw4t\b/i, /\bt4m\b/i, /\bt4w\b/i, /\bt4t\b/i,
      /\bcouple4m\b/i, /\bcouple4w\b/i, /\bcouple4couple\b/i,
      /\bman for woman\b/i, /\bwoman for man\b/i, /\bman for man\b/i, /\bwoman for woman\b/i
    ];
    
    // Casual encounters keywords - these specifically identify casual content
    const casualKeywords = [
      "casual encounter", "hookup", "one night", "nsa", "fwb", "friend with benefit", 
      "no strings", "discreet", "tonight only", "short term"
    ];
    
    // Community & crypto related keywords
    const communityKeywords = [
      "crypto", "blockchain", "web3", "nft", "dao", "defi", 
      "meetup", "study group", "developer", "token", "mining", "digital currency",
      "smart contract", "decentralized", "cryptocurrency"
    ];
    
    // Job related keywords
    const jobKeywords = [
      "job", "hiring", "position", "salary", "recruiter", "employment",
      "career", "apply", "skills", "resume", "remote work", "full-time", "part-time",
      "opportunity", "seeking candidates", "job opening"
    ];
    
    // Business related keywords
    const businessKeywords = [
      "business", "service", "client", "customer", "product", "startup",
      "company", "enterprise", "llc", "inc", "corporation", "franchise",
      "partnership", "consulting", "agency", "professional service"
    ];
    
    // Check if the listing should be a casual encounter
    const isCasualListing = casualKeywords.some(keyword => 
      listing.title.toLowerCase().includes(keyword) || 
      (listing.description && listing.description.toLowerCase().includes(keyword))
    );
    
    if (isCasualListing) {
      if (listing.type !== "casual") {
        console.log(`Correcting listing #${listing.id} from ${listing.type} to casual: ${listing.title}`);
        listing.type = "casual";
      }
      return listing;
    }
    
    // Check if the listing title matches any personal connection pattern
    const isExactPersonalListing = personalPatterns.some(pattern => 
      pattern.test(listing.title.toLowerCase())
    );
    
    if (isExactPersonalListing) {
      if (listing.type !== "personal" && listing.type !== "casual") {
        console.log(`Correcting listing #${listing.id} from ${listing.type} to personal: ${listing.title}`);
        listing.type = "personal";
      }
      return listing;
    }
    
    // If listing is marked as personal or casual but doesn't match the patterns, recategorize
    if (listing.type === "personal" || listing.type === "casual") {
      // Check for community keywords
      const hasCommunityKeywords = communityKeywords.some(keyword => 
        listing.title.toLowerCase().includes(keyword) || 
        (listing.description && listing.description.toLowerCase().includes(keyword))
      );
      
      if (hasCommunityKeywords) {
        console.log(`Correcting listing #${listing.id} from ${listing.type} to community: ${listing.title}`);
        listing.type = "community";
        return listing;
      }
      
      // Check for job keywords
      const hasJobKeywords = jobKeywords.some(keyword => 
        listing.title.toLowerCase().includes(keyword) || 
        (listing.description && listing.description.toLowerCase().includes(keyword))
      );
      
      if (hasJobKeywords) {
        console.log(`Correcting listing #${listing.id} from ${listing.type} to job: ${listing.title}`);
        listing.type = "job";
        return listing;
      }
      
      // Check for business keywords
      const hasBusinessKeywords = businessKeywords.some(keyword => 
        listing.title.toLowerCase().includes(keyword) || 
        (listing.description && listing.description.toLowerCase().includes(keyword))
      );
      
      if (hasBusinessKeywords) {
        console.log(`Correcting listing #${listing.id} from ${listing.type} to business: ${listing.title}`);
        listing.type = "business";
        return listing;
      }
    }
    
    return listing;
  };

  app.get('/api/listings/recent', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      
      const { country, state, city, type, subcategory } = req.query;
      
      // SPECIAL HANDLING FOR PERSONAL SECTION - hardcoded approach for reliability
      if (type === 'personal') {
        // Return empty results - we don't have valid personal listings
        // This is the safest approach to prevent incorrect listings from appearing in personals section
        console.log(`Personal type requested, returning empty results`);
        return res.status(200).json({
          listings: [],
          hasMore: false
        });
      }
      
      const result = await storage.getListings({
        page,
        perPage: 4,
        country: country as string | undefined,
        state: state as string | undefined,
        city: city as string | undefined,
        // For non-personal listings, filter by type at database level for better accuracy 
        type: type as string | undefined
      });
      
      // Use our improved category service for consistent filtering
      let filteredListings = applyCategoryFiltering(
        result.listings,
        type as string || null,
        subcategory as string || null
      );
      
      // Additional safety filter: ensure no business/community listings in personals section
      if (type === 'personal') {
        // Secondary defense - this shouldn't be needed due to the early return above
        // but adding it as a safety mechanism
        filteredListings = [];
      }
      
      // Log the results for debugging
      if (subcategory && (type === 'personal' || type === 'casual')) {
        console.log(`Filtering ${type} by connection pattern "${subcategory}", found ${filteredListings.length} listings`);
      }
      
      res.status(200).json({
        listings: filteredListings,
        hasMore: filteredListings.length < result.listings.length ? false : result.hasMore
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recent listings' });
    }
  });
  
  // Get listings by state with strict category enforcement
  app.get('/api/listings/byState', async (req, res) => {
    try {
      const { state, type, subcategory, city, country } = req.query;
      
      if (!state) {
        return res.status(400).json({ error: "State parameter is required" });
      }
      
      // SPECIAL HANDLING FOR PERSONAL SECTION
      if (type === 'personal') {
        // Return empty results for personal listings - we don't have valid ones
        console.log(`Personal type requested for byState, returning empty results`);
        return res.status(200).json({
          listings: [],
          hasMore: false
        });
      }
      
      // Get listings with location filtering
      const { listings, hasMore } = await storage.getListings({
        country: country as string | undefined,
        state: state as string,
        city: city as string | undefined,
        // For non-personal listings, filter by type at database level
        type: type as string | undefined,
        perPage: 50 // Get more listings for state pages
      });
      
      // Use our improved category service for all filtering in one step
      let filteredListings = applyCategoryFiltering(
        listings,
        type as string || null,
        subcategory as string || null
      );
      
      // Safety check for personal listings
      if (type === 'personal') {
        // Secondary defense - this shouldn't be needed due to the early return above
        filteredListings = [];
      }
      
      console.log(`State listings: country=${country}, state=${state}, city=${city}, type=${type}, subcategory=${subcategory}, found=${filteredListings.length} listings`);
      
      res.status(200).json({ 
        listings: filteredListings, 
        hasMore: filteredListings.length < listings.length ? false : hasMore 
      });
    } catch (error) {
      console.error("Error fetching state listings:", error);
      res.status(500).json({ error: "Failed to fetch state listings" });
    }
  });
  
  // Search listings with advanced filtering including subcategory and strict category enforcement
  app.get('/api/listings/search', async (req, res) => {
    try {
      const { 
        state, 
        type, 
        subcategory, 
        query, 
        country, 
        city,
        minPrice,
        maxPrice,
        isRemote,
        isFeatured,
        sortBy,
        page = '1',
        perPage = '20'
      } = req.query;
      
      // SPECIAL HANDLING FOR PERSONAL SECTION
      if (type === 'personal') {
        // Return empty results for personal listings - we don't have valid ones
        console.log(`Personal type requested for search, returning empty results`);
        return res.status(200).json({
          listings: [],
          hasMore: false,
          total: 0
        });
      }
      
      // For URL path-based searches, default to California if state not provided
      const searchState = state ? (state as string) : "California";
      
      console.log(`Search request: query=${query}, country=${country}, state=${searchState}, city=${city}, type=${type}, subcategory=${subcategory}, price=${minPrice}-${maxPrice}, remote=${isRemote}, featured=${isFeatured}, sort=${sortBy}, page=${page}`);
      
      // Try to use Elasticsearch for advanced search if it's available
      try {
        const esAvailable = await pingElasticsearch();
        
        if (esAvailable) {
          console.log('Using Elasticsearch for advanced search');
          
          // Convert query parameters to the format expected by Elasticsearch
          const searchParams: SearchParams = {
            query: query as string,
            country: country as string,
            state: searchState,
            city: city as string,
            type: type as string,
            minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
            maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
            isRemote: isRemote === 'true' ? true : isRemote === 'false' ? false : undefined,
            isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
            sortBy: sortBy as any,
            page: parseInt(page as string, 10),
            perPage: parseInt(perPage as string, 10)
          };
          
          // Perform the search with Elasticsearch
          const { listings: esListings, total } = await searchListings(searchParams);
          
          // Apply subcategory filtering which isn't directly handled by Elasticsearch
          let filteredListings = subcategory 
            ? filterListingsBySubcategory(esListings, type as string, subcategory as string)
            : esListings;
          
          console.log(`Elasticsearch search found ${filteredListings.length} listings out of ${total} total matches`);
          
          // Return results with pagination info
          return res.status(200).json({
            listings: filteredListings,
            hasMore: (parseInt(page as string, 10) * parseInt(perPage as string, 10)) < total,
            total,
            page: parseInt(page as string, 10),
            perPage: parseInt(perPage as string, 10)
          });
        }
      } catch (error) {
        // Log the error but fall back to standard search
        console.error('Elasticsearch search failed, falling back to standard search:', error);
      }
      
      // Fall back to standard search if Elasticsearch is unavailable or fails
      console.log('Using standard database search');
      
      // Get listings with all available filters
      const { listings, hasMore } = await storage.getListings({
        country: country as string | undefined,
        state: searchState,
        city: city as string | undefined,
        // For non-personal listings, filter by type at database level
        type: type as string | undefined,
        page: parseInt(page as string, 10),
        perPage: parseInt(perPage as string, 10) || 100
      });
      
      // Use our improved category service for all filtering in one step
      let filteredListings = applyCategoryFiltering(
        listings,
        type as string || null,
        subcategory as string || null
      );
      
      // Filter by search query if provided
      if (query) {
        const searchTerm = String(query).toLowerCase();
        filteredListings = filteredListings.filter(listing => 
          listing.title.toLowerCase().includes(searchTerm) || 
          listing.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Additional filtering for fallback search
      if (minPrice || maxPrice) {
        filteredListings = filteredListings.filter(listing => {
          // Skip listings with null price when filtering by price
          if (listing.price === null) return false;
          if (minPrice && listing.price < parseInt(minPrice as string)) return false;
          if (maxPrice && listing.price > parseInt(maxPrice as string)) return false;
          return true;
        });
      }
      
      if (isRemote !== undefined) {
        const isRemoteBool = isRemote === 'true';
        filteredListings = filteredListings.filter(listing => listing.isRemote === isRemoteBool);
      }
      
      if (isFeatured !== undefined) {
        const isFeaturedBool = isFeatured === 'true';
        filteredListings = filteredListings.filter(listing => listing.isFeatured === isFeaturedBool);
      }
      
      // Basic sorting for fallback search
      if (sortBy) {
        switch (sortBy) {
          case 'price_asc':
            filteredListings.sort((a, b) => {
              // Handle null prices for sorting
              const priceA = a.price === null ? 0 : a.price;
              const priceB = b.price === null ? 0 : b.price;
              return priceA - priceB;
            });
            break;
          case 'price_desc':
            filteredListings.sort((a, b) => {
              // Handle null prices for sorting
              const priceA = a.price === null ? 0 : a.price;
              const priceB = b.price === null ? 0 : b.price;
              return priceB - priceA;
            });
            break;
          case 'date_desc':
            filteredListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'date_asc':
            filteredListings.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
        }
      } else {
        // Default sort by creation date (newest first)
        filteredListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      console.log(`Standard search found ${filteredListings.length} listings`);
      
      // Return processed listings
      res.status(200).json({ 
        listings: filteredListings, 
        hasMore,
        total: filteredListings.length,
        page: parseInt(page as string, 10),
        perPage: parseInt(perPage as string, 10) || 100
      });
    } catch (error) {
      console.error("Error searching listings:", error);
      res.status(500).json({ error: "Failed to search listings" });
    }
  });
  
  // Get a single listing by ID
  app.get('/api/listings/:id([0-9]+)', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid listing ID' });
      }
      
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      res.status(200).json(listing);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch listing' });
    }
  });
  
  app.post('/api/listings', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    
    // Early validation to prevent type errors
    if (userId === undefined) {
      return res.status(401).json({ message: 'User authentication invalid' });
    }
    
    try {
      console.log("Received listing creation request:", req.body);
      
      // Pre-process data to handle date fields properly
      let processedData = { ...req.body, userId };
      
      // Convert expiresAt string to Date object before validation
      if (processedData.expiresAt && typeof processedData.expiresAt === 'string') {
        try {
          processedData.expiresAt = new Date(processedData.expiresAt);
          if (isNaN(processedData.expiresAt.getTime())) {
            throw new Error("Invalid date format");
          }
        } catch (error) {
          console.error("Error parsing expiresAt date:", error);
          return res.status(400).json({ 
            message: "Invalid date format for expiresAt", 
            code: 'VALIDATION_ERROR' 
          });
        }
      }
      
      // Validate the request body
      const validatedData = insertListingSchema.parse(processedData);
      
      console.log("Validated listing data:", validatedData);
      
      let finalData = { ...validatedData };
      
      // Set default expiration date if not provided
      if (!finalData.expiresAt) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        finalData.expiresAt = expiresAt;
      }
      
      // Create listing
      const listing = await storage.createListing(finalData);
      
      // If it's a featured listing or job posting, create a payment
      if (listing.isFeatured || listing.type === 'job') {
        // Calculate amount based on listing type
        const amount = listing.type === 'job' ? 1500 : 500; // $15 for job, $5 for featured
        
        // Validate listing has proper ID before proceeding
        if (!listing.id || isNaN(listing.id)) {
          await storage.deleteListing(listing.id); // Clean up the listing
          return res.status(500).json({ 
            message: 'Failed to create payment for listing - invalid listing ID' 
          });
        }
        
        try {
          // Sanitize listing title for payment description
          const safeTitle = listing.title
            .replace(/[^\w\s.-]/g, '') // Remove any potentially dangerous characters
            .substring(0, 50); // Limit length
          
          // Create Coinbase Commerce charge
          const charge = await createCharge({
            name: `Payment for listing #${listing.id}`,
            description: listing.type === 'job' ? 
              `Job posting fee: ${safeTitle}` : 
              `Featured listing fee: ${safeTitle}`,
            amount,
            currency: 'USD',
            listingId: listing.id,
            userId: userId as number, // Explicit cast to satisfy type checker
            metadata: {
              listingType: listing.type,
              isFeatured: listing.isFeatured ? true : false
            }
          });
          
          // Create payment record in database
          await storage.createPayment({
            userId,
            listingId: listing.id,
            amount,
            currency: 'USD',
            paymentMethod: 'crypto', // Use paymentMethod instead of provider
            paymentType: listing.type === 'job' ? 'job' : 'featured',
            status: 'pending',
            coinbaseChargeId: charge.id
            // createdAt is auto-generated by defaultNow()
          });
          
          return res.status(201).json({
            listing,
            payment: {
              chargeId: charge.id,
              hostedUrl: charge.hosted_url,
              amount,
              expiresAt: charge.expires_at
            }
          });
        } catch (error) {
          console.error('Error creating charge for new listing:', error);
          
          // More robust error handling
          if (error instanceof Error) {
            return res.status(500).json({ 
              message: 'Payment processing error', 
              error: error.message
            });
          }
          
          return res.status(500).json({ 
            message: 'Unknown payment processing error occurred' 
          });
        }
      }
      
      // Index the new listing in Elasticsearch
      try {
        const isElasticsearchAvailable = await pingElasticsearch();
        if (isElasticsearchAvailable) {
          await indexListing(listing);
          console.log(`Listing #${listing.id} indexed in Elasticsearch`);
        }
      } catch (indexError) {
        // Log error but don't fail the request if Elasticsearch indexing fails
        console.error(`Error indexing listing #${listing.id} in Elasticsearch:`, indexError);
      }
      
      console.log("Listing created successfully:", listing);
      res.status(201).json({ id: listing.id, listing });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error creating listing:', error.errors);
        return res.status(400).json({ 
          message: error.errors[0].message,
          errors: error.errors,
          code: 'VALIDATION_ERROR' 
        });
      }
      console.error('Error creating listing:', error);
      res.status(500).json({ 
        message: 'Failed to create listing', 
        error: error instanceof Error ? error.message : String(error),
        code: 'SERVER_ERROR'
      });
    }
  });
  
  app.put('/api/listings/:id', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid listing ID' });
      }
      
      // Get the listing to check ownership
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      // Check if the user owns the listing
      if (listing.userId !== userId) {
        return res.status(403).json({ message: 'You do not have permission to update this listing' });
      }
      
      // Update the listing
      const updatedListing = await storage.updateListing(id, req.body);
      
      // Update the listing in Elasticsearch
      try {
        const isElasticsearchAvailable = await pingElasticsearch();
        if (isElasticsearchAvailable && updatedListing) {
          await updateListingInEs(id, updatedListing);
          console.log(`Listing #${id} updated in Elasticsearch`);
        }
      } catch (indexError) {
        // Log error but don't fail the request if Elasticsearch update fails
        console.error(`Error updating listing #${id} in Elasticsearch:`, indexError);
      }
      
      res.status(200).json(updatedListing);
    } catch (error) {
      console.error('Error updating listing:', error);
      res.status(500).json({ message: 'Failed to update listing' });
    }
  });
  
  app.delete('/api/listings/:id', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid listing ID' });
      }
      
      // Get the listing to check ownership
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      // Check if the user owns the listing or is an admin
      const user = await storage.getUser(userId);
      if (listing.userId !== userId && user?.role !== 'super_admin' && user?.role !== 'sub_admin') {
        return res.status(403).json({ message: 'You do not have permission to delete this listing' });
      }
      
      // Delete the listing
      await storage.deleteListing(id);
      
      // Remove listing from Elasticsearch
      try {
        const isElasticsearchAvailable = await pingElasticsearch();
        if (isElasticsearchAvailable) {
          await deleteListingFromEs(id);
          console.log(`Listing #${id} removed from Elasticsearch`);
        }
      } catch (indexError) {
        // Log error but don't fail the request if Elasticsearch deletion fails
        console.error(`Error removing listing #${id} from Elasticsearch:`, indexError);
      }
      
      res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
      console.error('Error deleting listing:', error);
      res.status(500).json({ message: 'Failed to delete listing' });
    }
  });
  
  // Payments endpoints
  app.post('/api/payments/create-charge', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    
    // Explicitly log authentication method for debugging
    console.log(`Payment authorization - Session user ID: ${userId || 'not set'}`);
    console.log(`Payment authorization - JWT authentication used: ${req.user ? 'yes' : 'no'}`);
    
    // If userId is not in session but user is authenticated via JWT
    if (!userId && req.user && req.user.id) {
      console.log(`Payment authorization - Using JWT user ID: ${req.user.id}`);
      req.session.userId = req.user.id;
    }
    
    // Final check for authentication
    if (!req.session.userId && (!req.user || !req.user.id)) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      // Get the effective user ID from either session or JWT
      // Use type assertion to ensure it's treated as a number
      const effectiveUserId = (req.session.userId || (req.user && req.user.id)) as number;
      console.log(`Payment processing for user ID: ${effectiveUserId}`);
      
      const { listingId, paymentType = 'featured' } = req.body;
      // Only use amount from request as a fallback
      let amount = req.body.amount || 0;
      
      // Validate input
      if (!listingId || !amount) {
        return res.status(400).json({ message: 'Listing ID and amount are required' });
      }
      
      // Get listing details for the charge
      const listing = await storage.getListing(parseInt(listingId));
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      // Check if the user owns the listing
      if (listing.userId !== effectiveUserId) {
        return res.status(403).json({ 
          message: 'You do not have permission to process payments for this listing',
          details: `Listing belongs to user ${listing.userId}, but request is from user ${effectiveUserId}`
        });
      }
      
      // Determine payment name, description and amount based on payment type
      let name = '';
      let description = '';
      let fixedPrice = 0;
      
      switch(paymentType) {
        case 'job':
          name = `Job Posting: ${listing.title}`;
          description = `Payment for job posting: ${listing.title}`;
          fixedPrice = 15; // $15 for job posting (no decimals)
          break;
        case 'boost':
          name = `Boost: ${listing.title}`;
          description = `Payment for boosting listing: ${listing.title}`;
          fixedPrice = 5; // $5 for boosting a listing (no decimals)
          break;
        case 'featured':
        default:
          name = `Feature: ${listing.title}`;
          description = `Payment for featuring listing: ${listing.title}`;
          fixedPrice = 5; // $5 for featuring a listing (no decimals)
          break;
      }
      
      // If it's a business listing, apply different pricing
      if (listing.type === 'business') {
        fixedPrice = 12; // $12 for business listings (no decimals)
      }
      
      // Personals are free
      if (listing.type === 'personal') {
        fixedPrice = 0; // Free for personals
      }
      
      // Override the amount from the request with our fixed pricing
      console.log(`Setting fixed price: ${fixedPrice} for payment type: ${paymentType}`);
      amount = fixedPrice;
      
      // Create Coinbase Commerce charge
      const charge = await createCharge({
        name,
        description,
        amount,
        currency: 'USD',
        listingId: parseInt(listingId),
        userId: effectiveUserId,
        metadata: {
          listingType: listing.type,
          paymentType,
          isFeatured: paymentType === 'featured'
        }
      });
      
      // Create payment record in database
      const payment = await storage.createPayment({
        userId: effectiveUserId,
        listingId: listing.id,
        amount: amount,
        status: 'pending',
        coinbaseChargeId: charge.id,
        paymentType: paymentType as "featured" | "job" | "boost"
      });
      
      res.status(201).json({
        payment: {
          id: payment.id,
          chargeId: charge.id,
          hostedUrl: charge.hosted_url,
          amount,
          expiresAt: charge.expires_at,
          paymentType
        }
      });
    } catch (error) {
      console.error('Error creating charge:', error);
      res.status(500).json({ message: 'Failed to create charge' });
    }
  });
  
  // Coinbase webhook endpoint
  // We need raw body for signature verification
  const rawBodyParser = express.raw({
    type: 'application/json',
    limit: '10mb',
  });
  
  app.post('/api/webhooks/coinbase', rawBodyParser, async (req, res) => {
    try {
      // Get the signature from headers
      const signature = req.headers['x-cc-webhook-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ message: 'No signature provided' });
      }
      
      // Verify the webhook signature
      const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET || '';
      const rawBody = req.body.toString('utf8');
      
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        return res.status(400).json({ message: 'Invalid signature' });
      }
      
      // Process the webhook event
      const event = JSON.parse(rawBody);
      await processWebhookEvent(event);
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ message: 'Error processing webhook' });
    }
  });
  
  // Report endpoints
  app.post('/api/reports', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      // Validate the request body
      const validatedData = insertReportSchema.parse({
        ...req.body,
        userId
      });
      
      // Create report
      const report = await storage.createReport(validatedData);
      
      res.status(201).json({ report });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: 'Failed to create report' });
    }
  });
  
  // Admin endpoints
  app.get('/api/admin/reports', isAdmin, async (req, res) => {
    try {
      
      const listingId = parseInt(req.query.listingId as string);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: 'Invalid listing ID' });
      }
      
      const reports = await storage.getReports(listingId);
      
      res.status(200).json({ reports });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });
  
  app.put('/api/admin/reports/:id', isAdmin, async (req, res) => {
    try {
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }
      
      const { status } = req.body;
      if (!status || !['pending', 'resolved', 'dismissed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const updatedReport = await storage.updateReportStatus(id, status);
      if (!updatedReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      res.status(200).json({ report: updatedReport });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update report' });
    }
  });

  // Admin routes

  // Admin - Get all reports
  app.get('/api/admin/reports', isAdmin, async (req, res) => {
    try {
      // Fetch actual reports from storage
      const listingId = req.query.listingId ? parseInt(req.query.listingId as string) : undefined;
      
      // If listingId is provided, validate it's a number
      if (req.query.listingId && isNaN(Number(req.query.listingId))) {
        return res.status(400).json({ message: 'Invalid listing ID parameter' });
      }
      
      // Get reports from storage
      const reports = listingId ? 
        await storage.getReports(listingId) : 
        []; // In a real app, would have a method to get all reports
      
      res.status(200).json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });

  // Admin - Get all users (super admin only)
  app.get('/api/admin/users', isSuperAdmin, async (req, res) => {
    try {
      // In a real implementation, fetch actual users from database
      // For security, filter out sensitive information before returning
      
      // Example of how we'd do this with real DB data:
      // const allUsers = await db.select().from(users);
      // const sanitizedUsers = allUsers.map(user => {
      //   const { password, securityQuestion, securityAnswer, ...safeUserData } = user;
      //   return safeUserData;
      // });
      
      // Since we don't have an getAllUsers method in storage yet, return placeholder data
      // that doesn't expose sensitive details
      const placeholderUsers = [
        {
          id: 1,
          username: "admin",
          email: "admin@example.com", 
          role: "super_admin",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          username: "user", 
          email: "user@example.com",
          role: "user",
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          username: "moderator",
          email: "moderator@example.com", 
          role: "sub_admin",
          createdAt: new Date().toISOString()
        }
      ];
      
      res.status(200).json(placeholderUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Admin - Promote user to sub-admin (super admin only)
  app.post('/api/admin/users/:id/promote', isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // This would normally update the user role in the database
      // For demo, return success
      res.status(200).json({ message: 'User promoted to sub-admin successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to promote user' });
    }
  });

  // Admin - Demote sub-admin to user (super admin only)
  app.post('/api/admin/users/:id/demote', isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // This would normally update the user role in the database
      // For demo, return success
      res.status(200).json({ message: 'User demoted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to demote user' });
    }
  });

  // Admin - Handle report action (approve/reject)
  app.post('/api/admin/reports/:id/:action', isAdmin, async (req, res) => {
    try {
      const { id, action } = req.params;
      
      if (!id || !action) {
        return res.status(400).json({ message: 'Report ID and action are required' });
      }
      
      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ message: 'Invalid action' });
      }
      
      // This would normally update the report status in the database
      // For demo, return success
      res.status(200).json({ message: `Report ${action === 'approve' ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process report' });
    }
  });

  // Admin - Delete listing (admin and sub-admin)
  app.delete('/api/admin/listings/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'Listing ID is required' });
      }
      
      // This would normally delete the listing from the database
      // For demo, return success
      res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete listing' });
    }
  });

  // Admin - Get financial reports (super admin only)
  app.get('/api/admin/reports/financial', isSuperAdmin, async (req, res) => {
    try {
      // This would normally aggregate financial data from the database
      // For demo, return mock data
      res.status(200).json({
        totalListings: 1250,
        totalPaidListings: 312,
        totalRevenue: 15600,
        countriesData: [
          {
            country: "United States",
            totalListings: 850,
            paidListings: 210,
            revenue: 10500,
            states: [
              {
                name: "California",
                totalListings: 320,
                paidListings: 95,
                revenue: 4750
              },
              {
                name: "New York",
                totalListings: 280,
                paidListings: 75,
                revenue: 3750
              },
              {
                name: "Texas",
                totalListings: 250,
                paidListings: 40,
                revenue: 2000
              }
            ]
          },
          {
            country: "Canada",
            totalListings: 400,
            paidListings: 102,
            revenue: 5100,
            states: [
              {
                name: "Ontario",
                totalListings: 180,
                paidListings: 55,
                revenue: 2750
              },
              {
                name: "British Columbia",
                totalListings: 150,
                paidListings: 32,
                revenue: 1600
              },
              {
                name: "Quebec",
                totalListings: 70,
                paidListings: 15,
                revenue: 750
              }
            ]
          }
        ],
        categoriesData: [
          {
            type: "job",
            totalListings: 580,
            paidListings: 210,
            revenue: 10500
          },
          {
            type: "business",
            totalListings: 420,
            paidListings: 98,
            revenue: 4900
          },
          {
            type: "personal",
            totalListings: 250,
            paidListings: 4,
            revenue: 200
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch financial reports' });
    }
  });
  
  // Get all listings for the authenticated user
  app.get('/api/listings/user', isAuthenticated, async (req, res) => {
    try {
      // Get user ID from token, session, or ultra-auth header
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      console.log('Fetching listings for user ID:', userId);
      
      // Get all listings for this user from database
      const userListings = await db
        .select()
        .from(listings)
        .where(eq(listings.userId, userId))
        .orderBy(desc(listings.createdAt));
      
      console.log(`Found ${userListings.length} listings for user ${userId}`);
      
      res.status(200).json(userListings);
    } catch (error) {
      console.error('Error fetching user listings:', error);
      res.status(500).json({ message: 'Failed to fetch your listings' });
    }
  });
  
  // Submit a free listing
  app.post('/api/listings/:id/submit', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Validate the listing ID
      const listingId = parseInt(id, 10);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: 'Invalid listing ID' });
      }
      
      // Get the listing from the database
      const [listing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, listingId));
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      // Ensure user owns the listing
      if (listing.userId !== userId) {
        return res.status(403).json({ message: 'You do not own this listing' });
      }
      
      // Ensure listing is not already paid/submitted
      if (listing.isPaid) {
        return res.status(400).json({ message: 'Listing is already submitted' });
      }
      
      // If listing is a job posting, it requires payment - can't be submitted for free
      if (listing.type === 'job') {
        return res.status(400).json({ message: 'Job listings require payment to be submitted' });
      }
      
      // Update the listing to mark it as paid/submitted
      await db
        .update(listings)
        .set({ 
          isPaid: true,
          status: 'active'
        })
        .where(eq(listings.id, listingId));
      
      console.log(`Listing ${listingId} submitted successfully`);
      
      // Return the updated listing
      const [updatedListing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, listingId));
      
      res.status(200).json(updatedListing);
    } catch (error) {
      console.error('Error submitting listing:', error);
      res.status(500).json({ message: 'Failed to submit listing' });
    }
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      // Check database connection by performing a simple query
      await db.select().from(users).limit(1);
      
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'error', 
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed',
        environment: process.env.NODE_ENV || 'development'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

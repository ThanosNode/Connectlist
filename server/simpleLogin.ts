import { Request, Response } from 'express';
import { storage } from './storage';
import { generateToken } from './utils/jwt';

/**
 * Simplified login handler that bypasses some of the more complex session handling
 * This provides an alternative path for authentication when the standard flow fails
 */
export async function handleSimpleLogin(req: Request, res: Response) {
  try {
    console.log('Simple login attempt with:', {
      email: req.body.email ? '****' : 'missing',
      password: req.body.password ? '****' : 'missing',
      session_id: req.sessionID,
      session_cookie: req.session.cookie ? 'exists' : 'missing',
      session_state: JSON.stringify(req.session)
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Simple login failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // First check if user exists
    const userExists = await storage.getUserByEmail(email);
    
    if (!userExists) {
      console.log('Simple login failed: User not found with email', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found with email', email, 'attempting to validate password');
    
    // Validate credentials against our storage
    const user = await storage.validateUserCredentials(email, password);

    if (!user) {
      console.log('Simple login failed: Invalid password for email', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If we have a valid user, update the last login timestamp
    const updatedUser = await storage.updateUserLastLogin(user.id);
    
    console.log('Simple login successful for user ID:', user.id);
    
    // Manually set up the session
    req.session.userId = user.id;
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Clear sensitive information before sending back
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLogin: updatedUser?.lastLogin || user.lastLogin,
      token: token // Include JWT token in the response
    };
    
    console.log('Session after login:', {
      session_id: req.sessionID,
      user_id: req.session.userId,
      session_state: JSON.stringify(req.session)
    });

    return res.status(200).json(safeUser);
  } catch (error) {
    console.error('Simple login error:', error);
    return res.status(500).json({ message: 'An error occurred during login process' });
  }
}
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';

/**
 * JWT Authentication Middleware
 * Attempts authentication using multiple methods:
 * 1. JWT from Authorization header (primary method)
 * 2. Session-based authentication (backward compatibility)
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Method 1: Check for JWT in Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decodedToken = verifyToken(token);
      if (decodedToken && decodedToken.id) {
        // Verify the user exists in the database
        const user = await storage.getUser(decodedToken.id);
        if (user) {
          // Set user ID in request for later use
          req.session.userId = user.id;
          console.log('Authentication via JWT token for user ID:', user.id);
          return next();
        }
      }
    }
    
    // Method 2: Check session-based authentication (backward compatibility)
    if (req.session.userId) {
      console.log('Authentication via session for user ID:', req.session.userId);
      return next();
    }
    
    // No valid authentication found
    return res.status(401).json({ message: 'Not authenticated' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication error' });
  }
};

/**
 * Admin role validation middleware
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First verify the user is authenticated
    let userId: number | undefined;
    
    // Method 1: Check for JWT in Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decodedToken = verifyToken(token);
      if (decodedToken && decodedToken.id) {
        userId = decodedToken.id;
      }
    }
    
    // Method 2: Check session-based authentication
    if (!userId && req.session.userId) {
      userId = req.session.userId;
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
    
    // Set user ID in request for later use if not already set
    req.session.userId = userId;
    
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ message: 'Authorization error' });
  }
};

/**
 * Super admin role validation middleware
 */
export const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First verify the user is authenticated
    let userId: number | undefined;
    
    // Method 1: Check for JWT in Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decodedToken = verifyToken(token);
      if (decodedToken && decodedToken.id) {
        userId = decodedToken.id;
      }
    }
    
    // Method 2: Check session-based authentication
    if (!userId && req.session.userId) {
      userId = req.session.userId;
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
    
    // Set user ID in request for later use if not already set
    req.session.userId = userId;
    
    next();
  } catch (error) {
    console.error('Super admin authorization error:', error);
    return res.status(500).json({ message: 'Authorization error' });
  }
};
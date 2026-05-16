import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@shared/schema';

// Secret should be loaded from environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-for-connectlist';
// Token expiration time (8 hours by default)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Using SignOptions from jsonwebtoken

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  // Create payload with user information (avoid sensitive data)
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };
  
  // Sign and return the token with properly typed options
  return jwt.sign(
    payload, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Extract token from authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  // Check if it's in the format "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
}
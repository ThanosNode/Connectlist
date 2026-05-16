import { Request, Response } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * Direct database validation for user credentials
 * This provides a bypass for the standard authentication flow
 */
export async function directValidateUserCredentials(email: string, password: string) {
  try {
    console.log(`Attempting direct validation for: ${email}`);
    
    // Direct database query to get the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user) {
      console.log(`Direct validation failed: No user found with email ${email}`);
      return null;
    }
    
    console.log(`User found with ID: ${user.id}, now comparing password...`);
    
    // Compare passwords
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log(`Password validation failed for user ${email}`);
        return null;
      }
      
      console.log(`Password validation successful for user ${email}`);
      
      // Update last login directly in DB
      await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user.id));
      
      return user;
    } catch (error) {
      console.error(`Password comparison error:`, error);
      return null;
    }
  } catch (error) {
    console.error(`Direct validation error:`, error);
    return null;
  }
}

/**
 * Simplified direct login handler
 */
export async function directLoginHandler(req: Request, res: Response) {
  try {
    console.log('Direct login attempt with:', {
      email: req.body.email ? '****' : 'missing',
      password: req.body.password ? '****' : 'missing'
    });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Use direct validation approach
    const user = await directValidateUserCredentials(email, password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set up session
    req.session.userId = user.id;
    
    // Return safe user data
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Direct login error:', error);
    return res.status(500).json({ message: 'An error occurred during login process' });
  }
}
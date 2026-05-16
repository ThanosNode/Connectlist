/**
 * Emergency authentication endpoint
 * This file provides a direct DB login option that bypasses 
 * CSRF checks and other middleware
 */

import express from 'express';
import bcrypt from 'bcrypt';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from './utils/jwt';

export const emergencyRouter = express.Router();

// Emergency login - direct DB check with no CSRF or other middleware
emergencyRouter.post('/api/emergency-login', async (req, res) => {
  try {
    console.log('EMERGENCY LOGIN ATTEMPT for email:', req.body.email ? '****' : 'missing');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Direct database query
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user) {
      console.log(`Emergency login failed: No user found with email ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Emergency login failed: Invalid password for ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));
    
    // Set up session
    if (req.session) {
      req.session.userId = user.id;
    }
    
    console.log(`🔑 EMERGENCY LOGIN SUCCESSFUL for user ${email} (id: ${user.id})`);
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token // Include JWT token in the response
      }
    });
  } catch (error) {
    console.error('Emergency login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during emergency login'
    });
  }
});
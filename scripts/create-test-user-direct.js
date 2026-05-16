/**
 * Create a test user with direct database access
 * Run this script using: node scripts/create-test-user-direct.js
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Hash password and security answer
    const hashedPassword = await bcrypt.hash('password123', 12);
    const hashedSecurityAnswer = await bcrypt.hash('fluffy', 12);
    
    // Use direct SQL to avoid schema issues
    const result = await pool.query(`
      INSERT INTO users (
        username, 
        email, 
        password, 
        security_question, 
        security_answer, 
        role,
        created_at,
        last_login
      ) VALUES (
        'testuser', 
        'test@example.com', 
        $1, 
        'first-pet', 
        $2, 
        'user',
        NOW(),
        NOW()
      ) 
      ON CONFLICT (email) DO UPDATE 
      SET 
        password = $1,
        security_answer = $2,
        last_login = NOW()
      RETURNING id, email, username;
    `, [hashedPassword, hashedSecurityAnswer]);
    
    console.log('Test user created or updated successfully:', result.rows[0]);
    console.log('\nLogin credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('Security Question: What was the name of your first pet?');
    console.log('Security Answer: fluffy');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

// Self-invoking function to allow for async/await at the top level
(async () => {
  await createTestUser();
})();
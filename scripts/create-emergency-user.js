/**
 * Create an emergency test user with direct database access
 * This bypasses all CSRF and authentication checks
 * 
 * Run this script using: node scripts/create-emergency-user.js
 */
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function createEmergencyUser() {
  // Connect to database
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('Connected to database');
    
    // Generate password hash
    const password = 'emergency123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user with current timestamp
    const now = new Date();
    
    // SQL to insert the user
    const result = await pool.query(
      `INSERT INTO users (
        username, 
        email, 
        password, 
        "securityQuestion", 
        "securityAnswer", 
        role, 
        "lastLogin", 
        verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, email, role`,
      [
        'emergency_user', 
        'emergency@test.com', 
        passwordHash, 
        'first-pet', 
        'fluffy', 
        'user', 
        now,
        true
      ]
    );
    
    const user = result.rows[0];
    
    console.log('✅ Emergency user created successfully:');
    console.log(user);
    console.log('\nLogin credentials:');
    console.log('Email: emergency@test.com');
    console.log('Password: emergency123');
    console.log('Security Question: What was the name of your first pet?');
    console.log('Security Answer: fluffy');
    
  } catch (error) {
    console.error('Error creating emergency user:', error);
  } finally {
    // Close pool
    await pool.end();
  }
}

createEmergencyUser().catch(console.error);
/**
 * Create a test user for development
 * Run this script using: node scripts/create-test-user.js
 */

import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'test@example.com')
    });

    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Insert test user
    const newUser = await db.insert(users).values({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
      lastLogin: new Date()
    }).returning();

    console.log('Test user created successfully:', newUser[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

// Self-invoking async function
(async () => {
  await createTestUser();
})();
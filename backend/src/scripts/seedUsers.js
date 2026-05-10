/**
 * Seed Users Script
 *
 * Creates the 3 initial user accounts that match the frontend login credentials.
 * Run once after first deployment: npm run seed:users
 *
 * Idempotent — skips users that already exist.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const USERS = [
  {
    email: 'collector@example.com',
    password: 'password',
    name: 'John Collector',
    role: 'collector'
  },
  {
    email: 'processor@example.com',
    password: 'password',
    name: 'Jane Processor',
    role: 'processor'
  },
  {
    email: 'admin@example.com',
    password: 'password',
    name: 'Admin User',
    role: 'admin'
  }
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected.\n');

  for (const userData of USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⏭️  User already exists: ${userData.email} (${userData.role})`);
    } else {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }
  }

  console.log('\nDone. You can now login with these credentials.');
  console.log('All passwords: "password"\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

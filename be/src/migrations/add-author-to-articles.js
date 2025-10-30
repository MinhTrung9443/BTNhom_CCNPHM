/**
 * Migration: Add author field to existing articles
 * Run this once to update existing articles with author field
 */

import mongoose from 'mongoose';
import Article from '../models/Article.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateArticles() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the first admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`📝 Found admin user: ${adminUser.name} (${adminUser.email})`);

    // Update all articles without author field
    const result = await Article.updateMany(
      { author: { $exists: false } },
      { $set: { author: adminUser._id } }
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Updated ${result.modifiedCount} articles`);
    console.log(`   - All articles now have author: ${adminUser.name}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateArticles();

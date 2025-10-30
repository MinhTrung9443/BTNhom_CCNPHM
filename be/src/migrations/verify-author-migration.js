/**
 * Verification Script: Check if author migration was successful
 */

import mongoose from 'mongoose';
import Article from '../models/Article.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyMigration() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count total articles
    const totalArticles = await Article.countDocuments();
    console.log(`📊 Total articles: ${totalArticles}`);

    // Count articles with author
    const articlesWithAuthor = await Article.countDocuments({ author: { $exists: true } });
    console.log(`✅ Articles with author: ${articlesWithAuthor}`);

    // Count articles without author
    const articlesWithoutAuthor = await Article.countDocuments({ author: { $exists: false } });
    console.log(`❌ Articles without author: ${articlesWithoutAuthor}\n`);

    if (articlesWithoutAuthor > 0) {
      console.log('⚠️  WARNING: Some articles are missing author field!');
      console.log('   Please run the migration script: node src/migrations/add-author-to-articles.js\n');
    } else {
      console.log('🎉 SUCCESS: All articles have author field!\n');
    }

    // Show sample articles with author info
    console.log('📝 Sample articles with author:');
    const sampleArticles = await Article.find()
      .populate('author', 'name email role')
      .limit(3)
      .select('title author createdAt')
      .lean();

    sampleArticles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   Author: ${article.author?.name || 'N/A'} (${article.author?.email || 'N/A'})`);
      console.log(`   Role: ${article.author?.role || 'N/A'}`);
      console.log(`   Created: ${article.createdAt}`);
    });

    console.log('\n✅ Verification completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyMigration();

/**
 * Script to clean up duplicate notifications from the database
 * Run this once to remove existing duplicates before the unique index is applied
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './src/models/Notification.js';

dotenv.config();

async function cleanupDuplicateNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find duplicate notifications for comment moderation
    const pipeline = [
      {
        $match: {
          type: 'article',
          subType: 'status_update'
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            subType: '$subType',
            referenceId: '$referenceId',
            recipientUserId: '$recipientUserId'
          },
          notifications: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ];

    const duplicates = await Notification.aggregate(pipeline);
    console.log(`Found ${duplicates.length} groups with duplicate notifications`);

    let totalDeleted = 0;

    for (const group of duplicates) {
      // Sort by createdAt and keep the first one (oldest)
      const sortedNotifications = group.notifications.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      // Delete all except the first one
      const idsToDelete = sortedNotifications.slice(1).map(n => n._id);
      
      if (idsToDelete.length > 0) {
        const result = await Notification.deleteMany({
          _id: { $in: idsToDelete }
        });
        
        totalDeleted += result.deletedCount;
        console.log(`Deleted ${result.deletedCount} duplicate(s) for comment ${group._id.referenceId}`);
      }
    }

    console.log(`\nTotal duplicate notifications deleted: ${totalDeleted}`);
    console.log('Cleanup completed successfully');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the cleanup
cleanupDuplicateNotifications();

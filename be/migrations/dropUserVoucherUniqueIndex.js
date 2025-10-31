/**
 * Migration: Drop unique constraint on UserVoucher collection
 * 
 * Mục đích: Cho phép user claim và sử dụng cùng một voucher nhiều lần
 * (trong giới hạn userUsageLimit của voucher)
 * 
 * Chạy script này TRƯỚC KHI restart server với code mới
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/yourdb";

async function dropUniqueIndex() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collection = db.collection("uservouchers");

    // Lấy danh sách indexes hiện tại
    const indexes = await collection.indexes();
    console.log("\nCurrent indexes:");
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, index.key, index.unique ? "(UNIQUE)" : "");
    });

    // Tìm và drop unique index (userId_1_voucherId_1)
    const uniqueIndexName = "userId_1_voucherId_1";
    const hasUniqueIndex = indexes.some(
      (idx) => idx.name === uniqueIndexName && idx.unique === true
    );

    if (hasUniqueIndex) {
      console.log(`\nDropping unique index: ${uniqueIndexName}...`);
      await collection.dropIndex(uniqueIndexName);
      console.log("✓ Unique index dropped successfully!");

      // Tạo lại index không unique
      console.log("\nCreating non-unique compound index...");
      await collection.createIndex({ userId: 1, voucherId: 1 });
      console.log("✓ Non-unique index created successfully!");
    } else {
      console.log(`\n✓ Unique index not found or already dropped.`);
    }

    // Hiển thị indexes sau khi migration
    const newIndexes = await collection.indexes();
    console.log("\nIndexes after migration:");
    newIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, index.key, index.unique ? "(UNIQUE)" : "");
    });

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

dropUniqueIndex();

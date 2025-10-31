/**
 * Migration: Add usageCount field to UserVoucher and restore unique index
 * 
 * Mục đích: 
 * - Thêm field usageCount vào tất cả UserVoucher records (default = 0)
 * - Tạo lại unique index cho (userId, voucherId)
 * - User chỉ lưu voucher 1 lần, nhưng có thể dùng nhiều lần
 * 
 * Chạy script này SAU KHI đã drop unique index trước đó
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

async function addUsageCountField() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collection = db.collection("uservouchers");

    // Bước 1: Thêm field usageCount cho tất cả documents chưa có
    console.log("\n=== Step 1: Adding usageCount field ===");
    
    const countWithoutUsageCount = await collection.countDocuments({ 
      usageCount: { $exists: false } 
    });
    
    if (countWithoutUsageCount > 0) {
      console.log(`Found ${countWithoutUsageCount} documents without usageCount field`);
      
      const updateResult = await collection.updateMany(
        { usageCount: { $exists: false } },
        { 
          $set: { 
            usageCount: 0  // Default value
          } 
        }
      );
      
      console.log(`✓ Added usageCount field to ${updateResult.modifiedCount} documents`);
    } else {
      console.log("✓ All documents already have usageCount field");
    }

    // Bước 2: Migrate dữ liệu cũ: Nếu isUsed = true thì set usageCount = userUsageLimit
    console.log("\n=== Step 2: Migrating old data ===");
    
    // Lấy tất cả UserVoucher có isUsed = true và usageCount = 0
    const usedVouchers = await collection.find({ 
      isUsed: true,
      usageCount: 0
    }).toArray();
    
    if (usedVouchers.length > 0) {
      console.log(`Found ${usedVouchers.length} used vouchers to migrate`);
      
      // Lấy thông tin voucher để biết userUsageLimit
      const voucherIds = usedVouchers.map(uv => uv.voucherId);
      const vouchers = await db.collection("vouchers").find({
        _id: { $in: voucherIds }
      }).toArray();
      
      const voucherMap = vouchers.reduce((map, v) => {
        map[v._id.toString()] = v;
        return map;
      }, {});
      
      // Update usageCount cho mỗi UserVoucher
      for (const uv of usedVouchers) {
        const voucher = voucherMap[uv.voucherId.toString()];
        if (voucher) {
          const userLimit = voucher.userUsageLimit || 1;
          await collection.updateOne(
            { _id: uv._id },
            { $set: { usageCount: userLimit } }
          );
        }
      }
      
      console.log(`✓ Migrated ${usedVouchers.length} used vouchers`);
    } else {
      console.log("✓ No old data to migrate");
    }

    // Bước 3: Xóa tất cả các bản ghi trùng lặp (giữ lại bản đầu tiên)
    console.log("\n=== Step 3: Removing duplicates ===");
    
    const duplicates = await collection.aggregate([
      {
        $group: {
          _id: { userId: "$userId", voucherId: "$voucherId" },
          ids: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate pairs`);
      
      for (const dup of duplicates) {
        // Giữ lại bản đầu tiên, xóa các bản còn lại
        const idsToDelete = dup.ids.slice(1);
        
        // Cộng dồn usageCount vào bản đầu tiên
        const records = await collection.find({ _id: { $in: dup.ids } }).toArray();
        const totalUsageCount = records.reduce((sum, r) => sum + (r.usageCount || 0), 0);
        
        await collection.updateOne(
          { _id: dup.ids[0] },
          { $set: { usageCount: totalUsageCount } }
        );
        
        await collection.deleteMany({
          _id: { $in: idsToDelete }
        });
        
        console.log(`  Merged ${dup.count} duplicates for user ${dup._id.userId}`);
      }
      
      console.log(`✓ Removed ${duplicates.length} duplicate groups`);
    } else {
      console.log("✓ No duplicates found");
    }

    // Bước 4: Tạo lại unique index
    console.log("\n=== Step 4: Creating unique index ===");
    
    const indexes = await collection.indexes();
    const hasUniqueIndex = indexes.some(
      idx => idx.name === "userId_1_voucherId_1" && idx.unique === true
    );
    
    if (!hasUniqueIndex) {
      await collection.createIndex(
        { userId: 1, voucherId: 1 },
        { unique: true }
      );
      console.log("✓ Unique index created successfully!");
    } else {
      console.log("✓ Unique index already exists");
    }

    // Hiển thị indexes sau khi migration
    const finalIndexes = await collection.indexes();
    console.log("\n=== Final Indexes ===");
    finalIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, index.key, index.unique ? "(UNIQUE)" : "");
    });

    // Thống kê
    const totalDocs = await collection.countDocuments();
    const avgUsageCount = await collection.aggregate([
      {
        $group: {
          _id: null,
          avgUsage: { $avg: "$usageCount" },
          maxUsage: { $max: "$usageCount" }
        }
      }
    ]).toArray();
    
    console.log("\n=== Statistics ===");
    console.log(`  Total UserVoucher documents: ${totalDocs}`);
    if (avgUsageCount.length > 0) {
      console.log(`  Average usage count: ${avgUsageCount[0].avgUsage.toFixed(2)}`);
      console.log(`  Max usage count: ${avgUsageCount[0].maxUsage}`);
    }

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

addUsageCountField();

/**
 * Cleanup Script: Remove dangling UserVoucher references
 * 
 * Mục đích: Xóa các UserVoucher records có voucherId trỏ đến voucher không tồn tại
 * (Voucher đã bị xóa nhưng UserVoucher vẫn còn)
 * 
 * Chạy script này định kỳ hoặc khi gặp lỗi "Cannot read properties of null"
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function cleanupDanglingVouchers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const userVouchersCollection = db.collection("uservouchers");
    const vouchersCollection = db.collection("vouchers");

    console.log("\n=== Finding dangling references ===");

    // Lấy tất cả UserVoucher
    const allUserVouchers = await userVouchersCollection.find({}).toArray();
    console.log(`Total UserVoucher records: ${allUserVouchers.length}`);

    // Lấy tất cả voucherId từ UserVoucher
    const voucherIdsInUserVouchers = allUserVouchers
      .map(uv => uv.voucherId)
      .filter(Boolean); // Remove null/undefined

    // Lấy tất cả voucher IDs thực sự tồn tại
    const existingVouchers = await vouchersCollection.find({
      _id: { $in: voucherIdsInUserVouchers }
    }).toArray();

    const existingVoucherIds = new Set(
      existingVouchers.map(v => v._id.toString())
    );

    // Tìm các UserVoucher có voucherId không tồn tại
    const danglingUserVouchers = allUserVouchers.filter(uv => {
      if (!uv.voucherId) return true; // voucherId null/undefined
      return !existingVoucherIds.has(uv.voucherId.toString());
    });

    console.log(`\nFound ${danglingUserVouchers.length} dangling references:`);
    
    if (danglingUserVouchers.length === 0) {
      console.log("✓ No dangling references found!");
      return;
    }

    // Hiển thị thông tin chi tiết
    console.log("\nDetails:");
    danglingUserVouchers.slice(0, 10).forEach((uv, index) => {
      console.log(`  ${index + 1}. UserVoucher ID: ${uv._id}`);
      console.log(`     User ID: ${uv.userId}`);
      console.log(`     Voucher ID: ${uv.voucherId || 'NULL'}`);
      console.log(`     Created: ${uv.createdAt}`);
    });

    if (danglingUserVouchers.length > 10) {
      console.log(`  ... and ${danglingUserVouchers.length - 10} more`);
    }

    // Xác nhận xóa
    console.log("\n⚠️  These UserVoucher records will be deleted!");
    console.log("⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...");
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Xóa các dangling references
    const idsToDelete = danglingUserVouchers.map(uv => uv._id);
    
    const deleteResult = await userVouchersCollection.deleteMany({
      _id: { $in: idsToDelete }
    });

    console.log(`\n✓ Deleted ${deleteResult.deletedCount} dangling UserVoucher records`);

    // Thống kê sau khi cleanup
    const remainingCount = await userVouchersCollection.countDocuments();
    console.log(`✓ Remaining UserVoucher records: ${remainingCount}`);

    console.log("\n✓ Cleanup completed successfully!");

  } catch (error) {
    console.error("✗ Cleanup failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

cleanupDanglingVouchers();

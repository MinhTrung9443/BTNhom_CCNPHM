/**
 * Migration Script: Convert old single address field to addresses array
 * 
 * Chuyển đổi trường address (string) cũ sang mảng addresses mới
 * với cấu trúc chi tiết hơn cho quản lý địa chỉ giao hàng
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const migrateUserAddresses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm tất cả users có trường address cũ (string) và chưa có addresses array
    const users = await User.find({
      address: { $exists: true, $ne: null },
      $or: [
        { addresses: { $exists: false } },
        { addresses: { $size: 0 } }
      ]
    });

    console.log(`📊 Found ${users.length} users to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Nếu user có address cũ nhưng chưa có addresses array
        if (user.address && (!user.addresses || user.addresses.length === 0)) {
          // Tạo địa chỉ mới từ thông tin cũ
          // Vì address cũ chỉ là string, ta sẽ parse nó thành các trường
          const newAddress = {
            recipientName: user.name || 'Chưa cập nhật',
            phoneNumber: user.phone || '0000000000',
            street: user.address || 'Chưa cập nhật',
            ward: 'Chưa cập nhật',
            district: 'Chưa cập nhật',
            province: 'Chưa cập nhật',
            isDefault: true
          };

          user.addresses = [newAddress];
          await user.save();
          
          migratedCount++;
          console.log(`✅ Migrated user: ${user.email}`);
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users`);
    console.log(`   📊 Total processed: ${users.length} users`);

    await mongoose.disconnect();
    console.log('\n✅ Migration completed and disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateUserAddresses();

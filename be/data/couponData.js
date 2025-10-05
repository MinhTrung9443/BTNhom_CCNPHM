// file: createSampleCoupon.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../src/models/Coupon.js'; // <-- IMPORT MODEL VÀO

dotenv.config();

// Hàm để kết nối DB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://soctrang:1234567890@cluster0.aazwat4.mongodb.net/soctrang';
    console.log('🔗 Đang kết nối MongoDB với URI:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log('✅ MongoDB đã kết nối thành công');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    console.error('🔍 Chi tiết lỗi:', error);
    process.exit(1);
  }
};

// Hàm chính để tạo coupon
const main = async () => {
  try {
    await connectDB();

    // Kiểm tra xem đã có coupon nào chưa
    const existingCoupons = await Coupon.countDocuments();
    console.log(`📋 Hiện tại có ${existingCoupons} coupon trong database`);

    // ID của người dùng tạo coupon này (ví dụ: admin)
    // Schema yêu cầu trường `createdBy`
    const adminId = new mongoose.Types.ObjectId('67d4ee9405f8aded36dc4503'); // <-- Sửa ObjectId hợp lệ

    // Kiểm tra xem coupon đã tồn tại chưa
    const existingCoupon = await Coupon.findOne({ code: 'TET2026' });
    if (existingCoupon) {
      console.log('⚠️  Coupon TET2026 đã tồn tại, sẽ tạo coupon khác...');
    }

    // Dữ liệu cho coupon mới
    const newCouponData = {
      code: existingCoupon ? `TET2026_${Date.now()}` : 'TET2026',
      description: 'Giảm giá 15% cho tất cả sản phẩm mừng Tết 2026',
      discountType: 'percentage',
      discountValue: 15,
      minimumOrderValue: 200000, // Đơn hàng tối thiểu 200k
      maximumDiscountAmount: 50000, // Giảm tối đa 50k
      startDate: new Date('2025-01-20'), // Sửa năm 2025 thay vì 2026
      endDate: new Date('2025-02-15'),
      usageLimit: 1000, // Có 1000 lượt sử dụng
      userUsageLimit: 1, // Mỗi người chỉ được dùng 1 lần
      isPublic: true,
      isActive: true, // Thêm field này
      createdBy: adminId
    };

    console.log('📦 Dữ liệu coupon sẽ tạo:');
    console.log(JSON.stringify(newCouponData, null, 2));
    console.log('🔨 Đang tạo coupon mới...');
    
    // Sử dụng Model để tạo một document mới trong collection 'coupons'
    const createdCoupon = await Coupon.create(newCouponData);
    
    console.log('✅ Coupon đã được tạo thành công!');
    console.log('🎯 Thông tin coupon:');
    console.log(`- ID: ${createdCoupon._id}`);
    console.log(`- Code: ${createdCoupon.code}`);
    console.log(`- Description: ${createdCoupon.description}`);
    console.log(`- Discount: ${createdCoupon.discountValue}% (max ${createdCoupon.maximumDiscountAmount} VNĐ)`);
    console.log(`- Valid: ${createdCoupon.startDate} to ${createdCoupon.endDate}`);

    // Test thêm: Tạo một coupon fixed amount
    const fixedCouponData = {
      code: 'FREESHIP30',
      description: 'Miễn phí ship 30k cho đơn từ 200k',
      discountType: 'fixed',
      discountValue: 30000,
      minimumOrderValue: 200000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-1-31'),
      usageLimit: 500,
      userUsageLimit: 2,
      isPublic: true,
      isActive: true,
      createdBy: adminId
    };

    const existingFreeship = await Coupon.findOne({ code: 'FREESHIP30' });
    
    if (!existingFreeship) {
      console.log('🚢 Tạo thêm coupon freeship...');
      const freeshipCoupon = await Coupon.create(fixedCouponData);
      console.log(`✅ Tạo thành công coupon FREESHIP: ${freeshipCoupon._id}`);
    } else {
      console.log('⚠️  Coupon FREESHIP30 đã tồn tại');
    }

  } catch (error) {
    // Lỗi có thể xảy ra nếu code đã tồn tại, hoặc thiếu trường required
    console.error('❌ Lỗi khi tạo coupon:', error.message);
    console.error('🔍 Chi tiết lỗi:', error);
    
    // Nếu là lỗi validation, hiển thị chi tiết
    if (error.name === 'ValidationError') {
      console.error('🚫 Lỗi validation:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    // Luôn đóng kết nối sau khi chạy xong
    await mongoose.connection.close();
    console.log('📴 Đã đóng kết nối database.');
  }
};

// Chạy hàm chính
main();
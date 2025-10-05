import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { couponService } from '../src/services/coupon.service.js'; // <-- Cập nhật đường dẫn này
import Coupon from '../src/models/Coupon.js'; // <-- Cập nhật đường dẫn này
import Product from '../src/models/Product.js'; // <-- Cập nhật đường dẫn này
import User from '../src/models/User.js'; // <-- Cập nhật đường dẫn này

// Load environment variables
dotenv.config();

// --- KẾT NỐI DATABASE ---
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://soctrang:1234567890@cluster0.aazwat4.mongodb.net/soctrang';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB đã kết nối thành công');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};


// --- HÀM TẠO DỮ LIỆU TEST ---
// Sử dụng các ID cố định để đảm bảo tính nhất quán giữa các lần chạy
const testUserId = new mongoose.Types.ObjectId('68d4ee9405f8aded36dc4503');
const banhPiaSauRiengId = new mongoose.Types.ObjectId('a1a1a1a1a1a1a1a1a1a1a1a1');
const banhPiaDauXanhId = new mongoose.Types.ObjectId('b2b2b2b2b2b2b2b2b2b2b2b2');
const keoDuaId = new mongoose.Types.ObjectId('c3c3c3c3c3c3c3c3c3c3c3c3');

const createTestData = async () => {
    console.log('🔄 Đang tạo dữ liệu mẫu cho test...');

    // Xóa dữ liệu test cũ để tránh xung đột
    await User.deleteMany({ email: 'testuser@example.com' });
    await Product.deleteMany({ code: { $in: ['BPSRIENG', 'BPDXANH', 'KDUA'] } });
    await Coupon.deleteMany({ code: { $in: ['GIAM10K', 'SAURIENG20', 'FREESHIP', 'VIPMEMBER', 'HETHAN'] } });

    // 1. Tạo User
    await User.create({
        _id: testUserId,
        email: 'testuser@example.com',
        // ... các trường bắt buộc khác của User model
    });

    // 2. Tạo Products
    await Product.create([
        { _id: banhPiaSauRiengId, name: 'Bánh Pía Sầu Riêng', price: 50000, code: 'BPSRIENG', stock: 100 },
        { _id: banhPiaDauXanhId, name: 'Bánh Pía Đậu Xanh', price: 45000, code: 'BPDXANH', stock: 100 },
        { _id: keoDuaId, name: 'Kẹo Dừa', price: 30000, code: 'KDUA', stock: 100 },
    ]);

    // 3. Tạo Coupons
    const now = new Date();
    const yesterday = new Date(new Date().setDate(now.getDate() - 1));
    const tomorrow = new Date(new Date().setDate(now.getDate() + 1));
    const lastMonth = new Date(new Date().setMonth(now.getMonth() - 1));
    const oneMonthAgo = new Date(new Date().setMonth(now.getMonth() - 2));

    await Coupon.create([
        // Coupon công khai, còn hạn, áp dụng cho mọi thứ
        { code: 'GIAM10K', isPublic: true, startDate: yesterday, endDate: tomorrow },
        // Coupon chỉ áp dụng cho Bánh Pía Sầu Riêng
        { code: 'SAURIENG20', isPublic: true, startDate: yesterday, endDate: tomorrow, applicableProducts: [banhPiaSauRiengId] },
        // Coupon công khai, nhưng loại trừ Kẹo Dừa
        { code: 'FREESHIP', isPublic: true, startDate: yesterday, endDate: tomorrow, excludedProducts: [keoDuaId] },
        // Coupon riêng tư, chỉ dành cho testUser
        { code: 'VIPMEMBER', isPublic: false, allowedUsers: [testUserId], startDate: yesterday, endDate: tomorrow },
        // Coupon đã hết hạn
        { code: 'HETHAN', isPublic: true, startDate: oneMonthAgo, endDate: lastMonth },
    ]);
    console.log('👍 Dữ liệu mẫu đã được tạo thành công.');
};


// --- HÀM KIỂM THỬ CHÍNH ---
const testGetAvailableCoupons = async () => {
    console.log('\n🚀 Bắt đầu kiểm thử hàm getAvailableCoupons...\n');

    try {
        // --- TÌNH HUỐNG 1: Giỏ hàng rỗng ---
        // Kết quả mong đợi: Thấy tất cả coupon công khai còn hạn (GIAM10K, SAURIENG20, FREESHIP) và coupon riêng (VIPMEMBER).
        console.log('--- Tình huống 1: Giỏ hàng rỗng ---');
        const result1 = await couponService.getAvailableCoupons('68d4ee9405f8aded36dc4503', ['68e2ac355ba8c989842b139b']);
        console.log(`✅  Tìm thấy ${result1.length} coupons.`);
        console.log('   -> Mã coupon tìm được:', result1.map(c => c.code).join(', '));
        console.log('-------------------------------------\n');

        // --- TÌNH HUỐNG 2: Giỏ hàng có sản phẩm được áp dụng coupon riêng (Bánh Pía Sầu Riêng) ---
        // Kết quả mong đợi: Tất cả coupon từ TH1 VÀ coupon SAURIENG20 phải hợp lệ.
        console.log('--- Tình huống 2: Giỏ hàng có "Bánh Pía Sầu Riêng" ---');
        const cartWithSauRieng = [{ productId: banhPiaSauRiengId, quantity: 1 }];
        const result2 = await couponService.getAvailableCoupons(testUserId, cartWithSauRieng);
        const hasSauRiengCoupon = result2.some(c => c.code === 'SAURIENG20');
        console.log(`✅  Tìm thấy ${result2.length} coupons.`);
        console.log(`   -> Coupon "SAURIENG20" ${hasSauRiengCoupon ? 'có trong danh sách (Đúng).' : 'KHÔNG có trong danh sách (Sai).'} `);
        console.log('   -> Mã coupon tìm được:', result2.map(c => c.code).join(', '));
        console.log('-------------------------------------\n');

        // --- TÌNH HUỐNG 3: Giỏ hàng có sản phẩm thường (Bánh Pía Đậu Xanh) ---
        // Kết quả mong đợi: Không thấy coupon SAURIENG20 vì không áp dụng cho Bánh Pía Đậu Xanh.
        console.log('--- Tình huống 3: Giỏ hàng có "Bánh Pía Đậu Xanh" ---');
        const cartWithDauXanh = [{ productId: banhPiaDauXanhId, quantity: 2 }];
        const result3 = await couponService.getAvailableCoupons(testUserId, cartWithDauXanh);
        const hasSauRiengCouponInCart3 = result3.some(c => c.code === 'SAURIENG20');
        console.log(`✅  Tìm thấy ${result3.length} coupons.`);
        console.log(`   -> Coupon "SAURIENG20" ${hasSauRiengCouponInCart3 ? 'có trong danh sách (Sai).' : 'KHÔNG có trong danh sách (Đúng).'} `);
        console.log('   -> Mã coupon tìm được:', result3.map(c => c.code).join(', '));
        console.log('-------------------------------------\n');

        // --- TÌNH HUỐNG 4: Giỏ hàng có sản phẩm bị loại trừ (Kẹo Dừa) ---
        // Kết quả mong đợi: Không thấy coupon FREESHIP.
        console.log('--- Tình huống 4: Giỏ hàng có "Kẹo Dừa" (sản phẩm bị loại trừ) ---');
        const cartWithKeoDua = [{ productId: keoDuaId, quantity: 1 }];
        const result4 = await couponService.getAvailableCoupons(testUserId, cartWithKeoDua);
        const hasFreeshipCoupon = result4.some(c => c.code === 'FREESHIP');
        console.log(`✅  Tìm thấy ${result4.length} coupons.`);
        console.log(`   -> Coupon "FREESHIP" ${hasFreeshipCoupon ? 'có trong danh sách (Sai).' : 'KHÔNG có trong danh sách (Đúng).'} `);
        console.log('   -> Mã coupon tìm được:', result4.map(c => c.code).join(', '));
        console.log('-------------------------------------\n');

    } catch (error) {
        console.error('❌ Test thất bại:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
};

// --- HÀM CHẠY TOÀN BỘ KỊCH BẢN TEST ---
const runTests = async () => {
  try {
    await connectDB();
    await testGetAvailableCoupons();
    console.log('\n🎉 Tất cả các kịch bản test đã hoàn thành!');
  } catch (error) {
    console.error('❌ Kịch bản test gặp lỗi nghiêm trọng:', error.message);
  } finally {
    // Đóng kết nối database sau khi chạy xong
    await mongoose.connection.close();
    console.log('📴 Đã đóng kết nối database.');
  }
};

// Chạy test
runTests();
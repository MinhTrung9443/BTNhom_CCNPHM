// Test với console.log chi tiết input/output cho 13 paths
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import voucherService from '../src/services/voucher.service.js';
import { Voucher, UserVoucher, Product, User } from '../src/models/index.js';

dotenv.config();

const runDetailedTests = async () => {
  console.log('🔍 DETAILED INPUT/OUTPUT TEST FOR 13 PATHS');
  console.log('=' .repeat(60));

  try {
    // Connect DB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://soctrang:1234567890@cluster0.aazwat4.mongodb.net/soctrang';
    await mongoose.connect(mongoUri);

    // Test data setup (simplified)
    const testUserId = new mongoose.Types.ObjectId();
    const testProductId1 = new mongoose.Types.ObjectId();
    const testProductId2 = new mongoose.Types.ObjectId();

    // Clean and create minimal test data
    await User.deleteMany({ email: 'detailed_test@example.com' });
    await Product.deleteMany({ code: { $regex: /^DETAIL_/ } });
    await Voucher.deleteMany({ code: { $regex: /^DETAIL_/ } });
    await UserVoucher.deleteMany({ userId: testUserId });

    await User.create({
      _id: testUserId,
      email: 'detailed_test@example.com',
      name: 'Detail Test User',
      password: 'password123',
      phone: '0123456789',
      address: '123 Test Street'
    });

    await Product.create([
      {
        _id: testProductId1,
        name: 'Detail Product 1',
        code: 'DETAIL_PROD_1',
        price: 100000,
        discount: 10, // 90k actual
        stock: 10,
        categoryId: new mongoose.Types.ObjectId()
      },
      {
        _id: testProductId2,
        name: 'Detail Product 2', 
        code: 'DETAIL_PROD_2',
        price: 200000,
        discount: 0, // 200k actual
        stock: 5,
        categoryId: new mongoose.Types.ObjectId()
      }
    ]);

    const currentDate = new Date();
    const voucherId = new mongoose.Types.ObjectId();

    await Voucher.create({
      _id: voucherId,
      code: 'DETAIL_ACTIVE',
      description: 'Active voucher for detailed test',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseAmount: 50000,
      maxDiscountAmount: 50000,
      startDate: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      type: 'personal',
      source: 'admin'
    });

    await UserVoucher.create({
      userId: testUserId,
      voucherId: voucherId,
      isUsed: false
    });

    console.log('\n📊 TEST DATA CREATED:');
    console.log(`👤 User ID: ${testUserId}`);
    console.log(`📦 Product 1: ${testProductId1} (90k VND actual)`);
    console.log(`📦 Product 2: ${testProductId2} (200k VND actual)`);
    console.log(`🎫 Voucher: ${voucherId} (DETAIL_ACTIVE)`);

    // TEST CASES WITH DETAILED INPUT/OUTPUT

    console.log('\n' + '='.repeat(60));
    console.log('🧪 PATH 1: orderLines = null');
    console.log('INPUT:');
    console.log('  userId:', testUserId.toString());
    console.log('  orderLines:', null);
    try {
      const result1 = await voucherService.getApplicableVouchers(testUserId.toString(), null);
      console.log('OUTPUT:', result1);
    } catch (error) {
      console.log('OUTPUT (Error):', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 PATH 12: orderLines = []');
    console.log('INPUT:');
    console.log('  userId:', testUserId.toString());
    console.log('  orderLines:', []);
    try {
      const result12 = await voucherService.getApplicableVouchers(testUserId.toString(), []);
      console.log('OUTPUT:', result12);
    } catch (error) {
      console.log('OUTPUT (Error):', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 PATH 4: Valid orderLines with products');
    const orderLinesValid = [
      { productId: testProductId1.toString(), quantity: 2 },
      { productId: testProductId2.toString(), quantity: 1 }
    ];
    console.log('INPUT:');
    console.log('  userId:', testUserId.toString());
    console.log('  orderLines:', JSON.stringify(orderLinesValid, null, 2));
    console.log('  Expected subtotal: (90k * 2) + (200k * 1) = 380k VND');
    
    try {
      const result4 = await voucherService.getApplicableVouchers(testUserId.toString(), orderLinesValid);
      console.log('OUTPUT:');
      console.log('  Array length:', result4.length);
      result4.forEach((voucher, index) => {
        console.log(`  [${index}] Code: ${voucher.code}`);
        console.log(`      isApplicable: ${voucher.isApplicable}`);
        console.log(`      reason: ${voucher.reason}`);
      });
    } catch (error) {
      console.log('OUTPUT (Error):', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 PATH 3: Invalid product ID');
    const orderLinesInvalid = [
      { productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }, // Non-existent
      { productId: testProductId1.toString(), quantity: 1 }
    ];
    console.log('INPUT:');
    console.log('  userId:', testUserId.toString());
    console.log('  orderLines:', JSON.stringify(orderLinesInvalid, null, 2));
    console.log('  Expected subtotal: 0 + (90k * 1) = 90k VND');
    
    try {
      const result3 = await voucherService.getApplicableVouchers(testUserId.toString(), orderLinesInvalid);
      console.log('OUTPUT:');
      console.log('  Array length:', result3.length);
      result3.forEach((voucher, index) => {
        console.log(`  [${index}] Code: ${voucher.code}`);
        console.log(`      isApplicable: ${voucher.isApplicable}`);
        console.log(`      reason: ${voucher.reason}`);
      });
    } catch (error) {
      console.log('OUTPUT (Error):', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 PATH 2: No vouchers for user');
    await UserVoucher.deleteMany({ userId: testUserId });
    
    console.log('INPUT:');
    console.log('  userId:', testUserId.toString());
    console.log('  orderLines:', JSON.stringify([{ productId: testProductId1.toString(), quantity: 1 }], null, 2));
    console.log('  User vouchers: DELETED (0 vouchers)');
    
    try {
      const result2 = await voucherService.getApplicableVouchers(testUserId.toString(), [{ productId: testProductId1.toString(), quantity: 1 }]);
      console.log('OUTPUT:');
      console.log('  Array length:', result2.length);
      console.log('  Array content:', result2);
    } catch (error) {
      console.log('OUTPUT (Error):', error.message);
    }

    console.log('\n🎉 DETAILED INPUT/OUTPUT TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    await User.deleteMany({ email: 'detailed_test@example.com' });
    await Product.deleteMany({ code: { $regex: /^DETAIL_/ } });
    await Voucher.deleteMany({ code: { $regex: /^DETAIL_/ } });
    await mongoose.connection.close();
    console.log('\n📴 Database cleaned and closed');
  }
};

runDetailedTests().catch(console.error);

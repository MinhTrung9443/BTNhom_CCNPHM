// Debug test để xem kết quả trả về của getApplicableVouchers
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import voucherService from '../src/services/voucher.service.js';
import { User } from '../src/models/index.js';

dotenv.config();

const debugTest = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://soctrang:1234567890@cluster0.aazwat4.mongodb.net/soctrang';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create a test user ID
    const testUserId = new mongoose.Types.ObjectId();

    console.log('\n🔍 DEBUGGING getApplicableVouchers with different inputs:\n');

    // Test 1: null orderLines
    console.log('1️⃣ Testing with orderLines = null:');
    try {
      const result1 = await voucherService.getApplicableVouchers(testUserId.toString(), null);
      console.log('📤 Result:', result1);
      console.log('📊 Type:', typeof result1);
      console.log('📋 Array?', Array.isArray(result1));
    } catch (error) {
      console.log('💥 Error:', error.message);
      console.log('🏷️ Error type:', error.constructor.name);
    }

    // Test 2: undefined orderLines
    console.log('\n2️⃣ Testing with orderLines = undefined:');
    try {
      const result2 = await voucherService.getApplicableVouchers(testUserId.toString(), undefined);
      console.log('📤 Result:', result2);
    } catch (error) {
      console.log('💥 Error:', error.message);
    }

    // Test 3: empty array orderLines
    console.log('\n3️⃣ Testing with orderLines = []:');
    try {
      const result3 = await voucherService.getApplicableVouchers(testUserId.toString(), []);
      console.log('📤 Result:', result3);
    } catch (error) {
      console.log('💥 Error:', error.message);
    }

    // Test 4: valid orderLines
    console.log('\n4️⃣ Testing with valid orderLines:');
    try {
      const validOrderLines = [{ productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }];
      const result4 = await voucherService.getApplicableVouchers(testUserId.toString(), validOrderLines);
      console.log('📤 Result:', result4);
      console.log('📋 Length:', result4.length);
    } catch (error) {
      console.log('💥 Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
};

// Run debug test
debugTest().catch(console.error);

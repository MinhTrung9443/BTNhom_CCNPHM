// scripts/createTestUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createTestUser = async () => {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('❌ User test@example.com already exists');
      process.exit(0);
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Tạo user test
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      fullName: 'Nguyễn Văn Test',
      phone: '0123456789',
      address: '123 Test Street, TP.HCM',
      role: 'customer',
      isActive: true,
      emailVerified: true // Đã xác thực email để dễ test
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Role: customer');
    console.log('✉️ Email verified: true');

    // Tạo thêm admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'Admin System',
      phone: '0987654321',
      address: '456 Admin Street, TP.HCM',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

createTestUser();

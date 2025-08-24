const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function checkAndCreateData() {
    try {
        // Kết nối MongoDB
        console.log('🔗 Đang kết nối MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Kết nối MongoDB thành công!');

        // Kiểm tra database và collections
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('\n📊 Thông tin Database:');
        console.log('Database name:', db.databaseName);
        console.log('Collections:', collections.map(c => c.name));

        // Kiểm tra số lượng users hiện tại
        const userCount = await User.countDocuments();
        console.log('\n👥 Số lượng users hiện tại:', userCount);

        if (userCount === 0) {
            console.log('\n🚀 Không có user nào, đang tạo test users...');
            
            // Tạo test users (không có username để tránh lỗi index)
            const testUsers = [
                {
                    email: 'test@example.com',
                    password: await bcrypt.hash('123456', 12),
                    fullName: 'Test User',
                    emailVerified: true,
                    role: 'customer'
                },
                {
                    email: 'admin@example.com', 
                    password: await bcrypt.hash('123456', 12),
                    fullName: 'Admin User',
                    emailVerified: true,
                    role: 'admin'
                },
                {
                    email: 'customer1@example.com',
                    password: await bcrypt.hash('123456', 12),
                    fullName: 'Khách Hàng 1',
                    phone: '0123456789',
                    address: '123 Đường ABC, TP.HCM',
                    emailVerified: true,
                    role: 'customer'
                },
                {
                    email: 'customer2@example.com',
                    password: await bcrypt.hash('123456', 12),
                    fullName: 'Khách Hàng 2', 
                    phone: '0987654321',
                    address: '456 Đường XYZ, Hà Nội',
                    emailVerified: true,
                    role: 'customer'
                }
            ];

            for (const userData of testUsers) {
                const user = new User(userData);
                await user.save();
                console.log(`✅ Đã tạo user: ${userData.email}`);
            }

            console.log('\n🎉 Đã tạo thành công tất cả test users!');
        } else {
            console.log('\n📋 Danh sách users hiện tại:');
            const users = await User.find({}, 'email fullName createdAt').sort({ createdAt: -1 });
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email} - ${user.fullName} (${user.createdAt.toLocaleDateString()})`);
            });
        }

        // Kiểm tra kết nối API
        console.log('\n🔧 Test API endpoints:');
        console.log('POST /api/auth/register - Đăng ký user mới');
        console.log('POST /api/auth/login - Đăng nhập');
        console.log('GET /api/auth/profile - Lấy thông tin profile (cần token)');
        console.log('PUT /api/auth/profile - Cập nhật profile (cần token)');

        console.log('\n📝 Thông tin test login:');
        console.log('Email: test@example.com');
        console.log('Password: 123456');

        // Test tạo JWT token cho user đầu tiên
        const firstUser = await User.findOne({ email: 'test@example.com' });
        if (firstUser) {
            const token = firstUser.generateAuthToken();
            console.log('\n🔑 Sample JWT Token:');
            console.log(token.substring(0, 50) + '...');
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Giải pháp:');
            console.log('1. Kiểm tra MongoDB có đang chạy không');
            console.log('2. Nếu dùng MongoDB local: mongod --dbpath="path/to/data"');
            console.log('3. Nếu dùng MongoDB Atlas: kiểm tra connection string trong .env');
        }
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Đã đóng kết nối MongoDB');
    }
}

// Chạy script
checkAndCreateData();

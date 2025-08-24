const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function createQuickTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Check if test user exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        
        if (existingUser) {
            console.log('✅ Test user already exists');
        } else {
            // Create test user
            const hashedPassword = await bcrypt.hash('123456', 12);
            
            const testUser = new User({
                email: 'test@example.com',
                password: hashedPassword,
                fullName: 'Test User',
                emailVerified: true,
                isActive: true
            });

            await testUser.save();
            console.log('✅ Test user created successfully');
        }

        // Test password comparison
        const user = await User.findOne({ email: 'test@example.com' });
        const isPasswordValid = await user.comparePassword('123456');
        console.log('🔑 Password test:', isPasswordValid ? 'PASS' : 'FAIL');

        console.log('🎯 Ready to test login with:');
        console.log('   Email: test@example.com');
        console.log('   Password: 123456');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

createQuickTestUser();

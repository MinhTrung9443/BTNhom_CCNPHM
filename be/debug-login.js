const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

async function debugLogin() {
    console.log('🔍 Debug Login Issue...\n');

    try {
        // Test 1: Kiểm tra server có chạy không
        console.log('1️⃣ Test server health...');
        try {
            const healthResponse = await axios.get(`${BASE_URL}/health`);
            console.log('✅ Server is running:', healthResponse.data.message);
        } catch (error) {
            console.log('❌ Server not running:', error.message);
            return;
        }

        // Test 2: Kiểm tra có user test@example.com không
        console.log('\n2️⃣ Test user existence...');
        try {
            const loginTest1 = await axios.post(`${BASE_URL}/login`, {
                email: 'test@example.com',
                password: 'wrongpassword'
            });
        } catch (error) {
            if (error.response?.data?.message === 'Thông tin đăng nhập không chính xác') {
                console.log('✅ User exists but password wrong (expected)');
            } else {
                console.log('❌ User might not exist:', error.response?.data?.message);
                console.log('🔧 Let\'s create the user first...');
                
                // Tạo user test
                try {
                    const registerResponse = await axios.post(`${BASE_URL}/register`, {
                        email: 'test@example.com',
                        password: '123456',
                        confirmPassword: '123456',
                        fullName: 'Test User'
                    });
                    console.log('✅ User created:', registerResponse.data.message);
                } catch (registerError) {
                    if (registerError.response?.data?.message?.includes('already exists')) {
                        console.log('✅ User already exists');
                    } else {
                        console.log('❌ Failed to create user:', registerError.response?.data?.message);
                        return;
                    }
                }
            }
        }

        // Test 3: Test login với different payloads
        console.log('\n3️⃣ Test login with different payloads...');
        
        const testCases = [
            {
                name: 'Standard email/password',
                payload: { email: 'test@example.com', password: '123456' }
            },
            {
                name: 'Login field instead of email',
                payload: { login: 'test@example.com', password: '123456' }
            },
            {
                name: 'Both email and login',
                payload: { email: 'test@example.com', login: 'test@example.com', password: '123456' }
            }
        ];

        for (const testCase of testCases) {
            console.log(`\n📝 Testing: ${testCase.name}`);
            console.log('📤 Payload:', JSON.stringify(testCase.payload, null, 2));
            
            try {
                const response = await axios.post(`${BASE_URL}/login`, testCase.payload);
                console.log('✅ Success:', response.data.message);
                console.log('📝 Token preview:', response.data.data.token.substring(0, 50) + '...');
                console.log('👤 User:', response.data.data.user.email);
            } catch (error) {
                console.log('❌ Failed:', error.response?.data?.message || error.message);
                console.log('📊 Status:', error.response?.status);
                console.log('📋 Full response:', error.response?.data);
            }
        }

        // Test 4: Check database directly (mock)
        console.log('\n4️⃣ Recommendations:');
        console.log('- Ensure MongoDB is running and has test user');
        console.log('- Check if user password is correctly hashed');
        console.log('- Verify user.isActive = true');
        console.log('- Check if bcrypt.compare is working');

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

// Run debug
debugLogin();

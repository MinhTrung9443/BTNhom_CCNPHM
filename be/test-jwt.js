const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

// Test data
const testUser = {
    email: 'test@example.com',
    password: '123456',
    fullName: 'Test User'
};

let authToken = '';

async function testJWTAuthentication() {
    console.log('🔥 Bắt đầu test JWT Authentication...\n');

    try {
        // 1. Test Registration
        console.log('1️⃣ Test Registration...');
        try {
            const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
            console.log('✅ Registration thành công:', registerResponse.data.message);
        } catch (error) {
            if (error.response?.data?.message?.includes('already exists')) {
                console.log('⚠️ User đã tồn tại, tiếp tục test login...');
            } else {
                console.log('❌ Registration lỗi:', error.response?.data?.message || error.message);
                return;
            }
        }

        // 2. Test Login
        console.log('\n2️⃣ Test Login...');
        try {
            const loginResponse = await axios.post(`${BASE_URL}/login`, {
                email: testUser.email,
                password: testUser.password
            });
            
            authToken = loginResponse.data.token;
            console.log('✅ Login thành công!');
            console.log('📝 Token:', authToken.substring(0, 50) + '...');
            console.log('👤 User:', loginResponse.data.user.email);
        } catch (error) {
            console.log('❌ Login lỗi:', error.response?.data?.message || error.message);
            return;
        }

        // 3. Test Protected Route (Profile)
        console.log('\n3️⃣ Test Protected Route (Profile)...');
        try {
            const profileResponse = await axios.get(`${BASE_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            console.log('✅ Truy cập profile thành công!');
            console.log('👤 Profile data:', {
                email: profileResponse.data.email,
                fullName: profileResponse.data.fullName
            });
        } catch (error) {
            console.log('❌ Truy cập profile lỗi:', error.response?.data?.message || error.message);
        }

        // 4. Test Invalid Token
        console.log('\n4️⃣ Test Invalid Token...');
        try {
            await axios.get(`${BASE_URL}/profile`, {
                headers: {
                    'Authorization': 'Bearer invalid_token'
                }
            });
            console.log('❌ Token validation không hoạt động!');
        } catch (error) {
            console.log('✅ Token validation hoạt động tốt:', error.response?.data?.message);
        }

        // 5. Test No Token
        console.log('\n5️⃣ Test No Token...');
        try {
            await axios.get(`${BASE_URL}/profile`);
            console.log('❌ Auth middleware không hoạt động!');
        } catch (error) {
            console.log('✅ Auth middleware hoạt động tốt:', error.response?.data?.message);
        }

        console.log('\n🎉 Hoàn thành test JWT Authentication!');

    } catch (error) {
        console.log('❌ Lỗi không mong muốn:', error.message);
    }
}

// Test token expiry (optional)
async function testTokenExpiry() {
    console.log('\n⏰ Test Token Expiry...');
    if (!authToken) {
        console.log('❌ Không có token để test');
        return;
    }

    // Decode token để xem thông tin
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(authToken);
        console.log('📋 Token info:');
        console.log('   - User ID:', decoded.id);
        console.log('   - Issued at:', new Date(decoded.iat * 1000).toLocaleString());
        console.log('   - Expires at:', new Date(decoded.exp * 1000).toLocaleString());
        
        const now = Date.now() / 1000;
        const timeLeft = decoded.exp - now;
        console.log('   - Time left:', Math.round(timeLeft / 3600), 'hours');
    } catch (error) {
        console.log('❌ Không thể decode token:', error.message);
    }
}

// Chạy test
if (require.main === module) {
    testJWTAuthentication().then(() => {
        testTokenExpiry();
    });
}

module.exports = { testJWTAuthentication, testTokenExpiry };

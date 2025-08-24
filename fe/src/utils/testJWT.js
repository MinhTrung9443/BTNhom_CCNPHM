// Test JWT Authentication cho Frontend React
// File: fe/src/utils/testJWT.js

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/auth';

export const testJWTFrontend = {
    // Test login và lưu token vào localStorage
    async testLogin() {
        console.log('🔐 Test Login từ Frontend...');
        
        try {
            const response = await axios.post(`${API_BASE}/login`, {
                email: 'test@example.com',
                password: '123456'
            });

            const { token, user } = response.data;
            
            // Lưu token vào localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            console.log('✅ Login thành công!');
            console.log('📝 Token đã lưu vào localStorage');
            console.log('👤 User:', user.email);
            
            return { success: true, token, user };
        } catch (error) {
            console.error('❌ Login lỗi:', error.response?.data?.message);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Test call API với token từ localStorage
    async testAuthenticatedRequest() {
        console.log('🔒 Test Authenticated Request...');
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Không có token trong localStorage');
            return { success: false, error: 'No token found' };
        }

        try {
            const response = await axios.get(`${API_BASE}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('✅ API call thành công!');
            console.log('👤 Profile data:', response.data);
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ API call lỗi:', error.response?.data?.message);
            
            // Nếu token hết hạn, xóa khỏi localStorage
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                console.log('🗑️ Đã xóa token hết hạn khỏi localStorage');
            }
            
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Test auto-refresh token (nếu có implement)
    async testTokenRefresh() {
        console.log('🔄 Test Token Refresh...');
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Không có token để refresh');
            return { success: false };
        }

        try {
            // Giả sử có endpoint refresh token
            const response = await axios.post(`${API_BASE}/refresh`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            
            console.log('✅ Token refresh thành công!');
            return { success: true, token: newToken };
        } catch (error) {
            console.error('❌ Token refresh lỗi:', error.response?.data?.message);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Test logout
    async testLogout() {
        console.log('🚪 Test Logout...');
        
        // Xóa token khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        console.log('✅ Logout thành công! Token đã được xóa.');
        return { success: true };
    },

    // Kiểm tra token trong localStorage
    checkToken() {
        console.log('🔍 Kiểm tra Token trong localStorage...');
        
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token) {
            console.log('✅ Có token:', token.substring(0, 50) + '...');
            console.log('👤 User:', JSON.parse(user || '{}').email);
            
            // Decode token để xem thông tin (cần jwt-decode package)
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const decoded = JSON.parse(jsonPayload);
                console.log('📋 Token info:');
                console.log('   - User ID:', decoded.id);
                console.log('   - Expires:', new Date(decoded.exp * 1000).toLocaleString());
                
                // Kiểm tra còn hạn không
                const now = Date.now() / 1000;
                if (decoded.exp < now) {
                    console.log('⚠️ Token đã hết hạn!');
                    this.testLogout();
                } else {
                    const timeLeft = decoded.exp - now;
                    console.log('   - Còn lại:', Math.round(timeLeft / 3600), 'giờ');
                }
            } catch (error) {
                console.error('❌ Không thể decode token:', error.message);
            }
        } else {
            console.log('❌ Không có token trong localStorage');
        }
        
        return { hasToken: !!token, user: user ? JSON.parse(user) : null };
    },

    // Chạy full test
    async runFullTest() {
        console.log('🚀 Chạy Full JWT Test cho Frontend...\n');
        
        // 1. Kiểm tra token hiện tại
        this.checkToken();
        
        // 2. Test login
        await this.testLogin();
        
        // 3. Test authenticated request
        await this.testAuthenticatedRequest();
        
        // 4. Test logout
        await this.testLogout();
        
        console.log('\n🎉 Hoàn thành Full JWT Test!');
    }
};

// Để sử dụng trong React component:
/*
import { testJWTFrontend } from './utils/testJWT';

// Trong component:
const handleTestJWT = () => {
    testJWTFrontend.runFullTest();
};

// Hoặc test từng phần:
const handleLogin = async () => {
    const result = await testJWTFrontend.testLogin();
    if (result.success) {
        // Login thành công, redirect hoặc update UI
    }
};
*/

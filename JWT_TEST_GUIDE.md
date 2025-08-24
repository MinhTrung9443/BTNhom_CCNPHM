# 🔐 Hướng Dẫn Test JWT Authentication

## 📋 Tổng Quan
Bạn có thể test JWT authentication bằng 3 cách:
1. **Backend Test Script** - Test API endpoints trực tiếp
2. **Frontend Test Component** - Test trong giao diện React
3. **Manual Testing** - Test thủ công qua browser

---

## 🚀 Cách 1: Test Backend Script

### Bước 1: Khởi động Backend
```powershell
cd "d:\CCMTPTPM\BTNhom\BTNhom_CCNPHM\be"
npm start
```

### Bước 2: Tạo Test User (nếu chưa có)
```powershell
npm run create-test-user
```

### Bước 3: Chạy Test Script
```powershell
node test-jwt.js
```

### Kết quả mong đợi:
```
🔥 Bắt đầu test JWT Authentication...

1️⃣ Test Registration...
✅ Registration thành công: User registered successfully

2️⃣ Test Login...
✅ Login thành công!
📝 Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
👤 User: test@example.com

3️⃣ Test Protected Route (Profile)...
✅ Truy cập profile thành công!
👤 Profile data: { email: 'test@example.com', fullName: 'Test User' }

4️⃣ Test Invalid Token...
✅ Token validation hoạt động tốt: Invalid or expired token

5️⃣ Test No Token...
✅ Auth middleware hoạt động tốt: No token provided

🎉 Hoàn thành test JWT Authentication!
```

---

## 🖥️ Cách 2: Test Frontend Component

### Bước 1: Khởi động Backend
```powershell
cd "d:\CCMTPTPM\BTNhom\BTNhom_CCNPHM\be"
npm start
```

### Bước 2: Khởi động Frontend
```powershell
cd "d:\CCMTPTPM\BTNhom\BTNhom_CCNPHM\fe"
npm start
```

### Bước 3: Truy cập Test Component
Mở browser và đi đến: http://localhost:3001/test-jwt

### Bước 4: Test các chức năng
1. **🔍 Kiểm tra Token** - Xem có token nào đã lưu chưa
2. **🔐 Test Login** - Đăng nhập và lưu token vào localStorage
3. **🔒 Test Auth Request** - Gọi API với token
4. **🚪 Test Logout** - Xóa token khỏi localStorage
5. **🚀 Full Test** - Chạy tất cả test theo thứ tự

---

## 🔧 Cách 3: Manual Testing

### Test Login Form
1. Truy cập: http://localhost:3001/login
2. Đăng nhập với:
   - Email: `test@example.com`
   - Password: `123456`
3. Kiểm tra console và localStorage

### Test Protected Routes
1. Sau khi login, truy cập: http://localhost:3001/profile
2. Kiểm tra xem có hiển thị thông tin user không

### Test Token trong DevTools
1. Mở DevTools (F12)
2. Tab Application > Local Storage
3. Kiểm tra có key `token` và `user`

---

## 🔍 Các Trường Hợp Test

### ✅ Test Cases Thành Công:
1. **Registration** - Đăng ký user mới
2. **Login** - Đăng nhập với thông tin đúng
3. **Protected Route Access** - Truy cập API với token hợp lệ
4. **Token Storage** - Token được lưu vào localStorage
5. **Token Decode** - Có thể decode và đọc thông tin token

### ❌ Test Cases Thất Bại (Mong đợi):
1. **Invalid Credentials** - Đăng nhập với thông tin sai
2. **Expired Token** - Sử dụng token đã hết hạn
3. **Invalid Token** - Sử dụng token không hợp lệ
4. **No Token** - Truy cập protected route không có token
5. **Malformed Token** - Token bị hỏng hoặc sai format

---

## 🛠️ Debug và Troubleshooting

### Kiểm tra Backend
```powershell
# Kiểm tra server có chạy không
netstat -an | findstr 3000

# Kiểm tra MongoDB connection
# Xem log trong terminal chạy backend
```

### Kiểm tra Frontend
```javascript
// Trong console browser
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Test API call thủ công
fetch('http://localhost:3000/api/auth/profile', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
}).then(res => res.json()).then(console.log);
```

### Lỗi thường gặp:

#### 1. CORS Error
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:3001' has been blocked by CORS policy
```
**Giải pháp:** Kiểm tra CORS config trong backend `index.js`

#### 2. Connection Error
```
Network Error
```
**Giải pháp:** Đảm bảo backend đang chạy trên port 3000

#### 3. Token Invalid
```
Invalid or expired token
```
**Giải pháp:** Xóa token cũ và đăng nhập lại

---

## 📊 Monitoring JWT

### Token Information
```javascript
// Decode JWT token để xem thông tin
const token = localStorage.getItem('token');
if (token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decoded = JSON.parse(jsonPayload);
    console.log('Token Info:', decoded);
    console.log('Expires:', new Date(decoded.exp * 1000));
}
```

### Performance Monitoring
- **Token Size**: JWT tokens nên < 8KB
- **API Response Time**: Đo thời gian response của các API call
- **Token Refresh**: Kiểm tra tần suất refresh token

---

## 🔒 Security Testing

### Test Security Features:
1. **Password Hashing** - Password không được lưu plain text
2. **Token Expiry** - Token tự động hết hạn sau 7 ngày
3. **HTTPS** (Production) - Dữ liệu được mã hóa trong truyền tải
4. **Input Validation** - Kiểm tra validate input
5. **SQL Injection** - Test với input độc hại

### Sample Security Tests:
```javascript
// Test SQL injection
const maliciousInput = "'; DROP TABLE users; --";

// Test XSS
const xssInput = "<script>alert('XSS')</script>";

// Test very long input
const longInput = "a".repeat(10000);
```

---

## 📝 Test Results Documentation

### Tạo Test Report:
```javascript
const testReport = {
    timestamp: new Date().toISOString(),
    tests: [
        { name: 'Login', status: 'PASS', time: '150ms' },
        { name: 'Protected Route', status: 'PASS', time: '89ms' },
        { name: 'Invalid Token', status: 'PASS', time: '45ms' },
        { name: 'Token Expiry', status: 'PASS', time: '12ms' }
    ],
    summary: {
        total: 4,
        passed: 4,
        failed: 0,
        duration: '296ms'
    }
};

console.table(testReport.tests);
```

---

## 🎯 Kết Luận

Sau khi test xong, bạn sẽ có:
- ✅ JWT authentication hoạt động đúng
- ✅ Token được tạo và validate chính xác
- ✅ Protected routes được bảo vệ
- ✅ Error handling hoạt động tốt
- ✅ Frontend và Backend tích hợp thành công

**Next Steps:**
1. Deploy lên production environment
2. Setup HTTPS
3. Implement refresh token
4. Add rate limiting
5. Setup monitoring và logging

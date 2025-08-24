# Backend API - Bánh Pía Quê Mình

## Mô tả
API backend cho website bán bánh pía với chức năng đăng nhập/đăng ký sử dụng JWT authentication.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình file `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/banhpia_db
JWT_SECRET=your_jwt_secret_key_here
EMAIL_SERVICE_USER=your_email@gmail.com
EMAIL_SERVICE_PASS=your_email_app_password
```

3. Chạy server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes

#### 1. Đăng ký tài khoản
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "address": "123 Đường ABC, TP.HCM"
}
```

#### 2. Đăng nhập
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "login": "user123", // có thể là username hoặc email
  "password": "password123"
}
```

#### 3. Xác thực email
- **POST** `/api/auth/verify-email`
- **Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### 4. Gửi lại mã xác thực
- **POST** `/api/auth/resend-verification`
- **Body:**
```json
{
  "email": "user@example.com"
}
```

#### 5. Lấy thông tin profile (yêu cầu token)
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

#### 6. Cập nhật profile (yêu cầu token)
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "address": "456 Đường XYZ, Hà Nội"
}
```

#### 7. Đổi mật khẩu (yêu cầu token)
- **PUT** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

#### 8. Test token (yêu cầu token)
- **GET** `/api/auth/test`
- **Headers:** `Authorization: Bearer <token>`

## Cấu trúc dự án

```
be/
├── config/
│   └── db.js                 # Cấu hình MongoDB
├── controllers/
│   └── authController.js     # Xử lý logic authentication
├── middleware/
│   └── auth.js              # Middleware xác thực JWT
├── models/
│   └── User.js              # Model User
├── routes/
│   └── AuthRoute.js         # Routes authentication
├── .env                     # Biến môi trường
├── index.js                 # File chính server
└── package.json             # Dependencies và scripts
```

## Tính năng

- ✅ Đăng ký tài khoản với validation
- ✅ Đăng nhập bằng username hoặc email
- ✅ JWT Authentication với thời hạn 7 ngày
- ✅ Xác thực email qua OTP
- ✅ Quản lý profile người dùng
- ✅ Đổi mật khẩu
- ✅ Phân quyền user (customer/admin)
- ✅ Middleware bảo mật
- ✅ Gửi email tự động
- ✅ Error handling toàn diện
- ✅ CORS support

## Bảo mật

- Mật khẩu được mã hóa bằng bcryptjs với salt 12
- JWT token có thời hạn và được ký bằng secret key
- Validation đầu vào nghiêm ngặt
- Middleware xác thực token
- Email verification bắt buộc

## Lưu ý

1. Cần cài đặt MongoDB và chạy trước khi start server
2. Cần cấu hình email service (Gmail) để gửi OTP
3. Thay đổi JWT_SECRET trong production
4. Database sẽ tự động tạo collections khi có data đầu tiên

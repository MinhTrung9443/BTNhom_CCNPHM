# Frontend - Bánh Pía Quê Mình

## Mô tả
Ứng dụng React frontend cho website bán bánh pía với hệ thống đăng nhập/đăng ký sử dụng JWT authentication.

## Cài đặt và chạy

1. **Cài đặt dependencies:**
```bash
cd fe
npm install
```

2. **Chạy ứng dụng:**
```bash
# Development mode
npm start

# Build cho production
npm run build
```

3. **Truy cập ứng dụng:**
- URL: http://localhost:3000
- Đảm bảo backend đang chạy trên http://localhost:5000

## Tính năng chính

### 🔐 Authentication
- ✅ Đăng ký tài khoản với validation
- ✅ Đăng nhập bằng email hoặc username
- ✅ Xác thực email qua OTP
- ✅ Gửi lại mã xác thực
- ✅ Quản lý session với JWT
- ✅ Auto logout khi token hết hạn

### 👤 Quản lý Profile
- ✅ Xem thông tin cá nhân
- ✅ Cập nhật thông tin profile
- ✅ Đổi mật khẩu
- ✅ Hiển thị trạng thái xác thực email

### 🎨 Giao diện
- ✅ Responsive design
- ✅ UI/UX thân thiện
- ✅ Theme màu bánh pía (vàng cam)
- ✅ Loading states
- ✅ Toast notifications
- ✅ Gradient backgrounds

### 🏠 Trang chủ
- ✅ Giới thiệu sản phẩm bánh pía
- ✅ Hiển thị các loại bánh pía
- ✅ Thông tin về công ty
- ✅ Header navigation
- ✅ Footer với thông tin liên hệ

## Cấu trúc dự án

```
fe/
├── src/
│   ├── components/
│   │   ├── Login.js         # Component đăng nhập
│   │   ├── Register.js      # Component đăng ký
│   │   ├── VerifyEmail.js   # Component xác thực email
│   │   ├── Home.js          # Trang chủ
│   │   ├── Profile.js       # Trang profile
│   │   └── *.css           # CSS files
│   ├── contexts/
│   │   └── AuthContext.js   # Context quản lý authentication
│   ├── services/
│   │   └── api.js          # API service với axios
│   └── App.js              # Main App component
└── package.json            # Dependencies và scripts
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder.

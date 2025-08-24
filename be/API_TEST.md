# Test API Endpoints

## 1. Tạo tài khoản test qua API

### POST /api/auth/register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": null,
    "email": "test@example.com",
    "password": "123456",
    "confirmPassword": "123456",
    "fullName": "Nguyễn Văn Test",
    "phone": "0123456789",
    "address": "123 Test Street, TP.HCM"
  }'
```

## 2. Đăng nhập

### POST /api/auth/login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "test@example.com",
    "password": "123456"
  }'
```

## 3. Test token (sau khi có token)

### GET /api/auth/test-token
```bash
curl -X GET http://localhost:5000/api/auth/test-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 4. Xác thực email (nếu cần)

### POST /api/auth/verify-email
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

## Thông tin tài khoản test

- **Email**: test@example.com
- **Password**: 123456
- **Tên**: Nguyễn Văn Test
- **Role**: customer

- **Admin Email**: admin@example.com
- **Admin Password**: 123456
- **Admin Role**: admin

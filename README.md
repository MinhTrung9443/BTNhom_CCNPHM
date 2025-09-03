# 🚀 Project Setup  

## Yêu cầu  
- Node.js >= 16  
- MongoDB đã cài đặt và chạy (local hoặc cloud)  
- Postman (dùng để test API):  
  👉 [Collection Postman](https://restless-escape-607654.postman.co/workspace/Team-Workspace~838f939c-385e-4e0c-8b81-745565ba8eb3/collection/47926739-12ca7802-b2d8-4738-bcc3-6906f1ad9946?action=share&creator=47926739)  

---

## 📂 Cấu trúc dự án  
project/
│── fe/ # Frontend (React)
│── be/ # Backend (Node.js + Express + MongoDB)
│── README.md

## 🔧 Khởi tạo dự án  

Mở **2 terminal** để chạy song song:  

### Terminal 1: Frontend  
```bash
cd fe
npm install
npm start
```
### Terminal 2: Backend
```bash
cd be
npm install
npm start
```
🌐 Truy cập
Frontend: http://localhost:3000

Backend API: http://localhost:5000 (tuỳ config)

🛠 Test API với Postman
Import collection Postman từ link:
👉 Postman Collection

Thực hiện các request để kiểm tra tính năng: đăng ký, đăng nhập, CRUD...
### Thêm data mongo
### Terminal 3: Backend
```bash
cd be
node insertData.js
```

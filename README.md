# Đặc Sản Sóc Trăng - Ecommerce Platform

## Giới thiệu

"Đặc Sản Sóc Trăng" là một dự án thương mại điện tử đầy đủ chức năng được xây dựng với MERN stack (MongoDB, Express, React, Node.js) và Next.js. Dự án bao gồm một trang web cho người dùng để duyệt và mua sản phẩm, và một trang quản trị để quản lý sản phẩm, đơn hàng, người dùng và các khía cạnh khác của cửa hàng.

## Tính năng chính

### Trang người dùng (Frontend - Next.js)

  * **Xác thực người dùng:** Đăng ký, đăng nhập, quên mật khẩu, xác thực OTP.
  * **Duyệt sản phẩm:** Xem sản phẩm mới nhất, bán chạy nhất, được xem nhiều nhất và có khuyến mãi cao nhất.
  * **Tìm kiếm và Lọc:** Tìm kiếm sản phẩm theo từ khóa, danh mục, khoảng giá, và xếp hạng.
  * **Chi tiết sản phẩm:** Xem thông tin chi tiết, hình ảnh, đánh giá và các sản phẩm liên quan.
  * **Giỏ hàng:** Thêm, cập nhật số lượng, và xóa sản phẩm khỏi giỏ hàng.
  * **Thanh toán:**
      * Xem trước đơn hàng với địa chỉ, phương thức vận chuyển, voucher và điểm tích lũy.
      * Hỗ trợ thanh toán khi nhận hàng (COD) và thanh toán qua MoMo.
  * **Quản lý đơn hàng:** Theo dõi trạng thái đơn hàng, xem lịch sử đơn hàng, và yêu cầu hủy hoặc trả hàng.
  * **Tài khoản người dùng:** Cập nhật thông tin cá nhân, quản lý địa chỉ, xem lịch sử mua hàng, và các sản phẩm đã xem.
  * **Tính năng tương tác:** Thêm sản phẩm vào danh sách yêu thích, để lại đánh giá cho sản phẩm.
  * **Hệ thống điểm tích lũy:** Tích điểm sau mỗi đơn hàng thành công và sử dụng điểm để được giảm giá.
  * **Voucher:** Khám phá, lưu và áp dụng voucher.
  * **Chat trực tuyến:** Hỗ trợ khách hàng theo thời gian thực.

### Trang quản trị (Admin - React)

  * **Dashboard:** Tổng quan về doanh thu, người dùng mới, và các đơn hàng gần đây.
  * **Quản lý người dùng:** Xem, tìm kiếm, và thay đổi trạng thái hoạt động của người dùng.
  * **Quản lý sản phẩm:** Thêm, sửa, xóa sản-phẩm với hình ảnh và thông tin chi tiết.
  * **Quản lý đơn hàng:** Xem chi tiết đơn hàng, cập nhật trạng thái, và xử lý các yêu cầu hủy/trả hàng.
  * **Quản lý danh mục:** Tạo và quản lý các danh mục sản phẩm.
  * **Quản lý voucher:** Tạo và quản lý các mã giảm giá.
  * **Quản lý phương thức vận chuyển:** Cấu hình các tùy chọn giao hàng.
  * **Hệ thống thông báo:** Nhận thông báo về đơn hàng mới và các hoạt động quan trọng khác.
  * **Chat với khách hàng:** Tương tác và hỗ trợ khách hàng trực tiếp từ trang quản trị.

## Công nghệ sử dụng

**Backend:**

  * Node.js
  * Express
  * MongoDB
  * Mongoose
  * JSON Web Token (JWT)
  * Socket.IO (cho tính năng chat)
  * Nodemailer (để gửi email)
  * Cloudinary (lưu trữ hình ảnh)

**Frontend (Người dùng):**

  * Next.js
  * React
  * TypeScript
  * Tailwind CSS
  * Auth.js (xác thực)
  * shadcn/ui (component library)
  * SWR (data fetching)

**Frontend (Quản trị):**

  * React
  * Vite
  * Redux Toolkit (quản lý state)
  * React Bootstrap
  * Chart.js (biểu đồ)
  * Socket.IO Client

**Công cụ phát triển:**

  * Postman (test API)
  * concurrently (chạy nhiều script cùng lúc)

## Cấu trúc dự án

Dự án được tổ chức thành ba phần chính: backend, frontend cho người dùng (feUser), và frontend cho trang quản trị (feAdmin).

```
minhtrung9443-btnhom_ccnphm/
├── be/                   # Backend (Node.js, Express)
│   ├── src/
│   │   ├── controllers/  # Xử lý request và response
│   │   ├── middlewares/  # Middleware cho authentication, error handling
│   │   ├── models/       # Định nghĩa schema cho MongoDB
│   │   ├── routes/       # Định tuyến API
│   │   └── services/     # Logic nghiệp vụ
│   └── index.js          # Entry point của server
├── feAdmin/              # Frontend trang quản trị (React, Vite)
│   ├── src/
│   │   ├── components/   # Các component tái sử dụng
│   │   ├── pages/        # Các trang của ứng dụng
│   │   ├── redux/        # Quản lý state với Redux Toolkit
│   │   └── services/     # Gọi API từ backend
│   └── main.jsx          # Entry point của ứng dụng React
└── feUser/               # Frontend trang người dùng (Next.js)
    ├── src/
    │   ├── app/          # App Router của Next.js
    │   ├── components/   # Các component React
    │   ├── contexts/     # React Context (ví dụ: CartContext)
    │   ├── hooks/        # Các custom hook
    │   └── services/     # Gọi API từ backend
    └── next.config.ts    # Cấu hình Next.js
```

## Yêu cầu hệ thống

  * Node.js \>= 16
  * MongoDB (đã cài đặt và chạy trên local hoặc cloud)
  * Postman (để kiểm thử API)

## Hướng dẫn cài đặt

1.  **Clone repository:**

    ```bash
    git clone https://github.com/minhtrung9443/btnhom_ccnphm.git
    cd btnhom_ccnphm
    ```

2.  **Cài đặt dependencies cho Backend:**

    ```bash
    cd be
    npm install
    ```

3.  **Cài đặt dependencies cho Frontend (Người dùng):**

    ```bash
    cd ../feUser
    npm install
    ```

4.  **Cài đặt dependencies cho Frontend (Quản trị):**

    ```bash
    cd ../feAdmin
    npm install
    ```

5.  **Cấu hình môi trường:**

      * Tạo file `.env` trong thư mục `be/` và cấu hình các biến môi trường cần thiết như `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, v.v.
      * Tạo file `.env.local` trong thư mục `feUser/` và `feAdmin/` để cấu hình `NEXT_PUBLIC_API_BASE_URL` hoặc `VITE_API_URL` trỏ đến địa chỉ của backend (ví dụ: `http://localhost:5000/api`).

## Chạy dự án

Mở 3 terminal riêng biệt để chạy song song backend và hai frontend.

**Terminal 1: Chạy Backend**

```bash
cd be
npm start
```

Backend sẽ chạy tại `http://localhost:5000` (hoặc cổng bạn đã cấu hình).

**Terminal 2: Chạy Frontend (Người dùng)**

```bash
cd feUser
npm run dev
```

Trang người dùng sẽ có thể truy cập tại `http://localhost:3000`.

**Terminal 3: Chạy Frontend (Quản trị)**

```bash
cd feAdmin
npm run dev
```

Trang quản trị sẽ có thể truy cập tại `http://localhost:5174` (hoặc cổng khác do Vite chỉ định).

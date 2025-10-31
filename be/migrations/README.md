# Database Migrations & Voucher System Update

## 🚨 BẮT BUỘC: Xóa unique index trước khi sử dụng tính năng mới

**Nếu gặp lỗi:** `E11000 duplicate key error collection: cnpm.uservouchers index: userId_1_voucherId_1`

👉 **[XEM HƯỚNG DẪN FIX NHANH TẠI ĐÂY: QUICKSTART.md](./QUICKSTART.md)** 👈

---

## Hướng dẫn chạy migration

### 1. Drop UserVoucher Unique Index (Bắt buộc)

Migration này bỏ unique constraint trên collection `uservouchers` để cho phép user claim và sử dụng cùng một voucher công khai nhiều lần (trong giới hạn `userUsageLimit`).

**Chạy migration TRƯỚC KHI restart server với code mới:**

```bash
cd be
node migrations/dropUserVoucherUniqueIndex.js
```

**Kết quả mong đợi:**
- Index `userId_1_voucherId_1` với unique constraint sẽ bị xóa
- Index mới `userId_1_voucherId_1` (không unique) sẽ được tạo
- User có thể claim cùng 1 voucher nhiều lần theo `userUsageLimit`

**Lưu ý:**
- Migration này an toàn và không làm mất dữ liệu
- Nếu database chưa có index cũ, migration sẽ bỏ qua bước drop
- Chỉ cần chạy 1 lần duy nhất

---

## Các thay đổi chức năng

### Voucher công khai với userUsageLimit

Sau khi chạy migration, voucher công khai sẽ hỗ trợ:

1. **globalUsageLimit**: Tổng số lần voucher có thể được sử dụng trên toàn hệ thống
2. **userUsageLimit**: Số lần tối đa mỗi user có thể claim/sử dụng voucher đó

**Ví dụ:**
- Voucher GIAM10 có:
  - `globalUsageLimit = 1000` (tổng 1000 lần sử dụng)
  - `userUsageLimit = 3` (mỗi user tối đa 3 lần)
- User A có thể claim voucher này tối đa 3 lần
- Mỗi lần claim tạo 1 UserVoucher record mới
- Mỗi lần dùng, 1 record được đánh dấu `isUsed = true`

### Cách hoạt động:

1. **Admin tạo voucher** với các tham số:
   - `globalUsageLimit = 1000` (tổng 1000 lượt sử dụng trên toàn hệ thống)
   - `userUsageLimit = 5` (mỗi user tối đa 5 lần)
   - Có thể để trống (null) để không giới hạn

2. **User lưu và sử dụng voucher:**
   - User A claim voucher → tạo UserVoucher record #1 (isUsed = false)
   - User A dùng voucher trong đơn hàng → UserVoucher #1 đánh dấu `isUsed = true`
   - User A vào trang Voucher → thấy nút "Lưu lại" (vì còn 4 lần)
   - User A claim lại → tạo UserVoucher record #2 (isUsed = false)
   - User A dùng tiếp → UserVoucher #2 đánh dấu `isUsed = true`
   - Lặp lại cho đến khi đủ 5 lần
   - User A cố claim lần 6 → Hệ thống báo lỗi: "Bạn đã đạt giới hạn sử dụng voucher này (tối đa 5 lần)"

3. **Giao diện hiển thị:**
   - Trang Voucher công khai: Hiển thị "Bạn có thể lưu thêm X lần"
   - Nút "Lưu voucher" khi chưa claim
   - Nút "Lưu lại" khi đã claim nhưng còn lượt
   - Nút "Đã hết lượt" khi đạt giới hạn

---

## 🐛 Fix lỗi thường gặp

### Lỗi: `"userUsageLimit" must be a number`

**Nguyên nhân:** Frontend gửi chuỗi rỗng `""` khi không nhập giá trị, nhưng backend validation yêu cầu phải là số.

**Đã fix:** 
- ✅ Backend validation schema cho phép `userUsageLimit = null` hoặc không có giá trị
- ✅ Frontend gửi `null` thay vì `""` khi không nhập
- ✅ Nếu để trống = không giới hạn số lần user có thể claim

**Kiểm tra:**
```bash
# Test tạo voucher không có userUsageLimit
curl -X POST http://localhost:5000/api/admin/vouchers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST123",
    "discountType": "percentage",
    "discountValue": 10,
    "type": "public",
    "minPurchaseAmount": 0,
    "maxDiscountAmount": 50000,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.999Z"
  }'
```

Kết quả: Voucher được tạo thành công với `userUsageLimit = null` (không giới hạn)

# 🖼️ Hướng Dẫn Sửa Lỗi Hiển Thị Avatar

## 🔍 Vấn Đề

Avatar không hiển thị trong trang **Hồ sơ cá nhân** và các component khác do logic xây dựng URL avatar không xử lý đúng cả hai trường hợp:
- Avatar là **đường dẫn tuyệt đối** (bắt đầu với `http://` hoặc `https://`)
- Avatar là **đường dẫn tương đối** (bắt đầu với `/uploads/...`)

## ✅ Giải Pháp

### Logic xử lý avatar URL đúng:

```typescript
const avatarUrl = user.avatar
  ? user.avatar.startsWith('http')
    ? user.avatar  // Nếu đã là HTTP URL thì giữ nguyên
    : `${baseUrl}${user.avatar}`  // Nếu là đường dẫn tương đối thì concat với base URL
  : "";
```

## 📝 Các File Đã Sửa

### 1. **src/app/profile/page.tsx**
- ✅ Cập nhật logic xây dựng avatar URL trong Avatar section
- ✅ Xử lý cả đường dẫn tuyệt đối và tương đối
- ✅ Thêm timestamp để tránh cache

**Trước:**
```typescript
const avatarUrl = user.avatar
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${user.avatar}?t=${Date.now()}`
  : "";
```

**Sau:**
```typescript
const avatarUrl = user.avatar
  ? user.avatar.startsWith('http')
    ? user.avatar
    : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${user.avatar}`
  : "";

const finalAvatarUrl = avatarUrl ? `${avatarUrl}?t=${Date.now()}` : "";
```

### 2. **src/components/user-avatar.tsx**
- ✅ Component dùng chung trong Header và các nơi khác
- ✅ Cập nhật logic tương tự để đồng nhất

**Trước:**
```typescript
const avatarUrl = user.avatar ? `${baseUrl}${user.avatar}?t=${avatarTimestamp}` : "";
```

**Sau:**
```typescript
const avatarUrl = user.avatar
  ? user.avatar.startsWith('http')
    ? `${user.avatar}?t=${avatarTimestamp}`
    : `${baseUrl}${user.avatar}?t=${avatarTimestamp}`
  : "";
```

### 3. **src/components/chat-widget.tsx**
- ✅ Sửa avatar trong tin nhắn chat
- ✅ Xử lý avatar từ session

### 4. **src/components/product-reviews.tsx**
- ✅ Sửa avatar của người dùng trong đánh giá sản phẩm
- ✅ Xử lý avatar từ `review.userId.avatar`

## 🎯 Kết Quả

✅ Avatar hiển thị đúng trong **Hồ sơ cá nhân**
✅ Avatar hiển thị đúng trong **Header** (UserAvatar component)
✅ Avatar hiển thị đúng trong **Chat Widget**
✅ Avatar hiển thị đúng trong **Product Reviews**
✅ Hỗ trợ cả đường dẫn tuyệt đối và tương đối
✅ Tự động thêm timestamp để tránh cache khi upload avatar mới

## 🔧 Lưu Ý

1. **AvatarImage** từ shadcn/ui (Radix UI) render ra thẻ `<img>` thuần, không phải `next/image`, nên không cần thuộc tính `unoptimized`
2. Backend có thể trả về avatar dưới 2 dạng:
   - Đường dẫn tuyệt đối: `http://localhost:5000/uploads/avatars/abc.jpg`
   - Đường dẫn tương đối: `/uploads/avatars/abc.jpg`
3. Logic mới xử lý được cả 2 trường hợp

## 🧪 Kiểm Tra

1. Đăng nhập vào ứng dụng
2. Vào trang **Hồ sơ cá nhân** (`/profile`)
3. Kiểm tra avatar hiển thị ở:
   - Avatar lớn trong profile page
   - Avatar trong header (góc phải trên)
   - Avatar trong chat widget (nếu có)
   - Avatar trong reviews (nếu đã đánh giá sản phẩm)
4. Thử upload avatar mới để kiểm tra cập nhật

## 📚 Tài Liệu Liên Quan

- [NextAuth.js Session Management](https://next-auth.js.org/getting-started/client#usesession)
- [Radix UI Avatar](https://www.radix-ui.com/docs/primitives/components/avatar)
- [React.memo Optimization](https://react.dev/reference/react/memo)

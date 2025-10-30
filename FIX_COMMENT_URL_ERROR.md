# 🔧 Fix: Lỗi URL undefined khi bình luận

## 🐛 Vấn Đề

**Lỗi:** URL bị undefined khi gửi bình luận
```
http://localhost:5173/articles/view/undefined/articles/public/6902fc0a8c78a590e067c6e7/comments
```

## 🔍 Nguyên Nhân

1. **Sử dụng `fetch` trực tiếp** thay vì `api` service
2. **Biến môi trường undefined**: `import.meta.env.VITE_API_URL` không được định nghĩa
3. **Token key sai**: Dùng `localStorage.getItem('token')` thay vì `adminToken`
4. **Không nhất quán**: Các API khác dùng `articleService` nhưng comment dùng `fetch`

### Code Lỗi (Trước)

```javascript
// ❌ SAI: Dùng fetch trực tiếp
const response = await fetch(`${import.meta.env.VITE_API_URL}/articles/public/${articleId}/comments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}` // ❌ Sai key
  },
  body: JSON.stringify({
    content: commentText,
    parentCommentId: replyTo?._id || null
  })
})
```

**Vấn đề:**
- `import.meta.env.VITE_API_URL` = `undefined`
- `localStorage.getItem('token')` = `null` (key đúng là `adminToken`)
- Không tận dụng interceptors của `apiService`

## ✅ Giải Pháp

### 1. Import `api` service

```javascript
import api from '../../services/apiService'
```

### 2. Sửa hàm `handleSubmitComment`

```javascript
// ✅ ĐÚNG: Dùng api service
const handleSubmitComment = async (e) => {
  e.preventDefault()
  
  if (!commentText.trim()) {
    toast.warning('Vui lòng nhập nội dung bình luận')
    return
  }

  try {
    setSubmitting(true)
    
    const response = await api.post(`/articles/public/${articleId}/comments`, {
      content: commentText,
      parentCommentId: replyTo?._id || null
    })

    if (response.data.success) {
      toast.success('Bình luận thành công')
      setCommentText('')
      setReplyTo(null)
      fetchComments(pagination.currentPage)
    } else {
      toast.error(response.data.message || 'Có lỗi xảy ra')
    }
  } catch (error) {
    toast.error(error.message || 'Không thể gửi bình luận')
  } finally {
    setSubmitting(false)
  }
}
```

### 3. Sửa hàm `handleDeleteComment`

```javascript
// ✅ ĐÚNG: Dùng api service
const handleDeleteComment = async (commentId) => {
  if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return

  try {
    const response = await api.delete(`/comments/${commentId}`)

    if (response.data.success) {
      toast.success('Xóa bình luận thành công')
      fetchComments(pagination.currentPage)
    } else {
      toast.error(response.data.message || 'Có lỗi xảy ra')
    }
  } catch (error) {
    toast.error(error.message || 'Không thể xóa bình luận')
  }
}
```

## 🎯 Lợi Ích Của Giải Pháp

### 1. URL Đúng
```javascript
// api service tự động thêm baseURL
baseURL: 'http://localhost:5000/api'

// Khi gọi: api.post('/articles/public/123/comments')
// URL thực tế: http://localhost:5000/api/articles/public/123/comments ✅
```

### 2. Token Tự Động
```javascript
// Request interceptor tự động gắn token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') // ✅ Đúng key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 3. Error Handling Tập Trung
```javascript
// Response interceptor xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto redirect to login
      window.location.href = '/login'
      toast.error('Phiên đăng nhập đã hết hạn')
    }
    return Promise.reject(error)
  }
)
```

### 4. Code Nhất Quán
- Tất cả API calls đều dùng `api` service
- Dễ maintain và debug
- Tránh duplicate code

## 📝 Files Đã Sửa

1. **`feAdmin/src/pages/articles/ArticleDetailPage.jsx`**
   - ✏️ Import `api` service
   - ✏️ Sửa `handleSubmitComment` dùng `api.post`
   - ✏️ Sửa `handleDeleteComment` dùng `api.delete`

## ✅ Kiểm Tra

### 1. URL đúng
```
✅ http://localhost:5000/api/articles/public/6902fc0a8c78a590e067c6e7/comments
❌ http://localhost:5173/articles/view/undefined/articles/public/6902fc0a8c78a590e067c6e7/comments
```

### 2. Token được gửi
```
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅
```

### 3. Bình luận thành công
```
POST /api/articles/public/123/comments
Status: 201 Created
Response: { success: true, message: "Bình luận đã được tạo thành công", data: {...} }
```

## 🧪 Test Cases

### Test 1: Gửi bình luận mới
1. Vào trang chi tiết bài viết
2. Viết bình luận: "Test comment from admin"
3. Click "Gửi bình luận"
4. ✅ Bình luận xuất hiện với badge "Admin"

### Test 2: Trả lời bình luận
1. Click "Trả lời" trên bình luận bất kỳ
2. Viết câu trả lời: "Test reply"
3. Click "Gửi bình luận"
4. ✅ Câu trả lời xuất hiện dưới bình luận gốc

### Test 3: Xóa bình luận
1. Click icon 🗑️ trên bình luận của mình
2. Xác nhận xóa
3. ✅ Bình luận bị xóa khỏi danh sách

### Test 4: Token hết hạn
1. Xóa token trong localStorage
2. Thử gửi bình luận
3. ✅ Tự động redirect về trang login

## 🔍 Debug Tips

### Kiểm tra token trong localStorage
```javascript
// Mở Console (F12)
console.log(localStorage.getItem('adminToken'))
// Phải có giá trị, không phải null
```

### Kiểm tra Network tab
```
1. Mở DevTools (F12)
2. Tab Network
3. Gửi bình luận
4. Xem request:
   - URL: http://localhost:5000/api/articles/public/.../comments ✅
   - Headers: Authorization: Bearer ... ✅
   - Status: 201 Created ✅
```

### Kiểm tra Console errors
```javascript
// Không có lỗi:
❌ TypeError: Cannot read property 'VITE_API_URL' of undefined
❌ 401 Unauthorized
❌ Network Error
```

## 📚 Tài Liệu Liên Quan

- `feAdmin/src/services/apiService.js` - Cấu hình API service
- `feAdmin/src/services/articleService.js` - Article API calls
- `IMPLEMENTATION_SUMMARY.md` - Tổng quan tính năng

---

**Fixed by:** Kiro AI Assistant  
**Date:** 30/10/2025  
**Status:** ✅ Resolved

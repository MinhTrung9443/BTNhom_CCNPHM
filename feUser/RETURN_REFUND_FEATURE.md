# Hướng dẫn tính năng Trả hàng/Hoàn tiền

## 📋 Tổng quan

Tính năng cho phép người dùng yêu cầu trả hàng và hoàn tiền cho đơn hàng đã nhận. Admin sẽ xem xét và xử lý yêu cầu.

## 🔄 Luồng hoạt động

### 1. Điều kiện để yêu cầu trả hàng
- **Trạng thái chung** (`status`): `shipping`
- **Trạng thái chi tiết** (`timeline[latest].status`): `delivered`

### 2. Khi user gửi yêu cầu trả hàng
- User nhập lý do trả hàng (tối thiểu 10 ký tự)
- API: `POST /api/orders/:orderId/request-return`
- Request body:
  ```json
  {
    "reason": "Lý do trả hàng của user"
  }
  ```

### 3. Sau khi gửi yêu cầu
- **Trạng thái chung** cập nhật: `return_refund`
- **Trạng thái chi tiết** trong timeline: `return_requested`
- Lý do được lưu trong `timeline[latest].metadata.reason`
- UI hiển thị: "Đang xử lý yêu cầu trả hàng"

### 4. Admin xử lý
- Admin có API để chấp nhận yêu cầu
- **Trạng thái chi tiết** cập nhật: `refunded` (khi admin chấp nhận)

## 📁 Files đã thay đổi

### 1. Types (`src/types/order.ts`)
```typescript
// Thêm metadata cho Timeline
export interface Timeline {
  _id: string;
  status: DetailedOrderStatus;
  description: string;
  timestamp: string;
  performedBy: PerformerRole;
  metadata?: {
    reason?: string;  // ✅ MỚI
  };
}

// Thêm fields cho Order
export interface Order {
  // ... existing fields
  returnRequestedAt?: string;      // ✅ MỚI
  returnRequestReason?: string;    // ✅ MỚI
}
```

### 2. Service (`src/services/orderService.ts`)
```typescript
// Thêm method mới
async requestReturn(
  accessToken: string, 
  orderId: string, 
  reason: string
): Promise<ApiResponse<Order>> {
  const response: ApiResponse<Order> = await apiFetch(
    `/orders/${orderId}/request-return`, 
    accessToken, 
    {
      method: 'POST',
      body: JSON.stringify({ reason })
    }
  );
  return response;
}
```

### 3. Component Dialog (`src/components/return-order-dialog.tsx`)
**MỚI** - Dialog cho phép user nhập lý do trả hàng, tương tự `cancel-order-dialog.tsx`

**Features:**
- Validation: Tối thiểu 10 ký tự
- Loading state khi gửi request
- Toast notification cho success/error
- Auto refresh trang sau khi thành công

### 4. Order Card (`src/components/order-card.tsx`)
```typescript
// Thêm logic kiểm tra
const canRequestReturn = 
  order.status === 'shipping' && 
  latestDetailedStatus === 'delivered';

// Thêm button trong Actions
{canRequestReturn && (
  <ReturnOrderDialog 
    orderId={order._id} 
    onSuccess={onOrderUpdate}
    variant="outline"
    className="h-9 px-3 text-sm"
  />
)}
```

### 5. Order Detail Page (`src/app/don-hang/[id]/page.tsx`)
**Cập nhật:**
- Logic tính `canRequestReturn`
- Truyền props `canReturn` cho `OrderDetailClient`
- Hiển thị lý do trong timeline từ `metadata.reason`

### 6. Order Detail Client (`src/app/don-hang/[id]/_components/order-detail-client.tsx`)
**Cập nhật:**
- Thêm props `canReturn` và `latestDetailedStatus`
- Hiển thị button "Đang xử lý yêu cầu trả hàng" khi status = `return_requested`
- Hiển thị `ReturnOrderDialog` khi `canReturn = true`

### 7. Order Status Badge (`src/components/order-status-badge.tsx`)
✅ Đã có sẵn config cho `return_refund` status

## 🎨 UI/UX

### Nút "Trả hàng/Hoàn tiền"
- Icon: `RotateCcw` từ lucide-react
- Variant: `outline`
- Chỉ hiển thị khi đơn đang ở status `shipping` và `delivered`

### Dialog
- Title: "Yêu cầu trả hàng/hoàn tiền"
- Textarea: Nhập lý do (min 10 ký tự)
- Button confirm: "Xác nhận"

### Timeline
- Hiển thị lý do trả hàng trong box màu vàng amber
- Format: **Lý do:** [reason text]

### Trạng thái "Đang xử lý"
- Button disabled với icon Clock + animation pulse
- Text: "Đang xử lý yêu cầu trả hàng"

## 🔍 Testing Checklist

### User Flow
- [ ] Kiểm tra button "Trả hàng/Hoàn tiền" chỉ xuất hiện khi status đúng
- [ ] Dialog mở/đóng đúng cách
- [ ] Validation lý do tối thiểu 10 ký tự
- [ ] Toast notification hiển thị đúng
- [ ] Trang refresh sau khi gửi yêu cầu thành công
- [ ] Timeline hiển thị lý do trả hàng
- [ ] Button "Đang xử lý" xuất hiện sau khi gửi yêu cầu

### Edge Cases
- [ ] Không có token → Redirect login
- [ ] API error → Toast error message
- [ ] Network timeout → Proper error handling
- [ ] Multiple rapid clicks → Button disabled khi loading

## 📝 API Endpoints

### User Request Return
```bash
POST /api/orders/:orderId/request-return
Authorization: Bearer {accessToken}
Content-Type: application/json

Body:
{
  "reason": "string (min 10 chars)"
}

Response 200:
{
  "success": true,
  "message": "Yêu cầu trả hàng của bạn đã được gửi.",
  "data": Order
}
```

### Admin Accept Return (Backend only - not implemented in FE)
```bash
POST /api/orders/:orderId/accept-return (hoặc tương tự)
Authorization: Bearer {adminToken}

Response:
- Cập nhật timeline.status = "refunded"
```

## 🚀 Deployment Notes

1. **Environment Variables**: Đảm bảo `NEXT_PUBLIC_API_BASE_URL` trỏ đúng backend
2. **Build**: Chạy `npm run build` để verify không có lỗi TypeScript
3. **Testing**: Test trên staging trước khi deploy production
4. **Database**: Đảm bảo backend đã cập nhật schema cho `metadata.reason`

## 🔐 Security Considerations

- ✅ Yêu cầu authentication (accessToken)
- ✅ Validation lý do trên cả client và server
- ✅ Chỉ cho phép user trả hàng khi status đúng điều kiện
- ✅ Backend validate ownership của đơn hàng

## 📚 Related Files

- `src/types/order.ts` - Type definitions
- `src/services/orderService.ts` - API service
- `src/components/return-order-dialog.tsx` - Dialog component
- `src/components/order-card.tsx` - Order card with return button
- `src/app/don-hang/[id]/page.tsx` - Order detail page
- `src/app/don-hang/[id]/_components/order-detail-client.tsx` - Client component

---

✅ **Tính năng đã hoàn thành và sẵn sàng sử dụng!**

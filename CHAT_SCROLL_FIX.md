# Sửa lỗi Chat không scroll xuống dưới cùng

## Vấn đề
1. Khi mở tin nhắn ở giao diện admin và user, chat không tự động cuộn xuống dưới cùng để hiện tin nhắn mới nhất, mà dừng ở giữa danh sách tin nhắn.
2. Chat tự động load tin nhắn cũ hơn ngay cả khi không scroll lên (do scrollTop < 100 khi đang scroll xuống dưới).

## Giải pháp đã thực hiện

### 1. **feUser - Chat Widget** (`feUser/src/components/chat-widget.tsx`)

#### Thay đổi:
- **Thêm refs để theo dõi scroll**: 
  - `lastScrollTopRef`: Lưu vị trí scroll trước đó để phát hiện hướng scroll
  - `isInitialLoadRef`: Ngăn load older messages ngay sau khi load tin nhắn đầu tiên

- **Thêm tham số `instant` cho hàm `scrollToBottom()`**: Cho phép scroll tức thì (không có animation) khi cần thiết
  ```typescript
  const scrollToBottom = (instant = false) => {
    if (instant) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  ```

- **Thêm useEffect để scroll khi mở chat**: Tự động scroll xuống dưới ngay khi chat widget được mở
  ```typescript
  useEffect(() => {
    if (isOpen && !isMinimized && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom(true); // Instant scroll on open
      }, 100);
    }
  }, [isOpen, isMinimized]);
  ```

- **Thêm useEffect để scroll khi nhận tin nhắn đầu tiên**: Tự động scroll xuống khi lần đầu load tin nhắn từ server
  ```typescript
  useEffect(() => {
    if (messages.length > 0 && previousMessagesLengthRef.current === 0) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [messages.length]);
  ```

- **Thêm useEffect để reset `shouldScrollToBottomRef`**: Đảm bảo scroll hoạt động đúng sau khi load older messages

- **Cập nhật logic `handleScroll`**: Chỉ load older messages khi đang scroll LÊN
  ```typescript
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
    
    // Chỉ load khi: scroll lên + gần đầu + không đang load + còn tin cũ + không phải initial load
    if (isScrollingUp && scrollTop < 100 && !isLoadingOlderMessages && hasMoreMessages && !isInitialLoadRef.current && messages.length > 0) {
      shouldScrollToBottomRef.current = false;
      loadOlderMessages(messages[0].timestamp);
    }
    
    lastScrollTopRef.current = currentScrollTop;
  };
  ```

### 2. **feAdmin - Chat Page** (`feAdmin/src/pages/ChatPage.jsx`)

#### Thay đổi:
- **Cập nhật hàm `scrollToBottom()` với tham số `instant`**: Tương tự như feUser
  ```javascript
  const scrollToBottom = (instant = false) => {
    if (instant) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  ```

- **Thêm logic scroll trong `handleRoomMessages`**: Tự động scroll xuống ngay sau khi nhận tin nhắn từ server
  ```javascript
  const handleRoomMessages = ({ room, messages: msgs }) => {
    if (room === selectedRoom) {
      setMessages(msgs);
      setHasMoreMessages(msgs.length >= 10);
      
      // Scroll to bottom immediately after receiving initial messages
      if (msgs.length > 0) {
        shouldScrollToBottomRef.current = true;
        // Multiple timeouts to ensure scroll happens after DOM update
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 50);
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 200);
      }
    }
  };
  ```

- **Sử dụng cả 2 phương pháp scroll**: 
  - `scrollTop = scrollHeight`: Scroll trực tiếp container
  - `scrollIntoView`: Scroll đến phần tử cuối cùng
  - Sử dụng multiple timeouts (50ms và 200ms) để đảm bảo DOM đã render xong

- **Thêm logic ngăn auto-load khi scroll xuống**: 
  ```javascript
  const lastScrollTopRef = useRef(0);
  const isInitialLoadRef = useRef(false);
  
  const handleScroll = (e) => {
    const currentScrollTop = e.target.scrollTop;
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
    
    // Chỉ load khi đang scroll LÊN và gần đầu
    if (isScrollingUp && scrollTop < 100 && !isLoadingOlderMessages && hasMoreMessages && !isInitialLoadRef.current) {
      loadOlderMessages();
    }
    
    lastScrollTopRef.current = currentScrollTop;
  };
  ```

- **Thêm cờ `isInitialLoadRef`**: Ngăn load older messages trong 500ms đầu sau khi nhận tin nhắn ban đầu

### 3. **Sửa lỗi TypeScript** (`feUser/src/types/order.ts`)

#### Thay đổi:
- **Thêm property `orderCode`**: Bổ sung thuộc tính `orderCode` vào interface `Order` để khắc phục lỗi TypeScript
  ```typescript
  export interface Order {
    _id: string;
    orderCode?: string; // Thêm dòng này
    // ... các thuộc tính khác
  }
  ```

## Kết quả

✅ **Giao diện feUser**: 
- Chat widget tự động scroll xuống dưới cùng khi mở
- Hiển thị tin nhắn mới nhất ngay lập tức
- Giữ nguyên vị trí scroll khi load tin nhắn cũ hơn
- **Không tự động load older messages khi scroll xuống**

✅ **Giao diện feAdmin**:
- Chat tự động scroll xuống dưới cùng khi chọn user
- Hiển thị tin nhắn mới nhất khi join room
- Giữ nguyên vị trí scroll khi load tin nhắn cũ hơn
- **Không tự động load older messages khi scroll xuống**

✅ **Các tính năng pagination hoạt động chính xác**:
- Load 10 tin nhắn mới nhất ban đầu
- Load 5 tin nhắn cũ hơn **chỉ khi scroll LÊN** và gần đầu (< 100px)
- Hiển thị loading skeleton animation
- Giữ nguyên vị trí scroll sau khi load
- Có thời gian chờ 500ms sau initial load để ngăn trigger không mong muốn

## Testing
- ✅ Build feUser thành công không có lỗi TypeScript
- ✅ Logic scroll được cải thiện cho cả 2 giao diện
- Cần test thực tế trên browser để xác nhận hoạt động đúng

## Files đã thay đổi
1. `feUser/src/components/chat-widget.tsx`
2. `feUser/src/types/order.ts`
3. `feAdmin/src/pages/ChatPage.jsx`

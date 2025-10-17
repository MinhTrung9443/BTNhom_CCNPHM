// app/dashboard/error.tsx
'use client'; // Bắt buộc phải là Client Component

import { useEffect } from 'react';

// Định nghĩa kiểu dữ liệu cho props của component
type ErrorProps = {
  error: Error & { digest?: string }; // Đối tượng lỗi, có thể có thêm thuộc tính digest
  reset: () => void; // Một hàm không có tham số và không trả về gì, dùng để thử render lại
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Ghi lại lỗi vào một hệ thống giám sát (ví dụ: Sentry, LogRocket)
    // console.error an toàn về kiểu dữ liệu vì 'error' chắc chắn là một đối tượng Error
    console.error(error);
  }, [error]);

  return (
    <div>
      <h1>server chưa chạy or bị lỗi 🚧</h1>
    </div>
  );
}
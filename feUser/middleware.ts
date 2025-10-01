// middleware.ts - NextAuth.js v5 (Auth.js)
// Callback 'authorized' trong src/auth.ts sẽ tự động được gọi
import { auth } from '@/auth';

export default auth;

// Matcher giới hạn middleware chỉ chạy cho protected routes
// → Tối ưu performance (không chạy auth check cho /, /login, static files...)
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/profile/:path*',
    '/cart/:path*',
    '/yeu-thich/:path*'
  ]
}

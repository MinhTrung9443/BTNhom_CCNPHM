import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { LoginResponseData } from '@/types/user';
import { ApiResponse } from '@/types/api';

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user1@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email và password là bắt buộc');
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const response: ApiResponse<LoginResponseData> = await res.json();

          if (!res.ok || !response.success) {
            throw new Error(response.message || 'Đăng nhập thất bại');
          }
          
          const { user, token } = response.data;

          if (user && token) {
            return {
              id: user._id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              role: user.role || 'user',
              accessToken: token,
              refreshToken: 'ko có', // Backend không trả về refreshToken
            };
          }

          return null;
        } catch (error: unknown) {
          console.error('Login error:', error);
          const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
          throw new Error(message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ✅ Khi đăng nhập mới (có user từ authorize)
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      
      // ✅ Khi gọi update() từ client (trigger === "update")
      if (trigger === "update" && session) {
        // Cập nhật token với dữ liệu mới từ session
        token.name = session.user.name ?? token.name;
        token.email = session.user.email ?? token.email;
        token.avatar = session.user.avatar ?? token.avatar;
        token.role = session.user.role ?? token.role;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.avatar = token.avatar as string | undefined;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = ['/dashboard', '/profile', '/cart'].some(path => 
        nextUrl.pathname.startsWith(path)
      );

      // Cho phép truy cập public routes
      if (!isProtectedRoute) return true;

      // Protected routes: redirect to login nếu chưa đăng nhập
      if (!isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl.origin);
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },
  pages: {
    signIn: '/login', // Custom login page
    error: '/login', // Error page
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

import 'next-auth';
import { User as ApiUser } from './user';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      role: string;
      accessToken: string;
    };
  }

  // This is the object returned from the `authorize` callback
  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }
}
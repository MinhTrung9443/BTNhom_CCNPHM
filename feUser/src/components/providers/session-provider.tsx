"use client";

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Session } from 'next-auth';

interface Props {
  children: ReactNode;
  session?: Session | null;
}

export default function SessionProvider({ children, session }: Props) {
  return <NextAuthSessionProvider

    // Tắt tính năng refetch khi focus vào cửa sổ
    refetchOnWindowFocus={false}

    session={session}>{children}</NextAuthSessionProvider>;
}

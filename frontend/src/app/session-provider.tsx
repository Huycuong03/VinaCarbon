'use client';

import { SessionProvider } from 'next-auth/react';

export default function SessionProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider basePath="/vinacarbon/api/auth" >{children}</SessionProvider>;
}

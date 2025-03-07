'use client';

import { useSession } from 'next-auth/react';

export default function SessionAwareLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // If session is loading or not available, use #000000 background (pre-login)
  const backgroundColor = status === 'loading' || !session ? '#000000' : '#0F0F0F';

  return (
    <div style={{ backgroundColor, minHeight: '100vh' }}>
      {children}
    </div>
  );
}
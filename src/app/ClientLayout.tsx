'use client';

import { SessionProvider } from 'next-auth/react';
import Header from './components/Header';
import SessionAwareLayout from './SessionAwareLayout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div style={{ minHeight: '100vh' }}> {/* Remove backgroundColor, let SessionAwareLayout handle it */}
        <Header />
        <SessionAwareLayout>{children}</SessionAwareLayout>
      </div>
    </SessionProvider>
  );
}
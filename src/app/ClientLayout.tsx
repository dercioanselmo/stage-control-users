'use client';

import { SessionProvider } from 'next-auth/react';
import Header from './components/Header';
import SessionAwareLayout from './SessionAwareLayout'; 

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}> {/* Default to #0F0F0F, overridden pre-login   000000 */}
        <Header />
        <SessionAwareLayout>{children}</SessionAwareLayout>
      </div>
    </SessionProvider>
  );
}
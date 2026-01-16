'use client';

import { usePathname } from 'next/navigation';
import { Header, Footer } from './index';

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth') ?? false;
  const isBookingPage = pathname?.startsWith('/booking') ?? false;
  const shouldShowLayout = !isAuthPage && !isBookingPage;

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowLayout && <Header />}
      <main className="flex-1">{children}</main>
      {shouldShowLayout && <Footer />}
    </div>
  );
}

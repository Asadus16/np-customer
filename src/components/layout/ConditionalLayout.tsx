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
  const isDemoBookingPage = pathname?.startsWith('/demo/booking') ?? false;
  const isProfilePage = pathname === '/profile' || pathname === '/appointments' || pathname === '/wallet' || pathname === '/favorites' || pathname === '/forms' || pathname === '/orders' || pathname === '/settings';
  const shouldShowLayout = !isAuthPage && !isBookingPage && !isDemoBookingPage;
  const shouldShowFooter = shouldShowLayout && !isProfilePage;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {shouldShowLayout && <Header />}
      <main className="flex-1 bg-white">{children}</main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}

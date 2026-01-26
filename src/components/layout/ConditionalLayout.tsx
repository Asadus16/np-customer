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
  const isMenuPage = pathname === '/menu';
  const isProfilePage = pathname === '/profile' || pathname === '/appointments' || pathname === '/wallet' || pathname === '/favorites' || pathname === '/settings';
  const isVendorsPage = pathname === '/vendors';
  const shouldHideLayout = isAuthPage || isBookingPage || isDemoBookingPage || isMenuPage;
  const shouldShowFooter = !shouldHideLayout && !isProfilePage && !isVendorsPage;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!shouldHideLayout && (
        <div className={isProfilePage ? 'hidden lg:block' : ''}>
          <Header />
        </div>
      )}
      <main className="flex-1 bg-white">{children}</main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}

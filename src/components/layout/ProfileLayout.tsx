'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ProfileSidebar } from './ProfileSidebar';

interface ProfileLayoutProps {
  title?: string;
  children: React.ReactNode;
  showMobileBackButton?: boolean;
  showMobileTitle?: boolean;
}

export function ProfileLayout({ title, children, showMobileBackButton = true, showMobileTitle = true }: ProfileLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block shrink-0">
        <ProfileSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-white lg:bg-[#f9f9f9] overflow-y-auto">
        {/* Mobile Header */}
        {showMobileBackButton && (
          <div className="lg:hidden bg-white px-4 py-4">
            <button
              onClick={handleBack}
              className="h-10 w-10 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="h-5 w-5 text-gray-900" />
            </button>
          </div>
        )}

        <div className="px-4 pb-8 lg:py-8 lg:px-14">
          {title && (
            <h1
              className={`text-2xl lg:text-[28px] leading-[36px] text-[rgb(20,20,20)] lg:pt-2 mb-6 lg:mb-8 lg:ml-19 font-bold lg:font-semibold ${!showMobileTitle ? 'hidden lg:block' : ''}`}
              style={{ fontFamily: 'var(--font-roobert), sans-serif' }}
            >
              {title}
            </h1>
          )}
          <div className="lg:pt-2">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { ProfileSidebar } from './ProfileSidebar';

interface ProfileLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export function ProfileLayout({ title, children }: ProfileLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block shrink-0">
        <ProfileSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-[#f9f9f9] overflow-y-auto">
        <div className="py-6 px-10 lg:py-8 lg:px-14">
          {title && (
            <h1
              className="text-[28px] leading-[36px] text-[rgb(20,20,20)] pt-2 mb-8 ml-19"
              style={{ fontFamily: 'var(--font-roobert), sans-serif', fontWeight: 650 }}
            >
              {title}
            </h1>
          )}
          <div className="pt-2">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

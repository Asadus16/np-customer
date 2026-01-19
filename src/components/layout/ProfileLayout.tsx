'use client';

import { ProfileSidebar } from './ProfileSidebar';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block shrink-0">
        <ProfileSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pt-6 pb-8 px-6 lg:px-12 bg-[#f9f9f9] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

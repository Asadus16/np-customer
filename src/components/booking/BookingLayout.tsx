'use client';

import { ReactNode } from 'react';

interface BookingLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function BookingLayout({ children, sidebar }: BookingLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-30">
      {/* Left Pane - Main Content */}
      <div className="flex-1 min-w-0 pb-8">
        {children}
      </div>

      {/* Right Pane - Sidebar */}
      {sidebar}
    </div>
  );
}

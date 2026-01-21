'use client';

import { ReactNode } from 'react';
import { AnimatedSpotlight } from './AnimatedSpotlight';

interface HomePageLayoutProps {
  children: ReactNode;
  backgroundClassName?: string;
}

export function HomePageLayout({ 
  children, 
  backgroundClassName = 'bg-white' 
}: HomePageLayoutProps) {
  return (
    <>
      {/* Fixed background layer that covers entire viewport including header */}
      <div 
        className={`fixed inset-0 ${backgroundClassName}`}
        style={{ 
          zIndex: -2,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
      />
      {/* Animated Spotlight */}
      <AnimatedSpotlight />
      {/* Content wrapper */}
      <div className="relative min-h-screen overflow-x-hidden">
        {children}
      </div>
    </>
  );
}

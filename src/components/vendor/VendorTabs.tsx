'use client';

import { useState, useRef, useEffect } from 'react';

export type TabType = 'services' | 'reviews' | 'about';

interface VendorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  reviewCount?: number;
}

export function VendorTabs({ activeTab, onTabChange, reviewCount = 0 }: VendorTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'services', label: 'Services' },
    { id: 'reviews', label: 'Reviews', count: reviewCount },
    { id: 'about', label: 'About' },
  ];

  useEffect(() => {
    const activeElement = tabsRef.current?.querySelector(`[data-tab="${activeTab}"]`);
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement as HTMLElement;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={tabsRef} className="relative flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 text-gray-400">({tab.count})</span>
              )}
            </button>
          ))}
          {/* Active Tab Indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
        </div>
      </div>
    </div>
  );
}

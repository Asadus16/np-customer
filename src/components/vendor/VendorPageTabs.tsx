'use client';

export type VendorTabType = 'services' | 'reviews' | 'about';

interface VendorPageTabsProps {
  activeTab: VendorTabType;
  onTabChange: (tab: VendorTabType) => void;
  reviewCount: number;
}

export function VendorPageTabs({
  activeTab,
  onTabChange,
  reviewCount,
}: VendorPageTabsProps) {
  const tabs: { id: VendorTabType; label: string; count?: number }[] = [
    { id: 'services', label: 'Services' },
    { id: 'reviews', label: 'Reviews', count: reviewCount },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              pb-4 text-sm font-medium transition-colors relative
              ${
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-gray-400">({tab.count})</span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

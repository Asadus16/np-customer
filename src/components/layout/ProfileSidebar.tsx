'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks';

const menuItems = [
  { href: '/profile', label: 'Profile', icon: '/header/headerDropdown/profile.svg' },
  { href: '/appointments', label: 'Appointments', icon: '/header/headerDropdown/calendar.svg' },
  { href: '/wallet', label: 'Wallet', icon: '/header/headerDropdown/wallet.svg' },
  { href: '/favorites', label: 'Favorites', icon: '/header/headerDropdown/favorites.svg' },
  { href: '/settings', label: 'Settings', icon: '/header/headerDropdown/settings.svg' },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getUserName = () => {
    if (!user) return 'User';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  };

  return (
    <aside className="w-62 shrink-0 bg-white h-[calc(100vh-72px)] pt-6 pb-8 px-4 border-r border-gray-200">
      <div>
        {/* User Name */}
        <h2 className="text-base font-semibold text-gray-900 px-3 mb-2">
          {getUserName()}
        </h2>

        {/* Navigation */}
        <nav>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 pl-3 pr-2 py-2.75 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#f0f0ff] text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Image src={item.icon} alt="" width={18} height={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

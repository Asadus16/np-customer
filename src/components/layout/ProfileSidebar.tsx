'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Calendar,
  Wallet,
  Heart,
  ClipboardList,
  Package,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks';

const menuItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/forms', label: 'Forms', icon: ClipboardList },
  { href: '/orders', label: 'Product orders', icon: Package },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getUserName = () => {
    if (!user) return 'User';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  };

  return (
    <aside className="w-64 shrink-0 bg-white h-[calc(100vh-72px)] pt-6 pb-8 px-6 border-r border-gray-200">
      <div>
        {/* User Name */}
        <h2 className="text-lg font-semibold text-gray-900 px-3 mb-4">
          {getUserName()}
        </h2>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#f0f0ff] text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

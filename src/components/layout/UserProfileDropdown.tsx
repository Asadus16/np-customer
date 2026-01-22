'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setShowLogoutModal(false);
    router.push(ROUTES.HOME);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get user full name
  const getUserName = () => {
    if (!user) return 'User';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-20 pl-1 pr-3 py-1 bg-white border border-[#d3d3d3] rounded-full hover:shadow-sm active:scale-[0.97] transition-all"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#f0f0ff] flex items-center justify-center text-sm font-semibold text-blue-600">
          {getUserInitials()}
        </div>
        {/* Chevron */}
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-gray-200 z-50 max-h-[calc(100vh-100px)] overflow-y-auto pt-4 pb-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          {/* User Name */}
          <div className="px-4 pt-0 pb-0">
            <p className="font-semibold text-[rgb(20,20,20)] text-base">{getUserName()}</p>
          </div>

          {/* User Links */}
          <div className="pt-0 pb-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors"
            >
              <Image src="/header/headerDropdown/profile.svg" alt="" width={18} height={18} />
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">Profile</span>
            </Link>
            <Link
              href="/appointments"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors"
            >
              <Image src="/header/headerDropdown/calendar.svg" alt="" width={18} height={18} />
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">Appointments</span>
            </Link>
            <Link
              href="/wallet"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors"
            >
              <Image src="/header/headerDropdown/wallet.svg" alt="" width={18} height={18} />
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">Wallet</span>
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors"
            >
              <Image src="/header/headerDropdown/favorites.svg" alt="" width={18} height={18} />
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">Favorites</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors"
            >
              <Image src="/header/headerDropdown/settings.svg" alt="" width={18} height={18} />
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">Settings</span>
            </Link>
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">Log out</span>
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 mx-4 mb-2" />

          {/* General Links */}
          <div className="py-1">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">Download the app</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">Help and support</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors text-left"
            >
              <Image src="/header/headerDropdown/globe.svg" alt="" width={18} height={18} />
              <span className="text-sm font-medium leading-[16px] text-[rgb(20,20,20)]">English</span>
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 mx-4 mt-3" />

          {/* Business Link */}
          <div className="pt-2 pb-3">
            <Link
              href="/business"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between gap-2 px-4 py-[11px] hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold leading-[16px] text-[rgb(20,20,20)]">For businesses</span>
              <Image src="/header/headerDropdown/arrow.svg" alt="" width={14} height={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        email={user?.email || ''}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}

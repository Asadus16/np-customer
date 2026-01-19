'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  Wallet,
  Heart,
  ClipboardList,
  Package,
  Settings,
  ChevronDown,
  ChevronUp,
  Globe,
  ChevronRight,
  LogOut
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
        className="flex items-center justify-between w-20 pl-1 pr-3 py-1 bg-white border border-[#d3d3d3] rounded-full hover:shadow-sm transition-all"
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
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Name */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold text-gray-900 text-base">{getUserName()}</p>
          </div>

          {/* User Links */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">Profile</span>
            </Link>
            <Link
              href="/appointments"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">Appointments</span>
            </Link>
            <Link
              href="/wallet"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">Wallet</span>
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Heart className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">Favorites</span>
            </Link>
            <Link
              href="/forms"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">Forms</span>
            </Link>
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Package className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">Product orders</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Settings className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">Settings</span>
            </Link>
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <LogOut className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">Log out</span>
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200" />

          {/* General Links */}
          <div className="py-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-sm text-gray-900">Download the app</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-sm text-gray-900">Help and support</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Globe className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-900">English</span>
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200" />

          {/* Business Link */}
          <div className="py-2">
            <Link
              href="/business"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">For businesses</span>
              <ChevronRight className="h-4 w-4 text-gray-600" />
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

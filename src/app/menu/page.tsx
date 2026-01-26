'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { getPointsBalance, PointsBalance, formatPoints } from '@/services/pointsService';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  ArrowRight,
  User,
  Calendar,
  Wallet,
  Heart,
  Settings,
  Download,
  HelpCircle,
  Globe,
  LogOut,
} from 'lucide-react';

export default function MobileMenuPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [isMobile, setIsMobile] = useState(true);

  // Redirect to profile on desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        router.replace('/profile');
      }
    };

    // Check on mount
    handleResize();

    // Listen for resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPointsBalance();
    }
  }, [isAuthenticated]);

  const loadPointsBalance = async () => {
    try {
      const balance = await getPointsBalance();
      setPointsBalance(balance);
    } catch (error) {
      console.error('Failed to load points balance:', error);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getUserName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };


  const mainMenuItems = [
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/appointments', label: 'Appointments', icon: Calendar },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
    { href: '/favorites', label: 'Favorites', icon: Heart },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const secondaryMenuItems = [
    { href: '#', label: 'Download the app', icon: Download },
    { href: '#', label: 'Help and support', icon: HelpCircle },
    { href: '#', label: 'English', icon: Globe },
  ];

  // Don't render on desktop (redirecting to profile)
  if (!isMobile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-4">
        <button
          onClick={handleBack}
          className="h-10 w-10 flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="h-5 w-5 text-gray-900" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {/* User Info */}
        <div className="flex items-center justify-between mb-4 py-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getUserName()}</h1>
            <p className="text-gray-500 text-[15px] mt-1.5">Personal profile</p>
          </div>
          <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg">
            {getUserInitials()}
          </div>
        </div>

        {/* Wallet Card */}
        <div
          className="rounded-2xl p-5 mb-4 text-white"
          style={{
            background: 'linear-gradient(to right, #6960fc 0%, #6960fc 60%, #8762fc 75%, #b466fc 85%, #d969fc 92%, #f56bfc 100%)'
          }}
        >
          <p className="text-2xl font-bold mb-0.5">
            {formatPoints(pointsBalance?.available_points || 0)} <span className="text-lg font-normal">Points</span>
          </p>
          <p className="text-white/90 text-sm mb-4">Wallet balance</p>
          <Link
            href="/wallet"
            className="inline-block px-5 py-2 bg-white/20 border border-white/40 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
          >
            View wallet
          </Link>
        </div>

        {/* Main Menu */}
        <div className="bg-white rounded-2xl overflow-hidden mb-4 border border-gray-200">
          {mainMenuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            );
          })}
        </div>

        {/* Secondary Menu */}
        <div className="bg-white rounded-2xl overflow-hidden mb-4 border border-gray-200">
          {secondaryMenuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl overflow-hidden mb-4 border border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900 font-medium">Log out</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* For Businesses */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
          <Link
            href="#"
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900 font-medium">For businesses</span>
            <ArrowRight className="h-5 w-5 text-gray-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}

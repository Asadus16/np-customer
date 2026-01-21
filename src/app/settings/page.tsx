'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config';
import { Loader2 } from 'lucide-react';
import { ProfileLayout } from '@/components/layout/ProfileLayout';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#6950f3]' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

interface NotificationSettings {
  appointment: {
    textMessage: boolean;
    whatsApp: boolean;
  };
  marketing: {
    email: boolean;
    textMessage: boolean;
    whatsApp: boolean;
  };
}

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    appointment: {
      textMessage: true,
      whatsApp: true,
    },
    marketing: {
      email: true,
      textMessage: true,
      whatsApp: true,
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  const handleNotificationChange = (
    category: 'appointment' | 'marketing',
    type: string,
    value: boolean
  ) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value,
      },
    }));
    // TODO: API call to update notification preferences
  };

  const handleConnectSocial = (provider: 'facebook' | 'google') => {
    // TODO: Implement social login connection
    console.log(`Connect ${provider}`);
  };

  const handleUpdatePassword = () => {
    // TODO: Implement password update modal/flow
    console.log('Update password');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account confirmation
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Delete account');
    }
  };

  if (authLoading) {
    return (
      <ProfileLayout title="Settings">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ProfileLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProfileLayout title="Settings">
      <div className="ml-19 max-w-[600px] space-y-6">
        {/* My social logins */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">My social logins</h2>
          <p className="text-gray-500 text-sm mb-6">
            Link social profiles for easier access to your account.
          </p>

          <div className="space-y-0">
            {/* Facebook */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/settings/facebook.svg"
                    alt="Facebook"
                    width={28}
                    height={28}
                  />
                </div>
                <span className="font-medium text-gray-900">Facebook</span>
              </div>
              <button
                onClick={() => handleConnectSocial('facebook')}
                className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Connect
              </button>
            </div>

            {/* Google */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/settings/google.svg"
                    alt="Google"
                    width={28}
                    height={28}
                  />
                </div>
                <span className="font-medium text-gray-900">Google</span>
              </div>
              <button
                onClick={() => handleConnectSocial('google')}
                className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* My notifications */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">My notifications</h2>
          <p className="text-gray-500 text-sm mb-6">
            We will send you updates about your appointments, news and offers.
          </p>

          {/* Appointment notifications */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Appointment notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Text message</span>
                <ToggleSwitch
                  enabled={notifications.appointment.textMessage}
                  onChange={(value) => handleNotificationChange('appointment', 'textMessage', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">WhatsApp</span>
                <ToggleSwitch
                  enabled={notifications.appointment.whatsApp}
                  onChange={(value) => handleNotificationChange('appointment', 'whatsApp', value)}
                />
              </div>
            </div>
          </div>

          {/* Marketing notifications */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Marketing notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Email</span>
                <ToggleSwitch
                  enabled={notifications.marketing.email}
                  onChange={(value) => handleNotificationChange('marketing', 'email', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Text message</span>
                <ToggleSwitch
                  enabled={notifications.marketing.textMessage}
                  onChange={(value) => handleNotificationChange('marketing', 'textMessage', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">WhatsApp</span>
                <ToggleSwitch
                  enabled={notifications.marketing.whatsApp}
                  onChange={(value) => handleNotificationChange('marketing', 'whatsApp', value)}
                />
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-6">
            If you previously opted out to text messages by texting STOP, please reply with START to opt back in.
          </p>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Change password</h2>
          <p className="text-gray-500 text-sm mb-6">Update your password</p>
          <button
            onClick={handleUpdatePassword}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Update my password
          </button>
        </div>

        {/* Delete account */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Delete account</h2>
          <p className="text-gray-500 text-sm mb-6">Are you sure you want to leave?</p>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-2.5 border border-red-500 text-red-500 rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Delete my account
          </button>
        </div>
      </div>
    </ProfileLayout>
  );
}

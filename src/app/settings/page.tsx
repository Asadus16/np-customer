'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config';
import { Loader2, X, Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
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

  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
    <ProfileLayout title="Settings" showMobileBackButton={false} showMobileTitle={false}>
      {/* Mobile Back Button */}
      <button
        onClick={() => router.push('/menu')}
        className="lg:hidden mb-4 -ml-2 mt-2 h-10 w-10 flex items-center justify-center"
      >
        <ArrowLeft className="h-5 w-5 text-gray-900" />
      </button>

      {/* Mobile Title */}
      <h1 className="lg:hidden text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="lg:ml-19 max-w-full lg:max-w-[525px] space-y-6">
        {/* My social logins */}
        <div className="bg-white rounded-2xl lg:border lg:border-gray-200 pt-0 lg:pt-10 pl-0 lg:pl-10 pr-0 lg:pr-8 pb-6 lg:pb-8">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">My social logins</h2>
          <p className="text-gray-500 text-sm mb-6">
            Link social profiles for easier access to your account.
          </p>

          <div className="space-y-0">
            {/* Facebook */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/settings/facebook.svg"
                    alt="Facebook"
                    width={28}
                    height={28}
                    className="w-6 h-6 lg:w-7 lg:h-7"
                  />
                </div>
                <span className="font-medium text-gray-900 text-sm lg:text-base">Facebook</span>
              </div>
              <button
                onClick={() => handleConnectSocial('facebook')}
                className="px-4 lg:px-5 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Connect
              </button>
            </div>

            {/* Google */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/settings/google.svg"
                    alt="Google"
                    width={28}
                    height={28}
                    className="w-6 h-6 lg:w-7 lg:h-7"
                  />
                </div>
                <span className="font-medium text-gray-900 text-sm lg:text-base">Google</span>
              </div>
              <button
                onClick={() => handleConnectSocial('google')}
                className="px-4 lg:px-5 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* My notifications */}
        <div className="bg-white rounded-2xl lg:border lg:border-gray-200 pt-0 lg:pt-10 pl-0 lg:pl-10 pr-0 lg:pr-8 pb-6 lg:pb-8">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">My notifications</h2>
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
        <div className="bg-white rounded-2xl lg:border lg:border-gray-200 pt-0 lg:pt-10 pl-0 lg:pl-10 pr-0 lg:pr-8 pb-6 lg:pb-8">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">Change password</h2>
          <p className="text-gray-500 text-sm mb-6">Update your password</p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Update my password
          </button>
        </div>

        {/* Delete account */}
        <div className="bg-white rounded-2xl lg:border lg:border-gray-200 pt-0 lg:pt-10 pl-0 lg:pl-10 pr-0 lg:pr-8 pb-6 lg:pb-8">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">Delete account</h2>
          <p className="text-gray-500 text-sm mb-6">Are you sure you want to leave?</p>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-2.5 border border-red-500 text-red-500 rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Delete my account
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          email={user?.email || ''}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </ProfileLayout>
  );
}

interface ChangePasswordModalProps {
  email: string;
  onClose: () => void;
}

function ChangePasswordModal({ email, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: API call to change password
      console.log('Change password:', { currentPassword, newPassword });
      onClose();
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 lg:p-4">
      <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-full lg:max-w-[475px] overflow-hidden relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-900" />
        </button>

        {/* Header */}
        <div className="px-4 lg:px-8 pt-6 lg:pt-8 pb-2">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Change password</h2>
        </div>

        {/* Content */}
        <div className="px-4 lg:px-8 pt-2 pb-6 lg:pb-8">
          <p className="text-gray-600 text-sm mb-6">
            Please enter a new password for <span className="font-medium text-gray-900">{email}</span>
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Enter current password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6950f3] focus:border-transparent pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Enter new password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6950f3] focus:border-transparent pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6950f3] focus:border-transparent pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <p className="text-sm text-gray-600 pt-2">
              If you forgot your password,{' '}
              <a href="#" className="text-[#6950f3] hover:underline">
                you can reset by clicking on this link.
              </a>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Update'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

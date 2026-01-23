'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { useAppDispatch } from '@/store/hooks';
import { updateProfile } from '@/store/slices/authSlice';
import { ROUTES } from '@/config';
import { Loader2, Home, Briefcase, ExternalLink } from 'lucide-react';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { AddressModal } from '@/components/profile/AddressModal';
import {
  getAddresses,
  createAddress,
  updateAddress,
  Address,
} from '@/lib/address';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    emirates_id: '',
  });
  const [originalData, setOriginalData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      const data = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        emirates_id: user.emirates_id || '',
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [user]);

  // Fetch addresses
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      const response = await getAddresses();
      setAddresses(response.data || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const result = await dispatch(updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      }));

      if (updateProfile.fulfilled.match(result)) {
        setOriginalData(formData);
        setIsEditing(false);
      } else {
        setError(result.payload as string || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Address handlers
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (data: {
    label: string;
    street_address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  }) => {
    setAddressSubmitting(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, data);
      } else {
        await createAddress(data);
      }
      await fetchAddresses();
      setShowAddressModal(false);
      setEditingAddress(null);
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setAddressSubmitting(false);
    }
  };

  // Get user initials
  const getUserInitials = () => {
    const first = formData.first_name?.[0] || '';
    const last = formData.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  // Get full name
  const getFullName = () => {
    return `${formData.first_name} ${formData.last_name}`.trim() || 'User';
  };

  // Find home and work addresses
  const homeAddress = addresses.find((a) => a.label.toLowerCase() === 'home');
  const workAddress = addresses.find((a) => a.label.toLowerCase() === 'work');

  if (authLoading) {
    return (
      <ProfileLayout title="Profile">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ProfileLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <ProfileLayout title="Profile">
        <div className="grid grid-cols-1 lg:grid-cols-[0.69fr_1fr] gap-4 lg:gap-8 max-w-4xl lg:ml-19">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.12)] lg:shadow-none p-4 lg:p-6">
          {/* Edit Button */}
          <div className="flex justify-end mb-4 pt-2 lg:pt-4 pr-2 lg:pr-4">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="text-gray-600 font-medium hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-4 lg:mb-6">
            <div className="relative">
              <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[#e8e8ff] flex items-center justify-center">
                <span className="text-3xl lg:text-4xl font-semibold text-blue-600">
                  {getUserInitials()}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-200 transition-colors">
                <img src="/profile/pen.svg" alt="Edit" className="h-4 w-4" />
              </button>
            </div>
            <h2
              className="mt-3 lg:mt-4 pt-2 lg:pt-0 pb-6 text-2xl lg:text-[28px] leading-tight lg:leading-9 text-[rgb(20,20,20)]"
              style={{ fontFamily: 'var(--font-roobert), AktivGroteskVF, sans-serif', fontWeight: 600 }}
            >
              {getFullName()}
            </h2>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6 lg:my-8 mx-2 lg:mx-4" />

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Profile Fields */}
          <div className="space-y-4 lg:space-y-5 px-2 lg:pl-4 lg:pr-0">
            <ProfileField
              label="First name"
              value={formData.first_name}
              isEditing={isEditing}
              onChange={(v) => handleChange('first_name', v)}
            />
            <ProfileField
              label="Last name"
              value={formData.last_name}
              isEditing={isEditing}
              onChange={(v) => handleChange('last_name', v)}
            />
            <ProfileField
              label="Mobile number"
              value={formData.phone}
              isEditing={isEditing}
              onChange={(v) => handleChange('phone', v)}
            />
            <ProfileField
              label="Email"
              value={formData.email}
              isEditing={false}
              onChange={() => {}}
              disabled
            />
            <ProfileField
              label="Date of birth"
              value={formData.date_of_birth || '-'}
              isEditing={false}
              onChange={() => {}}
            />
            <ProfileField
              label="Gender"
              value={formData.gender || '-'}
              isEditing={false}
              onChange={() => {}}
            />
            <ProfileField
              label="Nationality"
              value={formData.nationality || '-'}
              isEditing={false}
              onChange={() => {}}
            />
            <ProfileField
              label="Emirates ID"
              value={formData.emirates_id || '-'}
              isEditing={false}
              onChange={() => {}}
            />
          </div>
        </div>

        {/* My Addresses */}
        <div className="pt-4 lg:bg-white lg:rounded-2xl lg:border lg:border-gray-200 lg:p-6 lg:pt-10 lg:pl-10">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6 lg:mb-8">My addresses</h3>

          {addressesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Home Address */}
              <AddressCard
                icon={<Home className="h-5 w-5 text-gray-500" />}
                title="Home"
                subtitle={homeAddress?.street_address || 'Add a home address'}
                hasAddress={!!homeAddress}
                onClick={() => homeAddress ? handleEditAddress(homeAddress) : handleAddAddress()}
              />

              {/* Work Address */}
              <AddressCard
                icon={<Briefcase className="h-5 w-5 text-gray-500" />}
                title="Work"
                subtitle={workAddress?.street_address || 'Add a work address'}
                hasAddress={!!workAddress}
                onClick={() => workAddress ? handleEditAddress(workAddress) : handleAddAddress()}
              />

              {/* Add Button */}
              <button
                onClick={handleAddAddress}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                <img src="/profile/plus.svg" alt="Add" className="w-5 h-5" />
                <span className="font-medium text-gray-900">Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Terms and Policies */}
        <div className="pt-4 lg:col-span-2 lg:max-w-4xl lg:ml-19">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Terms and policies</h3>
          <div className="space-y-1">
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="text-sm lg:text-base">Privacy policy</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="text-sm lg:text-base">Terms of service</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
            <a
              href="/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="text-sm lg:text-base">Terms of use</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
          </div>
        </div>
        </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        editingAddress={editingAddress ? {
          id: editingAddress.id,
          label: editingAddress.label,
          street_address: editingAddress.street_address,
          city: editingAddress.city,
          latitude: editingAddress.latitude,
          longitude: editingAddress.longitude,
        } : null}
        isSubmitting={addressSubmitting}
      />
    </ProfileLayout>
  );
}

// Profile Field Component
function ProfileField({
  label,
  value,
  isEditing,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
      {isEditing && !disabled ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
        />
      ) : (
        <p className="text-gray-600">{value || '-'}</p>
      )}
    </div>
  );
}

// Address Card Component
function AddressCard({
  icon,
  title,
  subtitle,
  hasAddress,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  hasAddress: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 lg:gap-4 p-3 pl-4 lg:p-4 lg:pl-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
    >
      <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 text-sm lg:text-base">{title}</p>
        <p className={`text-xs lg:text-sm truncate ${hasAddress ? 'text-gray-600' : 'text-gray-400'}`}>
          {subtitle}
        </p>
      </div>
    </button>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config';
import { Loader2, CreditCard, X, Trash2, ArrowLeft } from 'lucide-react';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import Image from 'next/image';
import {
  getPaymentMethods,
  deletePaymentMethod,
  createSetupIntent,
  attachPaymentMethod,
  PaymentMethod,
} from '@/services/paymentService';
import {
  getPointsBalance,
  PointsBalance,
  formatPoints,
} from '@/services/pointsService';
import StripeProvider from '@/components/stripe/StripeProvider';
import CardForm from '@/components/stripe/CardForm';

export default function WalletPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPaymentMethods();
      loadPointsBalance();
    }
  }, [isAuthenticated]);

  const loadPaymentMethods = async () => {
    try {
      setIsLoadingCards(true);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const loadPointsBalance = async () => {
    try {
      setIsLoadingPoints(true);
      const balance = await getPointsBalance();
      setPointsBalance(balance);
    } catch (error) {
      console.error('Failed to load points balance:', error);
      // Set default balance if API fails
      setPointsBalance({
        points: 0,
        available_points: 0,
        pending_points: 0,
        expiring_soon: 0,
        lifetime_earned: 0,
        lifetime_redeemed: 0,
      });
    } finally {
      setIsLoadingPoints(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to remove this card?')) return;

    try {
      setDeletingCardId(id);
      await deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    } finally {
      setDeletingCardId(null);
    }
  };

  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower === 'visa') {
      return '/cards/visa.svg';
    } else if (brandLower === 'mastercard') {
      return '/cards/mastercard.svg';
    } else if (brandLower === 'amex') {
      return '/cards/amex.svg';
    }
    return null;
  };

  if (authLoading) {
    return (
      <ProfileLayout>
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
    <ProfileLayout title="Wallet" showMobileBackButton={false} showMobileTitle={false}>
      {/* Mobile Wallet Balance Card - Full width with back button inside */}
      <div className="lg:hidden -mx-4 -mt-4">
        <div
          className="p-4 pt-10 pb-10 text-white min-h-[233px]"
          style={{
            background: 'linear-gradient(to right, #6960fc 0%, #6960fc 60%, #8762fc 75%, #b466fc 85%, #d969fc 92%, #f56bfc 100%)'
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => router.push('/menu')}
            className="mb-6"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>

          {isLoadingPoints ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : (
            <>
              <p className="text-4xl font-bold mb-1">
                {formatPoints(pointsBalance?.available_points || 0)} <span className="text-xl font-normal">Points</span>
              </p>
              <p className="text-white text-sm">Wallet balance</p>
            </>
          )}
        </div>
      </div>

      <div className="lg:ml-19 max-w-full lg:max-w-[525px]">
        {/* Desktop Wallet Balance Card */}
        <div
          className="hidden lg:block rounded-2xl p-8 mb-6 text-white h-48"
          style={{
            background: 'linear-gradient(to right, #6960fc 0%, #6960fc 60%, #8762fc 75%, #b466fc 85%, #d969fc 92%, #f56bfc 100%)'
          }}
        >
          {isLoadingPoints ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : (
            <>
              <p className="text-4xl font-bold mb-1">
                {formatPoints(pointsBalance?.available_points || 0)} <span className="text-2xl font-normal">Points</span>
              </p>
              <p className="text-white text-base">Wallet balance</p>
              {(pointsBalance?.pending_points || 0) > 0 && (
                <p className="text-white/80 text-sm mt-2">
                  +{formatPoints(pointsBalance?.pending_points || 0)} pending
                </p>
              )}
            </>
          )}
        </div>

        {/* Cards Section */}
        <div className="bg-white lg:rounded-2xl lg:border lg:border-gray-200 overflow-hidden">
          <div className="pt-6 lg:px-8 lg:pt-10 lg:pl-10">
            <h2 className="text-lg font-semibold text-gray-900">Cards</h2>
          </div>

          {isLoadingCards ? (
            <div className="p-8 lg:p-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="pb-6 lg:px-8 lg:pb-8 pt-4">
              {/* Saved Cards List */}
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-3 lg:gap-4 py-4 lg:py-5 border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {getCardIcon(method.brand) ? (
                      <Image
                        src={getCardIcon(method.brand)!}
                        alt={method.brand}
                        width={32}
                        height={20}
                        className="object-contain"
                      />
                    ) : (
                      <CreditCard className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm lg:text-base">
                      {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">
                      Expires {method.expiry_month}/{method.expiry_year}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(method.id)}
                    disabled={deletingCardId === method.id}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {deletingCardId === method.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}

              {/* Add Card Option */}
              <button
                onClick={() => setShowAddCardModal(true)}
                className="w-full flex items-center gap-3 lg:gap-4 py-4 lg:py-5 hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg border border-gray-200 flex items-center justify-center">
                  <Image
                    src="/cards/wallet/add-card.svg"
                    alt="Add card"
                    width={28}
                    height={28}
                    className="text-[#6950f3]"
                    style={{ filter: 'invert(32%) sepia(93%) saturate(1352%) hue-rotate(234deg) brightness(87%) contrast(101%)' }}
                  />
                </div>
                <span className="font-medium text-gray-900 text-sm lg:text-base">Add debit/credit card</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <AddCardModal
          onClose={() => setShowAddCardModal(false)}
          onSuccess={() => {
            setShowAddCardModal(false);
            loadPaymentMethods();
          }}
        />
      )}
    </ProfileLayout>
  );
}

interface AddCardModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddCardModal({ onClose, onSuccess }: AddCardModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSetupIntent();
  }, []);

  const initializeSetupIntent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const secret = await createSetupIntent();
      setClientSecret(secret);
    } catch (err) {
      console.error('Failed to create setup intent:', err);
      setError('Failed to initialize card form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async (paymentMethodId: string) => {
    try {
      await attachPaymentMethod(paymentMethodId);
      onSuccess();
    } catch (err) {
      console.error('Failed to attach payment method:', err);
      setError('Failed to save card. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 lg:p-4">
      <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-full lg:max-w-[475px] overflow-hidden relative max-h-[90vh] lg:max-h-none overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:top-6 lg:right-8 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-900" />
        </button>

        {/* Header */}
        <div className="px-6 lg:px-12 lg:pr-14 pt-10 lg:pt-16 pb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Add card</h2>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-12 lg:pr-14 pt-4 pb-8 lg:pb-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error && !clientSecret ? (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-2.5 border border-gray-300 rounded-full font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={initializeSetupIntent}
                  className="flex-1 px-6 py-2.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : clientSecret ? (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}
              <StripeProvider clientSecret={clientSecret}>
                <CardForm
                  onSuccess={handleSuccess}
                  onCancel={onClose}
                  isSubmitting={isSubmitting}
                  setIsSubmitting={setIsSubmitting}
                />
              </StripeProvider>

              {/* Pay securely with */}
              <div className="flex items-center gap-3 pt-6 mt-2">
                <span className="text-sm text-gray-500">Pay securely with</span>
                <div className="flex items-center gap-1.5">
                  <Image src="/cards/wallet/card-1.svg" alt="Visa" width={24} height={16} className="object-contain" />
                  <Image src="/cards/wallet/card-2.svg" alt="Mastercard" width={24} height={16} className="object-contain" />
                  <Image src="/cards/wallet/card-3.svg" alt="Amex" width={24} height={16} className="object-contain" />
                  <Image src="/cards/wallet/card-4.svg" alt="Discover" width={24} height={16} className="object-contain" />
                  <Image src="/cards/wallet/card-5.svg" alt="Diners" width={24} height={16} className="object-contain" />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

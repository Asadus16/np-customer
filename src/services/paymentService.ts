import api from '@/lib/api';

export interface PaymentMethod {
  id: string;
  provider: string;
  brand: string;
  last4: string;
  expiry_month: string;
  expiry_year: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodListResponse {
  status: string;
  data: PaymentMethod[];
}

export interface SetupIntentResponse {
  status: string;
  data: {
    client_secret: string;
  };
}

export interface PaymentMethodResponse {
  status: string;
  data: PaymentMethod;
}

/**
 * Get all saved payment methods for the current user
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await api.get<PaymentMethodListResponse>('/customer/payment-methods');
  return response.data.data || [];
}

/**
 * Create a Stripe setup intent for adding a new card
 */
export async function createSetupIntent(): Promise<string> {
  const response = await api.post<SetupIntentResponse>('/customer/payment-methods/setup-intent');
  return response.data.data.client_secret;
}

/**
 * Attach a payment method after Stripe confirmation
 */
export async function attachPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
  const response = await api.post<PaymentMethodResponse>('/customer/payment-methods', {
    payment_method_id: paymentMethodId,
  });
  return response.data.data;
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
  const response = await api.post<PaymentMethodResponse>(`/customer/payment-methods/${id}/default`);
  return response.data.data;
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  await api.delete(`/customer/payment-methods/${id}`);
}

/**
 * Get card brand display info
 */
export function getCardBrandDisplay(brand: string): { name: string; color: string } {
  const brands: Record<string, { name: string; color: string }> = {
    visa: { name: 'Visa', color: '#1A1F71' },
    mastercard: { name: 'Mastercard', color: '#EB001B' },
    amex: { name: 'American Express', color: '#006FCF' },
    discover: { name: 'Discover', color: '#FF6000' },
    diners: { name: 'Diners Club', color: '#0079BE' },
    jcb: { name: 'JCB', color: '#0B4EA2' },
    unionpay: { name: 'UnionPay', color: '#D10429' },
  };

  return brands[brand.toLowerCase()] || { name: brand, color: '#6B7280' };
}

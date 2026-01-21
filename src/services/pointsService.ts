import api from '@/lib/api';

// Points Balance Types
export interface PointsBalance {
  points: number;
  available_points: number;
  pending_points: number;
  expiring_soon: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
}

export interface PointsBalanceResponse {
  data: PointsBalance;
  message: string;
}

// Points Transaction Types
export interface PointsTransaction {
  id: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  balance_after: number;
  order_id: number | null;
  order_number: string | null;
  description: string;
  created_at: string;
}

export interface PointsHistoryResponse {
  data: PointsTransaction[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

// Redemption Types
export interface RedemptionCalculation {
  points_to_redeem: number;
  discount_amount: number;
  discount_per_point: number;
  order_total_after_discount: number;
  can_redeem: boolean;
  available_points: number;
  min_points_required: number;
}

export interface RedemptionCalculationResponse {
  data: RedemptionCalculation;
  message: string;
}

/**
 * Get customer points balance
 */
export async function getPointsBalance(): Promise<PointsBalance> {
  const response = await api.get<PointsBalanceResponse>('/customer/points/balance');
  return response.data.data;
}

/**
 * Get customer points history
 */
export async function getPointsHistory(params?: {
  type?: 'earned' | 'redeemed' | 'adjusted' | 'expired';
  from_date?: string;
  to_date?: string;
  per_page?: number;
  page?: number;
}): Promise<PointsHistoryResponse> {
  const response = await api.get<PointsHistoryResponse>('/customer/points/history', { params });
  return response.data;
}

/**
 * Calculate redemption discount
 */
export async function calculateRedemptionDiscount(
  pointsToRedeem: number,
  orderTotal: number
): Promise<RedemptionCalculation> {
  const response = await api.post<RedemptionCalculationResponse>('/customer/points/calculate-redemption', {
    points_to_redeem: pointsToRedeem,
    order_total: orderTotal,
  });
  return response.data.data;
}

/**
 * Format points with thousands separator
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Calculate AED value from points (default: 10 points = 1 AED)
 */
export function calculatePointsValue(points: number, discountPerPoint: number = 0.1): number {
  return points * discountPerPoint;
}

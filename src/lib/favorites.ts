import api from './api';

export interface FavoriteVendor {
  id: string;
  name: string;
  logo: string | null;
  initials?: string;
  images?: string[];
  category: {
    id: string;
    name: string;
    commission_rate?: number;
  } | null;
  service_areas?: Array<{
    id: string;
    name: string;
  }>;
  rating: number;
  reviews_count: number;
  location?: string;
  starting_price: number;
  is_favorite?: boolean;
}

export interface FavoritesResponse {
  data: FavoriteVendor[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Get customer's favorite vendors
 */
export async function getFavorites(params?: {
  page?: number;
  per_page?: number;
}): Promise<FavoritesResponse> {
  const response = await api.get('/customer/vendors/favorites', { params });
  return response.data;
}

/**
 * Add vendor to favorites
 */
export async function addToFavorites(vendorId: string): Promise<{ message: string }> {
  const response = await api.post(`/customer/vendors/${vendorId}/favorite`);
  return response.data;
}

/**
 * Remove vendor from favorites
 */
export async function removeFromFavorites(vendorId: string): Promise<{ message: string }> {
  const response = await api.delete(`/customer/vendors/${vendorId}/favorite`);
  return response.data;
}

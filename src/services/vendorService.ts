import api, { ApiResponse } from '@/lib/api';
import { VendorCardData } from '@/components/home';

export interface VendorApiResponse {
  id: string;
  name: string;
  description?: string;
  logo: string;
  category?: {
    id: string;
    name: string;
  };
  service_areas?: Array<{
    id: string;
    name: string;
  }>;
  rating: number;
  reviews_count: number;
  starting_price: number;
  is_favorite?: boolean;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
}

export interface VendorsListResponse {
  data: VendorApiResponse[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Check if a string is a valid URL (http, https, or absolute path)
 */
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  // Check if it's a valid URL (http/https) or absolute path starting with /
  return url.startsWith('http://') || 
         url.startsWith('https://') || 
         url.startsWith('/');
}

/**
 * Map API vendor response to VendorCardData format
 */
export function mapVendorToCardData(vendor: VendorApiResponse): VendorCardData {
  // Get location from service areas or use a default
  const location = vendor.service_areas && vendor.service_areas.length > 0
    ? vendor.service_areas[0].name
    : 'Location not available';

  // Get category name
  const category = vendor.category?.name || 'Uncategorized';

  // Handle logo - API returns initials, not a URL
  // Use placeholder image since we don't have actual image URLs from API
  const logo = isValidImageUrl(vendor.logo) ? vendor.logo : '/placeholder.jpg';
  
  // For images, use placeholder since API doesn't return actual image URLs
  // The logo field contains initials (like "AB"), not image URLs
  const images: string[] = ['/placeholder.jpg'];

  return {
    id: vendor.id,
    name: vendor.name,
    logo,
    images,
    category,
    rating: vendor.rating || 0,
    reviewCount: vendor.reviews_count || 0,
    location,
    startingPrice: vendor.starting_price || 0,
    isVerified: true, // All approved vendors are verified
    isFeatured: false, // You can add this field to the API if needed
  };
}

/**
 * Fetch vendors list (public endpoint, no auth required)
 */
export async function fetchVendors(params?: {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}): Promise<VendorsListResponse> {
  // Use public endpoint that doesn't require authentication
  const response = await api.get<ApiResponse<VendorApiResponse[]>>('/public/vendors', {
    params,
  });

  return {
    data: response.data.data || [],
    meta: response.data.meta,
  };
}

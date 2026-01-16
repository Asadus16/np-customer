import api, { ApiResponse } from '@/lib/api';
import { VendorCardData } from '@/components/home';

export interface VendorApiResponse {
  id: string;
  name: string;
  description?: string;
  logo: string | null;
  initials: string;
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

  // Handle logo - use actual logo URL if available, otherwise use initials
  const logo = vendor.logo && isValidImageUrl(vendor.logo) ? vendor.logo : null;

  // For images, use logo if available, otherwise use placeholder
  const images: string[] = logo ? [logo] : ['/placeholder.jpg'];

  return {
    id: vendor.id,
    name: vendor.name,
    logo,
    initials: vendor.initials,
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

/**
 * Vendor detail API response with services
 */
export interface SubServiceApiResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  images?: string[];
}

export interface ServiceApiResponse {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sub_services?: SubServiceApiResponse[];
}

export interface CompanyHourSlotApiResponse {
  id: string;
  start_time: string;
  end_time: string;
}

export interface CompanyHourApiResponse {
  id: string;
  day: string;
  is_available: boolean;
  slots: CompanyHourSlotApiResponse[];
}

export interface VendorDetailApiResponse {
  id: string;
  name: string;
  description?: string;
  logo: string | null;
  initials: string;
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
  landline?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  services?: ServiceApiResponse[];
  company_hours?: CompanyHourApiResponse[];
  reviews?: ReviewApiResponse[];
}

/**
 * Fetch single vendor by ID (public endpoint)
 */
export async function fetchVendorById(vendorId: string): Promise<VendorDetailApiResponse> {
  const response = await api.get<ApiResponse<VendorDetailApiResponse>>(`/public/vendors/${vendorId}`);
  return response.data.data;
}

/**
 * Review API response
 */
export interface ReviewApiResponse {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    id: string;
    name: string;
  };
}

export interface ReviewsListResponse {
  data: ReviewApiResponse[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Fetch vendor reviews (public endpoint)
 */
export async function fetchVendorReviews(vendorId: string, params?: {
  page?: number;
  per_page?: number;
}): Promise<ReviewsListResponse> {
  const response = await api.get<ApiResponse<ReviewApiResponse[]>>(`/public/vendors/${vendorId}/reviews`, {
    params,
  });
  return {
    data: response.data.data || [],
    meta: response.data.meta,
  };
}

/**
 * Fetch nearby vendors (same service areas)
 */
export async function fetchNearbyVendors(vendorId: string, params?: {
  limit?: number;
}): Promise<VendorsListResponse> {
  const response = await api.get<ApiResponse<VendorApiResponse[]>>(`/public/vendors/${vendorId}/nearby`, {
    params,
  });
  return {
    data: response.data.data || [],
    meta: response.data.meta,
  };
}

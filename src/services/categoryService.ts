import api, { ApiResponse } from '@/lib/api';

export interface CategoryApiResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: boolean;
  vendor_count?: number;
}

export interface CategoriesListResponse {
  data: CategoryApiResponse[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Fetch all categories (public endpoint, no auth required)
 */
export async function fetchCategories(params?: {
  page?: number;
  per_page?: number;
}): Promise<CategoriesListResponse> {
  const response = await api.get<ApiResponse<CategoryApiResponse[]>>('/public/categories', {
    params,
  });

  return {
    data: response.data.data || [],
    meta: response.data.meta,
  };
}

/**
 * Fetch all categories without pagination (for dropdowns)
 */
export async function fetchAllCategories(): Promise<CategoryApiResponse[]> {
  const response = await api.get<ApiResponse<CategoryApiResponse[]>>('/public/categories', {
    params: { per_page: 100 },
  });

  return response.data.data || [];
}

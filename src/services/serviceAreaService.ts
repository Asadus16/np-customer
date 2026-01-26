import api, { ApiResponse } from '@/lib/api';

export interface ServiceAreaApiResponse {
  id: string;
  name: string;
  image: string | null;
  status: boolean;
}

export interface ServiceAreasListResponse {
  data: ServiceAreaApiResponse[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Fetch all service areas (public endpoint, no auth required)
 */
export async function fetchServiceAreas(params?: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ServiceAreasListResponse> {
  const response = await api.get<ApiResponse<ServiceAreaApiResponse[]>>('/public/service-areas', {
    params,
  });

  return {
    data: response.data.data || [],
    meta: response.data.meta,
  };
}

/**
 * Fetch all service areas without pagination (for dropdowns)
 */
export async function fetchAllServiceAreas(): Promise<ServiceAreaApiResponse[]> {
  const response = await api.get<ApiResponse<ServiceAreaApiResponse[]>>('/public/service-areas', {
    params: { per_page: 100 },
  });

  return response.data.data || [];
}

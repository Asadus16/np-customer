import { useState, useEffect, useCallback } from 'react';
import { fetchVendors, mapVendorToCardData, VendorsListResponse } from '@/services/vendorService';
import { VendorCardData } from '@/components/home';

interface UseVendorsOptions {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  enabled?: boolean;
}

interface UseVendorsReturn {
  vendors: VendorCardData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  meta?: VendorsListResponse['meta'];
}

export function useVendors(options: UseVendorsOptions = {}): UseVendorsReturn {
  const {
    search,
    category,
    sort = 'distance',
    page = 1,
    perPage = 20,
    enabled = true,
  } = options;

  const [vendors, setVendors] = useState<VendorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<VendorsListResponse['meta']>();

  const loadVendors = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchVendors({
        search,
        category,
        sort,
        page,
        per_page: perPage,
      });

      const mappedVendors = response.data.map(mapVendorToCardData);
      setVendors(mappedVendors);
      setMeta(response.meta);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch vendors');
      setError(error);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, sort, page, perPage, enabled]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  return {
    vendors,
    isLoading,
    error,
    refetch: loadVendors,
    meta,
  };
}

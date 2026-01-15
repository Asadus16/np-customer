import { useState, useEffect, useCallback } from 'react';
import { fetchVendorById, VendorDetailApiResponse } from '@/services/vendorService';

interface UseVendorReturn {
  vendor: VendorDetailApiResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useVendor(vendorId: string | null): UseVendorReturn {
  const [vendor, setVendor] = useState<VendorDetailApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadVendor = useCallback(async () => {
    if (!vendorId) {
      setVendor(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchVendorById(vendorId);
      setVendor(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch vendor');
      setError(error);
      setVendor(null);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  return {
    vendor,
    isLoading,
    error,
    refetch: loadVendor,
  };
}

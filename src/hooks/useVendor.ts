import { useState, useEffect, useCallback } from 'react';
import { fetchVendorById, fetchVendorReviews, fetchNearbyVendors, VendorDetailApiResponse, ReviewApiResponse, VendorApiResponse } from '@/services/vendorService';

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

interface UseVendorReviewsReturn {
  reviews: ReviewApiResponse[];
  isLoading: boolean;
  error: Error | null;
  totalReviews: number;
  refetch: () => void;
}

export function useVendorReviews(vendorId: string | null): UseVendorReviewsReturn {
  const [reviews, setReviews] = useState<ReviewApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);

  const loadReviews = useCallback(async () => {
    if (!vendorId) {
      setReviews([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchVendorReviews(vendorId, { per_page: 6 });
      setReviews(response.data);
      setTotalReviews(response.meta?.total || response.data.length);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch reviews');
      setError(error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    isLoading,
    error,
    totalReviews,
    refetch: loadReviews,
  };
}

interface UseNearbyVendorsReturn {
  nearbyVendors: VendorApiResponse[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useNearbyVendors(vendorId: string | null, limit: number = 10): UseNearbyVendorsReturn {
  const [nearbyVendors, setNearbyVendors] = useState<VendorApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadNearbyVendors = useCallback(async () => {
    if (!vendorId) {
      setNearbyVendors([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchNearbyVendors(vendorId, { limit });
      setNearbyVendors(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch nearby vendors');
      setError(error);
      setNearbyVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, limit]);

  useEffect(() => {
    loadNearbyVendors();
  }, [loadNearbyVendors]);

  return {
    nearbyVendors,
    isLoading,
    error,
    refetch: loadNearbyVendors,
  };
}

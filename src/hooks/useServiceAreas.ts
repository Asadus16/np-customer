import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchServiceAreas, ServiceAreaApiResponse } from '@/services/serviceAreaService';

export interface ServiceArea {
  id: string;
  name: string;
  image: string | null;
}

interface UseServiceAreasOptions {
  search?: string;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseServiceAreasReturn {
  serviceAreas: ServiceArea[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useServiceAreas(options: UseServiceAreasOptions = {}): UseServiceAreasReturn {
  const { search = '', enabled = true, debounceMs = 300 } = options;

  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const loadServiceAreas = useCallback(async (searchQuery: string) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchServiceAreas({
        search: searchQuery || undefined,
        per_page: 50,
      });

      // Map and filter to only show active service areas
      const mapped = response.data
        .filter(area => area.status)
        .map(area => ({
          id: area.id,
          name: area.name,
          image: area.image,
        }));

      setServiceAreas(mapped);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch service areas');
      setError(error);
      setServiceAreas([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Debounced search effect
  useEffect(() => {
    if (!enabled) return;

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      loadServiceAreas(search);
    }, search ? debounceMs : 0); // Immediate load if no search query

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, enabled, debounceMs, loadServiceAreas]);

  return {
    serviceAreas,
    isLoading,
    error,
    refetch: () => loadServiceAreas(search),
  };
}

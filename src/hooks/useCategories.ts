import { useState, useEffect } from 'react';
import { fetchAllCategories, CategoryApiResponse } from '@/services/categoryService';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  vendorCount?: number;
}

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAllCategories();

      // Map and filter to only show active categories
      const mapped = data
        .filter(cat => cat.status) // Only active categories
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          vendorCount: cat.vendor_count,
        }));

      setCategories(mapped);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch categories');
      setError(error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: loadCategories,
  };
}

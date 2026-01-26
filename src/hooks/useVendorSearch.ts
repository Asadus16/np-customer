'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchVendors, mapVendorToCardData, VendorsListResponse } from '@/services/vendorService';
import { VendorCardData, CompanyHour } from '@/components/home/VendorCard';

/**
 * Get day of week from a date string or current date
 * Returns lowercase day name: 'monday', 'tuesday', etc.
 */
function getDayOfWeek(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Get current time in HH:mm format
 */
function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Check if a time (HH:mm format) is within a slot's time range
 */
function isTimeInSlot(time: string, startTime: string, endTime: string): boolean {
  // Convert HH:mm to minutes since midnight for comparison
  const toMinutes = (t: string) => {
    const [hours, mins] = t.split(':').map(Number);
    return hours * 60 + mins;
  };

  const timeMinutes = toMinutes(time);
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);

  // Handle overnight slots (e.g., 22:00 - 02:00)
  if (endMinutes < startMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Check if a vendor is open at a specific time on a given day
 */
function isVendorOpenAt(companyHours: CompanyHour[] | undefined, day: string, time: string): boolean {
  if (!companyHours || companyHours.length === 0) {
    // If no hours data, assume open (be permissive)
    return true;
  }

  const dayHours = companyHours.find(h => h.day.toLowerCase() === day.toLowerCase());

  if (!dayHours || !dayHours.is_available) {
    return false;
  }

  // Check if time falls within any slot
  for (const slot of dayHours.slots) {
    if (isTimeInSlot(time, slot.start_time, slot.end_time)) {
      return true;
    }
  }

  return false;
}

export interface SearchFilters {
  q: string;
  category: string;
  serviceArea: string;
  date: string;
  time: string;
  sort: string;
  page: number;
}

interface UseVendorSearchReturn {
  vendors: VendorCardData[];
  isLoading: boolean;
  error: Error | null;
  meta: VendorsListResponse['meta'] | null;

  // Filter state from URL
  filters: SearchFilters;

  // Update methods
  setSearch: (q: string) => void;
  setCategory: (id: string | null) => void;
  setServiceArea: (id: string | null) => void;
  setDateFilter: (date: string | null) => void;
  setTimeFilter: (time: string | null) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
  refetch: () => void;
}

const DEFAULT_SORT = 'newest';
const DEFAULT_PAGE = 1;
const PER_PAGE = 20;

export function useVendorSearch(): UseVendorSearchReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vendors, setVendors] = useState<VendorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<VendorsListResponse['meta'] | null>(null);

  // Parse filters from URL
  const filters: SearchFilters = useMemo(() => ({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    serviceArea: searchParams.get('service_area') || '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    sort: searchParams.get('sort') || DEFAULT_SORT,
    page: parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10),
  }), [searchParams]);

  // Update URL with new params
  const updateParams = useCallback((updates: Partial<SearchFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        // Map internal keys to URL keys
        const urlKey = key === 'serviceArea' ? 'service_area' : key;
        params.delete(urlKey);
      } else {
        const urlKey = key === 'serviceArea' ? 'service_area' : key;
        params.set(urlKey, String(value));
      }
    });

    // Reset to page 1 when filters change (except when changing page itself)
    if (!('page' in updates)) {
      params.delete('page');
    }

    router.push(`/vendors?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Filter update methods
  const setSearch = useCallback((q: string) => updateParams({ q }), [updateParams]);
  const setCategory = useCallback((id: string | null) => updateParams({ category: id || '' }), [updateParams]);
  const setServiceArea = useCallback((id: string | null) => updateParams({ serviceArea: id || '' }), [updateParams]);
  const setDateFilter = useCallback((date: string | null) => updateParams({ date: date || '' }), [updateParams]);
  const setTimeFilter = useCallback((time: string | null) => updateParams({ time: time || '' }), [updateParams]);
  const setSort = useCallback((sort: string) => updateParams({ sort }), [updateParams]);
  const setPage = useCallback((page: number) => updateParams({ page }), [updateParams]);

  const clearFilters = useCallback(() => {
    router.push('/vendors', { scroll: false });
  }, [router]);

  // Fetch vendors
  const loadVendors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchVendors({
        search: filters.q || undefined,
        category: filters.category || undefined,
        service_area: filters.serviceArea || undefined,
        sort: filters.sort,
        page: filters.page,
        per_page: PER_PAGE,
      });

      // Map vendors to card data format
      let mappedVendors = response.data.map(mapVendorToCardData);

      // Always determine open/closed status for each vendor
      // Use selected time if provided, otherwise use current time
      const checkTime = filters.time || getCurrentTime();
      const day = getDayOfWeek(filters.date || undefined);

      mappedVendors = mappedVendors.map(vendor => ({
        ...vendor,
        isOpenAtSelectedTime: isVendorOpenAt(vendor.companyHours, day, checkTime),
      }));

      // Sort: show open vendors first, then closed vendors
      mappedVendors.sort((a, b) => {
        if (a.isOpenAtSelectedTime === b.isOpenAtSelectedTime) return 0;
        return a.isOpenAtSelectedTime ? -1 : 1;
      });

      setVendors(mappedVendors);
      setMeta(response.meta || null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch vendors');
      setError(error);
      setVendors([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load vendors when filters change
  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  return {
    vendors,
    isLoading,
    error,
    meta,
    filters,
    setSearch,
    setCategory,
    setServiceArea,
    setDateFilter,
    setTimeFilter,
    setSort,
    setPage,
    clearFilters,
    refetch: loadVendors,
  };
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config';
import { Loader2 } from 'lucide-react';
import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { VendorCard, VendorCardData } from '@/components/home/VendorCard';
import { getFavorites, FavoriteVendor } from '@/lib/favorites';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch favorites
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getFavorites({ per_page: 50 });
        setFavorites(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch favorites', err);
        setError(err.response?.data?.message || 'Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  // Transform API data to VendorCardData format
  const transformToVendorCard = (vendor: FavoriteVendor): VendorCardData => {
    // Get location from service_areas or direct location field
    const location = vendor.service_areas && vendor.service_areas.length > 0
      ? vendor.service_areas[0].name
      : vendor.location || '';

    // Create images array - use provided images or fallback to logo
    const images = vendor.images && vendor.images.length > 0
      ? vendor.images
      : vendor.logo ? [vendor.logo] : [];

    return {
      id: vendor.id,
      name: vendor.name,
      logo: vendor.logo,
      initials: vendor.initials,
      images,
      category: vendor.category?.name || '',
      rating: vendor.rating || 0,
      reviewCount: vendor.reviews_count || 0,
      location,
      startingPrice: vendor.starting_price || 0,
    };
  };

  if (authLoading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ProfileLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Only show title when favorites exist
  const showTitle = !isLoading && !error && favorites.length > 0;

  return (
    <ProfileLayout title={showTitle ? "Favorites" : undefined}>
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading favorites...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        /* Empty State - Centered like appointments */
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] pt-16">
          <div className="text-center">
            <div className="mb-6">
              <Image
                src="/favorites/heart.png"
                alt="No favorites"
                width={55}
                height={55}
                className="mx-auto"
              />
            </div>
            <h2 className="text-[20px] font-semibold leading-[28px] text-[rgb(20,20,20)] mb-2">
              No favorites
            </h2>
            <p className="text-[15px] font-normal leading-[20px] text-[rgb(118,118,118)] mb-6">
              Your favorites list is empty. Let's fill it up!
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Start searching
            </Link>
          </div>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="ml-19">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 *:w-76">
            {favorites.map((vendor, index) => (
              <VendorCard
                key={vendor.id}
                vendor={transformToVendorCard(vendor)}
                index={index}
                isFavorited={true}
              />
            ))}
          </div>
        </div>
      )}
    </ProfileLayout>
  );
}

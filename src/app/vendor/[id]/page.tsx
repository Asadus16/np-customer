'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Share, Heart, Loader2, AlertCircle } from 'lucide-react';
import {
  ImageGallery,
  ServiceList,
  ServiceTabs,
  FreshaSideCard,
  ReviewsSection,
  AboutSection,
  VendorNavBar,
  VenuesNearby,
  TreatYourselfSection,
  Service,
  ServiceCategory,
  Review,
  OpeningHours,
  NearbyVenue,
  ServiceLink,
} from '@/components/vendor';
import { useVendor, useVendorReviews, useNearbyVendors } from '@/hooks';
import { VendorDetailApiResponse, CompanyHourApiResponse, ReviewApiResponse, VendorApiResponse } from '@/services/vendorService';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/**
 * Format time from 24h to 12h format
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Get current day of week
 */
function getCurrentDay(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

/**
 * Map API company hours to OpeningHours format
 */
function mapCompanyHoursToOpeningHours(companyHours?: CompanyHourApiResponse[]): OpeningHours[] {
  const currentDay = getCurrentDay();

  if (!companyHours || companyHours.length === 0) {
    // Return default hours if none provided
    return DAYS_ORDER.map(day => ({
      day: DAY_LABELS[day],
      hours: 'Not set',
      isToday: day === currentDay,
    }));
  }

  // Create a map for quick lookup
  const hoursMap = new Map<string, CompanyHourApiResponse>();
  companyHours.forEach(hour => hoursMap.set(hour.day, hour));

  return DAYS_ORDER.map(day => {
    const hour = hoursMap.get(day);
    let hoursText = 'Closed';

    if (hour?.is_available && hour.slots && hour.slots.length > 0) {
      hoursText = hour.slots
        .map(slot => `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`)
        .join(', ');
    }

    return {
      day: DAY_LABELS[day],
      hours: hoursText,
      isToday: day === currentDay,
    };
  });
}

/**
 * Check if vendor is currently open
 */
function getOpenStatus(companyHours?: CompanyHourApiResponse[]): { isOpen: boolean; closeTime: string } {
  if (!companyHours || companyHours.length === 0) {
    return { isOpen: true, closeTime: '9:00 pm' }; // Default
  }

  const currentDay = getCurrentDay();
  const todayHours = companyHours.find(h => h.day === currentDay);

  if (!todayHours?.is_available || !todayHours.slots || todayHours.slots.length === 0) {
    return { isOpen: false, closeTime: '' };
  }

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  for (const slot of todayHours.slots) {
    if (currentTime >= slot.start_time && currentTime <= slot.end_time) {
      return { isOpen: true, closeTime: formatTime(slot.end_time) };
    }
  }

  // Check if we're before the first slot
  if (currentTime < todayHours.slots[0].start_time) {
    return { isOpen: false, closeTime: formatTime(todayHours.slots[0].start_time) };
  }

  return { isOpen: false, closeTime: '' };
}

/**
 * Check if a string is a valid image URL
 */
function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
}

/**
 * Map API vendor data to page format
 */
function mapVendorData(apiVendor: VendorDetailApiResponse) {
  const location =
    apiVendor.service_areas && apiVendor.service_areas.length > 0
      ? apiVendor.service_areas[0].name
      : 'Location not available';

  // Collect all valid images from services
  const images: string[] = [];

  // Add vendor logo as first image if available
  if (isValidImageUrl(apiVendor.logo)) {
    images.push(apiVendor.logo!);
  }

  if (apiVendor.services) {
    apiVendor.services.forEach((service) => {
      if (isValidImageUrl(service.image) && !images.includes(service.image!)) {
        images.push(service.image!);
      }
      if (service.sub_services) {
        service.sub_services.forEach((subService) => {
          if (subService.images && Array.isArray(subService.images)) {
            subService.images.forEach((img) => {
              if (isValidImageUrl(img) && !images.includes(img)) {
                images.push(img);
              }
            });
          }
        });
      }
    });
  }

  const category = apiVendor.category?.name || 'Services';
  const shortLocation = location.split(',')[0] || location;

  return {
    id: apiVendor.id,
    name: apiVendor.name,
    logo: apiVendor.logo,
    initials: apiVendor.initials,
    description:
      apiVendor.description ||
      'Professional service provider offering high-quality services to meet your needs.',
    category,
    rating: apiVendor.rating || 0,
    reviewCount: apiVendor.reviews_count || 0,
    location,
    shortLocation,
    isOpen: true, // TODO: Calculate from opening hours
    closeTime: '9:30 pm', // TODO: Get from API
    breadcrumb: ['Home', category, shortLocation, apiVendor.name],
    images,
    phone: apiVendor.landline,
    website: apiVendor.website,
    latitude: apiVendor.latitude || null,
    longitude: apiVendor.longitude || null,
  };
}

/**
 * Map API services to ServiceCategory format
 */
function mapServicesToCategories(apiVendor: VendorDetailApiResponse): ServiceCategory[] {
  if (!apiVendor.services || apiVendor.services.length === 0) return [];

  return apiVendor.services.map((service) => {
    const services: Service[] = (service.sub_services || []).map((subService) => ({
      id: subService.id,
      name: subService.name,
      price: subService.price || 0,
      duration: subService.duration || 30,
      priceFrom: true,
    }));

    return {
      id: service.id,
      name: service.name,
      services,
    };
  });
}

/**
 * Map API reviews to Review format
 */
function mapApiReviewsToReviews(apiReviews: ReviewApiResponse[]): Review[] {
  const avatarColors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-red-500',
    'bg-indigo-500',
  ];

  return apiReviews.map((review, index) => {
    const reviewerName = review.reviewer?.name || 'Anonymous';
    const date = new Date(review.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      id: review.id,
      authorName: reviewerName,
      authorInitial: reviewerName.charAt(0).toUpperCase(),
      date: formattedDate,
      rating: review.rating,
      text: review.comment || '',
      avatarColor: avatarColors[index % avatarColors.length],
    };
  });
}

/**
 * Map API vendors to NearbyVenue format
 */
function mapVendorsToNearbyVenues(vendors: VendorApiResponse[]): NearbyVenue[] {
  return vendors.map((vendor) => {
    const location = vendor.service_areas && vendor.service_areas.length > 0
      ? vendor.service_areas[0].name
      : 'Location not available';

    return {
      id: vendor.id,
      name: vendor.name,
      image: vendor.logo || '',
      rating: vendor.rating || 0,
      reviewCount: vendor.reviews_count || 0,
      location,
      category: vendor.category?.name || 'Services',
    };
  });
}

// Mock data for sections not yet in API
const MOCK_OPENING_HOURS: OpeningHours[] = [
  { day: 'Monday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Tuesday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Wednesday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Thursday', hours: '1:00 pm - 9:30 pm', isToday: true },
  { day: 'Friday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Saturday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Sunday', hours: 'Closed' },
];

const MOCK_SERVICE_LINKS: ServiceLink[] = [
  { name: 'Hair Styling for Afro Hair', href: '#' },
  { name: 'Permanent Hair Straightening', href: '#' },
  { name: 'Saunas', href: '#' },
  { name: 'Nail Art and Nail Designs', href: '#' },
  { name: 'Gel Nail Extensions', href: '#' },
  { name: 'Hair Transplants', href: '#' },
  { name: 'Foot Spas', href: '#' },
  { name: 'Paraffin Wax Treatments', href: '#' },
  { name: 'Gel Nails', href: '#' },
  { name: 'Nail Extensions', href: '#' },
  { name: 'Body Sculpting Treatments', href: '#' },
  { name: 'Skin Lightening Treatments', href: '#' },
  { name: 'Nail Salons', href: '#' },
  { name: 'Hair Styling', href: '#' },
  { name: 'Blow Dries', href: '#' },
  { name: 'Bridal Hair Styling', href: '#' },
  { name: 'Underarm Wax', href: '#' },
  { name: 'Mani Pedi Treatments', href: '#' },
  { name: 'Hair Coloring', href: '#' },
  { name: 'Facials', href: '#' },
  { name: 'Sugaring', href: '#' },
  { name: 'Henna', href: '#' },
  { name: 'Manicures', href: '#' },
  { name: 'Hair Treatments', href: '#' },
  { name: 'Eyebrows & Lashes', href: '#' },
  { name: 'Hair Colouring Highlights', href: '#' },
  { name: 'Dermal Fillers', href: '#' },
  { name: 'Pedicures', href: '#' },
  { name: 'Hair Salons', href: '#' },
  { name: 'Foot Massages', href: '#' },
];

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  // Fetch vendor data from API
  const { vendor: apiVendor, isLoading, error } = useVendor(vendorId);
  const { reviews: apiReviews, totalReviews: apiTotalReviews } = useVendorReviews(vendorId);
  const { nearbyVendors: apiNearbyVendors } = useNearbyVendors(vendorId, 4);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Map API data to component format
  const vendor = useMemo(() => {
    if (!apiVendor) return null;
    return mapVendorData(apiVendor);
  }, [apiVendor]);

  // Map services to categories
  const serviceCategories = useMemo(() => {
    if (!apiVendor) return [];
    return mapServicesToCategories(apiVendor);
  }, [apiVendor]);

  // Set initial active category when data loads
  useEffect(() => {
    if (serviceCategories.length > 0 && !activeCategory) {
      setActiveCategory(serviceCategories[0].name);
    }
  }, [serviceCategories, activeCategory]);

  // Map opening hours from API
  const openingHours = useMemo(() => {
    if (!apiVendor) return MOCK_OPENING_HOURS;
    return mapCompanyHoursToOpeningHours(apiVendor.company_hours);
  }, [apiVendor]);

  // Get open status from API hours
  const openStatus = useMemo(() => {
    if (!apiVendor) return { isOpen: true, closeTime: '9:00 pm' };
    return getOpenStatus(apiVendor.company_hours);
  }, [apiVendor]);

  // Map API reviews to component format (check both sources)
  const reviews = useMemo(() => {
    // First try reviews from separate endpoint
    if (apiReviews && apiReviews.length > 0) {
      return mapApiReviewsToReviews(apiReviews);
    }
    // Fallback to reviews from vendor detail response
    if (apiVendor?.reviews && apiVendor.reviews.length > 0) {
      return mapApiReviewsToReviews(apiVendor.reviews);
    }
    return [];
  }, [apiReviews, apiVendor?.reviews]);

  // Total reviews count from API or vendor data
  const totalReviewCount = apiTotalReviews || vendor?.reviewCount || 0;

  // Map nearby vendors from API
  const nearbyVenues = useMemo(() => {
    return mapVendorsToNearbyVenues(apiNearbyVendors);
  }, [apiNearbyVendors]);

  // Static data (until API provides these)
  const serviceLinks = MOCK_SERVICE_LINKS;

  // Get services for active category
  const activeServices = useMemo(() => {
    const category = serviceCategories.find((c) => c.name === activeCategory);
    return category?.services || [];
  }, [activeCategory, serviceCategories]);

  // Get all category names for tabs
  const categoryNames = serviceCategories.map((c) => c.name);

  const handleBookService = (service: Service) => {
    if (vendor) {
      // Ensure price and duration are numbers
      const price = typeof service.price === 'number'
        ? service.price
        : parseFloat(String(service.price || 0));
      const duration = typeof service.duration === 'number'
        ? service.duration
        : parseInt(String(service.duration || 0), 10);

      // Store the selected service in session storage
      const selectedService = {
        id: service.id,
        name: service.name,
        price: isNaN(price) ? 0 : price,
        originalPrice: isNaN(price) ? 0 : price,
        duration: isNaN(duration) ? 0 : duration,
        category: activeCategory,
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `booking_${vendor.id}_services`,
          JSON.stringify([selectedService])
        );
      }

      // Navigate to the booking page
      router.push(`/booking/${vendor.id}`);
    }
  };

  const handleBookNow = () => {
    router.push(`/booking/${vendorId}`);
  };

  const handleGetDirections = () => {
    if (vendor) {
      window.open(
        `https://maps.google.com/?daddr=${encodeURIComponent(vendor.location)}`,
        '_blank'
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vendor Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error?.message || 'The vendor you are looking for does not exist or has been removed.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Scroll-aware NavBar */}
      <VendorNavBar />

      <div className="min-h-screen bg-white pb-24 lg:pb-0">
        {/* Breadcrumb */}
        <div className="px-4 md:px-8 lg:pl-12 lg:pr-10 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto hide-scrollbar">
            {vendor.breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-2 shrink-0">
                {index > 0 && <span className="text-gray-400">·</span>}
                {index === vendor.breadcrumb.length - 1 ? (
                  <span className="text-gray-700">{item}</span>
                ) : (
                  <Link
                    href={index === 0 ? '/' : '#'}
                    className="hover:text-gray-900 hover:underline whitespace-nowrap"
                  >
                    {item}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Vendor Header */}
        <div className="px-4 md:px-8 lg:pl-12 lg:pr-10 mt-2 mb-2 md:mb-3">
          <h1 className="font-bold text-2xl md:text-4xl lg:text-5xl text-gray-900 leading-none">
            {vendor.name}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-1 gap-3">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-base">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">
                      {vendor.rating.toFixed(1)}
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(vendor.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      ({vendor.reviewCount.toLocaleString()})
                    </span>
                  </div>

              <span className="text-gray-300 hidden md:inline">•</span>

              {/* Open Status */}
              <span className={`font-medium ${openStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {openStatus.isOpen ? 'Open' : 'Closed'}
              </span>
              {openStatus.closeTime && (
                <span className="text-gray-600">until {openStatus.closeTime}</span>
              )}

              <span className="text-gray-300 hidden md:inline">•</span>

              {/* Location */}
              <div className="flex items-center gap-1 text-gray-600">
                <span className="truncate max-w-[150px] md:max-w-none">{vendor.shortLocation}</span>
              </div>
              <button
                onClick={handleGetDirections}
                className="text-blue-600 font-medium hover:underline"
              >
                Get directions
              </button>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button className="h-12 w-12 flex items-center justify-center border border-[#d1d1d1] rounded-full hover:bg-gray-50 transition-colors">
                <Share className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="h-12 w-12 flex items-center justify-center border border-[#d1d1d1] rounded-full hover:bg-gray-50 transition-colors"
              >
                <Heart
                  className={`h-6 w-6 ${
                    isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="px-4 md:px-8 lg:pl-12 lg:pr-10" id="photos">
          <ImageGallery images={vendor.images} vendorName={vendor.name} />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="px-4 md:px-8 lg:pl-12 lg:pr-10 mt-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="flex-1 min-w-0 space-y-10">
              {/* Services Section */}
              <div id="services" className="pt-6">
                <h2
                  className="text-[28px] font-[550] leading-9 text-[rgb(20,20,20)] mb-4"
                  style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
                >Services</h2>

                {/* Category Tabs */}
                {categoryNames.length > 0 && (
                  <ServiceTabs
                    categories={categoryNames}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                )}

                {/* Service List */}
                <div className="mt-6">
                  {activeServices.length > 0 ? (
                    <ServiceList
                      services={activeServices}
                      onBookService={handleBookService}
                    />
                  ) : (
                    <div className="flex items-center justify-center min-h-[80px] md:min-h-[300px]">
                      <p className="text-gray-500">No services available in this category.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <ReviewsSection
                reviews={reviews}
                averageRating={vendor.rating}
                totalReviews={totalReviewCount}
              />

              {/* About Section */}
              <AboutSection
                description={vendor.description}
                location={vendor.location}
                openingHours={openingHours}
                latitude={vendor.latitude}
                longitude={vendor.longitude}
                vendorName={vendor.name}
                onGetDirections={handleGetDirections}
              />
            </div>

            {/* Right Column - Side Card (Desktop Only) */}
            <div className="hidden lg:block w-110 shrink-0 mt-8">
              <div className="sticky top-28">
                <FreshaSideCard
                  vendorName={vendor.name}
                  rating={vendor.rating}
                  reviewCount={vendor.reviewCount}
                  isOpen={openStatus.isOpen}
                  closeTime={openStatus.closeTime}
                  location={vendor.location}
                  openingHours={openingHours}
                  onBookNow={handleBookNow}
                  onGetDirections={handleGetDirections}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="px-4 md:px-8 lg:pl-12 lg:pr-10 mt-16 pt-8">
          {/* Venues Nearby */}
          <VenuesNearby venues={nearbyVenues} />
        </div>

        <div className="px-4 md:px-8 lg:pl-12 lg:pr-10 mt-10">
          {/* Treat Yourself Section */}
          <TreatYourselfSection
            location={vendor.shortLocation}
            serviceLinks={serviceLinks}
          />
        </div>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">
                  ({vendor.reviewCount.toLocaleString()})
                </span>
              </div>
              <p className={`text-sm font-medium ${openStatus.isOpen ? 'text-blue-600' : 'text-red-600'}`}>
                {openStatus.isOpen ? `Open until ${openStatus.closeTime}` : 'Closed'}
              </p>
            </div>
            <button
              onClick={handleBookNow}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

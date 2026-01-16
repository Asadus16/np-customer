'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Share, Heart, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
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
import { useVendor } from '@/hooks';
import { VendorDetailApiResponse, CompanyHourApiResponse } from '@/services/vendorService';

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

  // Add placeholder images if not enough
  const placeholderImages = [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    'https://images.unsplash.com/photo-1633681122451-ac40535fd4d2?w=800',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800',
  ];

  while (images.length < 5) {
    const placeholder = placeholderImages[images.length];
    if (placeholder && !images.includes(placeholder)) {
      images.push(placeholder);
    } else {
      break;
    }
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

// Mock data for sections not yet in API
const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    authorName: 'Areej A',
    date: 'Today at 6:14 am',
    rating: 5,
    text: "Nora the nail technician was really great, i'll come again for her",
    avatarColor: 'bg-purple-500',
  },
  {
    id: 'r2',
    authorName: 'اسماء',
    authorInitial: 'a',
    date: 'Wed, 14 Jan 2026 at 7:11 pm',
    rating: 5,
    text: 'تجنن منى اول مرا اقص شعري وجيت عندها ماندمت ابدًا عسل ونصحتني بقصه وطلع شعري واااو وسويت معها رينسا...',
    avatarColor: 'bg-gray-700',
  },
  {
    id: 'r3',
    authorName: 'Rahaf A',
    date: 'Tue, 13 Jan 2026 at 10:18 pm',
    rating: 3,
    text: 'الله حق نفسها حلوه وتحملت تعديلاتي الكثيره بس توقعت افضل',
    avatarColor: 'bg-red-500',
  },
  {
    id: 'r4',
    authorName: 'Ebtihal A',
    date: 'Tue, 13 Jan 2026 at 9:18 pm',
    rating: 5,
    text: 'شكراً لنورة على شغلها بالاظافر جميل جداً ونظيف وشكراً على الاستقبال الحلو',
    avatarColor: 'bg-green-500',
  },
  {
    id: 'r5',
    authorName: 'Bayan M',
    date: 'Tue, 13 Jan 2026 at 8:15 pm',
    rating: 5,
    text: 'مره كانت مريحه والمواعيد فيها التزام والشغل بيرفكت',
    avatarColor: 'bg-blue-500',
  },
  {
    id: 'r6',
    authorName: 'Rana A',
    date: 'Tue, 13 Jan 2026 at 3:51 pm',
    rating: 5,
    text: 'كل شي حلووو و اكثر ماشاءالله الشعر ولا غلطه و سويت المكياج ريناد ولا غلطه ابدا و مع انه مكياج خفيف...',
    avatarColor: 'bg-orange-500',
  },
];

const MOCK_OPENING_HOURS: OpeningHours[] = [
  { day: 'Monday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Tuesday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Wednesday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Thursday', hours: '1:00 pm - 9:30 pm', isToday: true },
  { day: 'Friday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Saturday', hours: '1:00 pm - 9:30 pm' },
  { day: 'Sunday', hours: 'Closed' },
];

const MOCK_NEARBY_VENUES: NearbyVenue[] = [
  {
    id: '2',
    name: 'Strive For Beauty',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
    rating: 4.8,
    reviewCount: 116,
    location: 'An Narjis, Riyadh',
    category: 'Hair Salon',
  },
  {
    id: '3',
    name: 'Bloom',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
    rating: 4.0,
    reviewCount: 20,
    location: "Bloom Beauty Salon, 24°50'03.3\"N 46°, 40'43...",
    category: 'Hair Salon',
  },
  {
    id: '4',
    name: 'Lola Ley | صالون لولالي',
    image: 'https://images.unsplash.com/photo-1633681122451-ac40535fd4d2?w=600',
    rating: 4.8,
    reviewCount: 264,
    location: 'An Narjis, Riyadh',
    category: 'Hair Salon',
  },
  {
    id: '5',
    name: 'AlNarjis 30 Degrees',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600',
    rating: 4.9,
    reviewCount: 2982,
    location: 'حي النرجس, Riyadh',
    category: 'Barber',
  },
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

  // Static data (until API provides these)
  const reviews = MOCK_REVIEWS;
  const nearbyVenues = MOCK_NEARBY_VENUES;
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
      router.push(`/booking?vendor=${vendor.id}&service=${service.id}`);
    }
  };

  const handleBookNow = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
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
      <VendorNavBar
        vendorName={vendor.name}
        rating={vendor.rating}
        reviewCount={vendor.reviewCount}
        onBookNow={handleBookNow}
      />

      <div className="min-h-screen bg-white pb-24 lg:pb-0">
        {/* Breadcrumb */}
        <div className="px-8 lg:px-12 py-2">
          <nav className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto hide-scrollbar">
            {vendor.breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-2 shrink-0">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                {index === vendor.breadcrumb.length - 1 ? (
                  <span className="text-gray-900 font-medium">{item}</span>
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
        <div className="px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
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

                <span className="text-gray-300">•</span>

                {/* Open Status */}
                <span className={`font-medium ${openStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {openStatus.isOpen ? 'Open' : 'Closed'}
                </span>
                {openStatus.closeTime && (
                  <span className="text-gray-600">until {openStatus.closeTime}</span>
                )}

                <span className="text-gray-300">•</span>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.shortLocation}</span>
                </div>
                <button
                  onClick={handleGetDirections}
                  className="text-green-600 font-medium hover:underline"
                >
                  Get directions
                </button>
              </div>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <button className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <Share className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="px-8 lg:px-12" id="photos">
          <ImageGallery images={vendor.images} vendorName={vendor.name} />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="px-8 lg:px-12 mt-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="flex-1 min-w-0 space-y-10">
              {/* Services Section */}
              <div id="services">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>

                {/* Category Tabs */}
                {categoryNames.length > 0 && (
                  <ServiceTabs
                    categories={categoryNames}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                )}

                {/* Service List */}
                <div className="mt-4">
                  {activeServices.length > 0 ? (
                    <ServiceList
                      services={activeServices}
                      onBookService={handleBookService}
                    />
                  ) : (
                    <p className="text-gray-500 py-4">No services available in this category.</p>
                  )}
                </div>
              </div>

              {/* Team Section Placeholder */}
              <div id="team">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Team</h2>
                <p className="text-gray-500">
                  Our professional team members will be displayed here.
                </p>
              </div>

              {/* Reviews Section */}
              <ReviewsSection
                reviews={reviews}
                averageRating={vendor.rating}
                totalReviews={vendor.reviewCount}
              />

              {/* About Section */}
              <AboutSection
                description={vendor.description}
                location={vendor.location}
                openingHours={openingHours}
                onGetDirections={handleGetDirections}
              />
            </div>

            {/* Right Column - Side Card (Desktop Only) */}
            <div className="hidden lg:block w-[380px] shrink-0">
              <div className="sticky top-20">
                <FreshaSideCard
                  vendorName={vendor.name}
                  rating={vendor.rating}
                  reviewCount={vendor.reviewCount}
                  isOpen={openStatus.isOpen}
                  closeTime={openStatus.closeTime}
                  location={vendor.location}
                  onBookNow={handleBookNow}
                  onGetDirections={handleGetDirections}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="px-8 lg:px-12 mt-10">
          {/* Venues Nearby */}
          <VenuesNearby venues={nearbyVenues} />
        </div>

        <div className="px-8 lg:px-12">
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
              <p className={`text-sm font-medium ${openStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
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

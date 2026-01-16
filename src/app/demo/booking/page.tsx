'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Plus, Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingBreadcrumb } from '@/components/booking';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  duration: number;
  durationMax?: number;
  serviceCount?: number;
  gender?: string;
  category: string;
  discount?: number;
}

interface SubService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  services: SubService[];
}

const DEMO_VENDOR_ID = 'demo-vendor-001';

const DEMO_VENDOR = {
  id: DEMO_VENDOR_ID,
  name: 'Glamour Beauty Salon & Spa',
  logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
  rating: 4.8,
  reviews_count: 1247,
  service_areas: [{ name: 'Downtown Dubai' }],
};

const DEMO_SERVICES: ServiceCategory[] = [
  {
    id: 'hair',
    name: 'Hair Services',
    services: [
      { id: 'hair-1', name: "Women's Haircut & Styling", description: 'Professional haircut with wash and styling', price: 150, duration: 45 },
      { id: 'hair-2', name: "Men's Haircut", description: 'Classic or modern men\'s haircut', price: 80, duration: 30 },
      { id: 'hair-3', name: 'Hair Coloring - Full', description: 'Full head color with premium products', price: 350, duration: 120 },
      { id: 'hair-4', name: 'Highlights / Balayage', description: 'Hand-painted highlights for natural look', price: 450, duration: 150 },
      { id: 'hair-5', name: 'Keratin Treatment', description: 'Smoothing treatment for frizz-free hair', price: 600, duration: 180 },
      { id: 'hair-6', name: 'Blow Dry & Styling', description: 'Professional blow dry and styling', price: 100, duration: 45 },
    ],
  },
  {
    id: 'nails',
    name: 'Nail Services',
    services: [
      { id: 'nail-1', name: 'Classic Manicure', description: 'Nail shaping, cuticle care, and polish', price: 75, duration: 30 },
      { id: 'nail-2', name: 'Gel Manicure', description: 'Long-lasting gel polish manicure', price: 120, duration: 45 },
      { id: 'nail-3', name: 'Classic Pedicure', description: 'Relaxing pedicure with foot massage', price: 95, duration: 45 },
      { id: 'nail-4', name: 'Gel Pedicure', description: 'Gel polish pedicure with extra care', price: 150, duration: 60 },
      { id: 'nail-5', name: 'Nail Art (per nail)', description: 'Custom nail art designs', price: 15, duration: 10 },
      { id: 'nail-6', name: 'Acrylic Nail Extensions', description: 'Full set of acrylic extensions', price: 250, duration: 90 },
    ],
  },
  {
    id: 'facial',
    name: 'Facial Treatments',
    services: [
      { id: 'facial-1', name: 'Classic Facial', description: 'Deep cleansing and hydrating facial', price: 200, duration: 60 },
      { id: 'facial-2', name: 'Deep Cleansing Facial', description: 'Intensive pore cleansing treatment', price: 280, duration: 75 },
      { id: 'facial-3', name: 'Anti-Aging Facial', description: 'Advanced anti-wrinkle treatment', price: 350, duration: 90 },
      { id: 'facial-4', name: 'Hydrating Facial', description: 'Moisture-boosting treatment', price: 250, duration: 60 },
      { id: 'facial-5', name: 'LED Light Therapy', description: 'Skin rejuvenation with LED', price: 180, duration: 30 },
    ],
  },
  {
    id: 'spa',
    name: 'Spa & Massage',
    services: [
      { id: 'spa-1', name: 'Swedish Massage (60 min)', description: 'Relaxing full body massage', price: 300, duration: 60 },
      { id: 'spa-2', name: 'Deep Tissue Massage (60 min)', description: 'Therapeutic deep muscle massage', price: 350, duration: 60 },
      { id: 'spa-3', name: 'Hot Stone Massage', description: 'Heated stone relaxation therapy', price: 400, duration: 75 },
      { id: 'spa-4', name: 'Aromatherapy Massage', description: 'Essential oil massage therapy', price: 320, duration: 60 },
      { id: 'spa-5', name: 'Full Body Scrub', description: 'Exfoliating body treatment', price: 250, duration: 45 },
      { id: 'spa-6', name: 'Moroccan Bath', description: 'Traditional hammam experience', price: 450, duration: 90 },
    ],
  },
  {
    id: 'waxing',
    name: 'Waxing & Hair Removal',
    services: [
      { id: 'wax-1', name: 'Full Leg Wax', description: 'Complete leg hair removal', price: 150, duration: 30 },
      { id: 'wax-2', name: 'Full Arm Wax', description: 'Complete arm hair removal', price: 100, duration: 20 },
      { id: 'wax-3', name: 'Underarm Wax', description: 'Quick underarm waxing', price: 50, duration: 15 },
      { id: 'wax-4', name: 'Brazilian Wax', description: 'Professional bikini waxing', price: 180, duration: 30 },
      { id: 'wax-5', name: 'Full Body Wax', description: 'Complete body hair removal', price: 450, duration: 90 },
      { id: 'wax-6', name: 'Eyebrow Threading', description: 'Precise eyebrow shaping', price: 35, duration: 10 },
    ],
  },
];

function formatDurationRange(min: number, max?: number): string {
  const formatSingle = (mins: number): string => {
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (remaining === 0) return `${hours} hr`;
    return `${hours} hr, ${remaining} mins`;
  };

  if (!max || min === max) return formatSingle(min);
  return `${formatSingle(min)} - ${formatSingle(max)}`;
}

export default function DemoBookingServicesPage() {
  const router = useRouter();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingToSection = useRef(false);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Service categories with "Most Popular" first
  const serviceCategories = useMemo(() => {
    return [
      { id: 'most-popular', name: 'Most Popular', services: [] as SubService[] },
      ...DEMO_SERVICES,
    ];
  }, []);

  // Get most popular services
  const mostPopularServices = useMemo(() => {
    const allServices: SubService[] = [];
    DEMO_SERVICES.forEach(category => {
      allServices.push(...category.services.slice(0, 2));
    });
    return allServices.slice(0, 8);
  }, []);

  // Set initial category
  useEffect(() => {
    if (serviceCategories.length > 0 && !activeCategory) {
      setActiveCategory(serviceCategories[0].id);
    }
  }, [serviceCategories, activeCategory]);

  // Load pre-selected services from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedServices = sessionStorage.getItem(`booking_${DEMO_VENDOR_ID}_services`);
      if (storedServices) {
        try {
          const parsed = JSON.parse(storedServices);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalizedServices = parsed.map((s: any) => ({
              ...s,
              price: typeof s.price === 'number' ? s.price : parseFloat(String(s.price || 0)) || 0,
              originalPrice: typeof s.originalPrice === 'number' ? s.originalPrice : parseFloat(String(s.originalPrice || s.price || 0)) || 0,
              duration: typeof s.duration === 'number' ? s.duration : parseInt(String(s.duration || 0), 10) || 0,
            }));
            setSelectedServices(normalizedServices);
          }
        } catch (e) {
          console.error('Failed to parse stored services', e);
        }
      }
    }
  }, []);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check scroll position for arrows
  const checkScrollPosition = () => {
    const container = tabsContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollPosition();
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition, { passive: true });
      window.addEventListener('resize', checkScrollPosition);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [serviceCategories]);

  // Scroll the active tab into view
  const scrollTabIntoView = (categoryId: string) => {
    const container = tabsContainerRef.current;
    if (!container) return;
    const tabButton = container.querySelector(`[data-tab-id="${categoryId}"]`) as HTMLElement;
    if (tabButton) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = tabButton.getBoundingClientRect();
      const scrollLeft = tabRect.left - containerRect.left + container.scrollLeft - containerRect.width / 2 + tabRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (!container) return;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Handle tab click - scroll to section
  const handleTabClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    scrollTabIntoView(categoryId);
    const section = sectionRefs.current.get(categoryId);
    if (section) {
      isScrollingToSection.current = true;
      const headerOffset = 180;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setTimeout(() => {
        isScrollingToSection.current = false;
      }, 1000);
    }
  }, []);

  // Set section ref
  const setSectionRef = useCallback((categoryId: string, element: HTMLDivElement | null) => {
    if (element) {
      sectionRefs.current.set(categoryId, element);
    } else {
      sectionRefs.current.delete(categoryId);
    }
  }, []);

  // Calculate totals
  const { total } = useMemo(() => {
    let tot = 0;
    selectedServices.forEach(service => {
      tot += service.price;
    });
    return { total: tot };
  }, [selectedServices]);

  // Toggle service selection
  const toggleService = (subService: SubService, categoryName: string) => {
    setSelectedServices(prev => {
      const existingIndex = prev.findIndex(s => s.id === subService.id);
      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        const price = subService.price;
        const duration = subService.duration;
        const discountPercent = Math.floor(Math.random() * 6) + 10;
        const originalPrice = Math.round(price / (1 - discountPercent / 100));

        return [...prev, {
          id: subService.id,
          name: subService.name,
          price: price,
          originalPrice: originalPrice,
          duration: duration,
          durationMax: duration + 15,
          serviceCount: 2,
          gender: 'Male only',
          category: categoryName,
          discount: discountPercent,
        }];
      }
    });
  };

  // Check if service is selected
  const isServiceSelected = (serviceId: string): boolean => {
    return selectedServices.some(s => s.id === serviceId);
  };

  // Handle continue
  const handleContinue = () => {
    if (selectedServices.length === 0) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_services`, JSON.stringify(selectedServices));
    }
    router.push(`/demo/booking/time`);
  };

  // Handle back
  const handleBack = () => {
    router.push('/demo/vendor');
  };

  // Handle close
  const handleClose = () => {
    router.push('/demo/vendor');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className={`sticky top-0 bg-white z-20 transition-shadow ${isScrolled ? 'border-b border-gray-200 shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="h-11 w-11 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              {isScrolled && (
                <span className="font-semibold text-gray-900">Services</span>
              )}
            </div>

            <button
              onClick={handleClose}
              className="h-11 w-11 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <BookingBreadcrumb currentStep="services" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Pane - Service Selection */}
          <div className="flex-1 min-w-0 pb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Services</h1>

            {/* Category Tabs - Sticky */}
            <div className="sticky top-21 bg-white z-10 py-4 -mx-6 px-6 lg:mx-0 lg:px-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="relative">
                {showLeftArrow && (
                  <button
                    onClick={() => scrollTabs('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                )}

                <div
                  ref={tabsContainerRef}
                  className="flex gap-2 overflow-x-auto hide-scrollbar px-1"
                >
                  {serviceCategories.map((category) => (
                    <button
                      key={category.id}
                      data-tab-id={category.id}
                      onClick={() => handleTabClick(category.id)}
                      className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-colors text-sm ${
                        activeCategory === category.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {showRightArrow && (
                  <button
                    onClick={() => scrollTabs('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* All Category Sections */}
            <div className="space-y-10 mt-6">
              {/* Most Popular Section */}
              <div
                ref={(el) => setSectionRef('most-popular', el)}
                data-category-id="most-popular"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">Most Popular</h2>
                <p className="text-gray-600 mb-6">
                  Discover the top-rated services customers love, all conveniently grouped for easy selection.
                </p>
                <div className="space-y-4">
                  {mostPopularServices.map((subService) => {
                    const isSelected = isServiceSelected(subService.id);
                    return (
                      <div
                        key={subService.id}
                        className={`bg-white rounded-xl p-5 transition-all cursor-pointer border-2 ${
                          isSelected
                            ? 'border-indigo-500 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleService(subService, 'Most Popular')}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">{subService.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {formatDurationRange(subService.duration, subService.duration + 15)} • 2 services • Male only
                            </p>
                            {subService.description && (
                              <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                                {subService.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">AED {subService.price.toFixed(0)}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleService(subService, 'Most Popular');
                            }}
                            className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full transition-all ${
                              isSelected
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-gray-400'
                            }`}
                            aria-label={isSelected ? 'Remove service' : 'Add service'}
                          >
                            {isSelected ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <Plus className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Category Sections */}
              {DEMO_SERVICES.map((category) => (
                <div
                  key={category.id}
                  ref={(el) => setSectionRef(category.id, el)}
                  data-category-id={category.id}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{category.name}</h2>
                  <div className="space-y-4">
                    {category.services.map((subService) => {
                      const isSelected = isServiceSelected(subService.id);
                      return (
                        <div
                          key={subService.id}
                          className={`bg-white rounded-xl p-5 transition-all cursor-pointer border-2 ${
                            isSelected
                              ? 'border-indigo-500 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleService(subService, category.name)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">{subService.name}</h3>
                              <p className="text-sm text-gray-500 mb-2">
                                {formatDurationRange(subService.duration, subService.duration + 15)} • 2 services • Male only
                              </p>
                              {subService.description && (
                                <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                                  {subService.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">AED {subService.price.toFixed(0)}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleService(subService, category.name);
                              }}
                              className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full transition-all ${
                                isSelected
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-gray-400'
                              }`}
                              aria-label={isSelected ? 'Remove service' : 'Add service'}
                            >
                              {isSelected ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <Plus className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Pane - Order Summary */}
          <div className="w-full lg:w-105 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col lg:h-[calc(100vh-140px)]">
              {/* Vendor Info */}
              <div className="p-6">
                <div className="flex gap-4">
                  <img
                    src={DEMO_VENDOR.logo}
                    alt={DEMO_VENDOR.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 mb-1 truncate">{DEMO_VENDOR.name}</h2>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {DEMO_VENDOR.rating.toFixed(1)}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= Math.round(DEMO_VENDOR.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({DEMO_VENDOR.reviews_count.toLocaleString()})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{DEMO_VENDOR.service_areas[0].name}</p>
                  </div>
                </div>
              </div>

              {/* Selected Services - Scrollable */}
              <div className="px-6 pb-6 flex-1 overflow-y-auto">
                {selectedServices.length > 0 ? (
                  <div className="space-y-4">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm mb-0.5">{service.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDurationRange(service.duration, service.durationMax)} • {service.serviceCount || 2} services • {service.gender || 'Male only'} with any professional
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-gray-900 text-sm">AED {service.price.toFixed(0)}</p>
                          <p className="text-xs text-gray-400 line-through">AED {service.originalPrice.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No services selected</p>
                )}
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-gray-100" />

              {/* Total */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  {selectedServices.length > 0 ? (
                    <span className="font-bold text-lg text-gray-900">
                      AED {total.toLocaleString()}
                    </span>
                  ) : (
                    <span className="font-medium text-gray-400">free</span>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <div className="p-6 pt-0 mt-auto">
                <button
                  onClick={handleContinue}
                  disabled={selectedServices.length === 0}
                  className={`w-full py-4 rounded-full font-semibold transition-colors ${
                    selectedServices.length > 0
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-8" />
    </div>
  );
}

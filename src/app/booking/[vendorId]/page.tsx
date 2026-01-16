'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, Plus, Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVendor } from '@/hooks';
import { BookingBreadcrumb } from '@/components/booking';
import { SubServiceApiResponse, ServiceApiResponse } from '@/services/vendorService';

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

/**
 * Format duration range
 */
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

/**
 * Get all sub-services from a service category
 */
function getAllSubServices(service: ServiceApiResponse): SubServiceApiResponse[] {
  return service.sub_services || [];
}

export default function BookingServicesPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingToSection = useRef(false);

  const { vendor, isLoading, error } = useVendor(vendorId);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Get all service categories with "Most Popular" first
  const serviceCategories = useMemo(() => {
    if (!vendor?.services) return [];
    return [
      { id: 'most-popular', name: 'Most Popular', service: null },
      ...vendor.services.map(service => ({
        id: service.id,
        name: service.name,
        service,
      })),
    ];
  }, [vendor]);

  // Get most popular services (top 10 from all categories)
  const mostPopularServices = useMemo(() => {
    if (!vendor?.services) return [];
    const allServices: SubServiceApiResponse[] = [];
    vendor.services.forEach(service => {
      allServices.push(...getAllSubServices(service));
    });
    return allServices.slice(0, 10);
  }, [vendor]);

  // Set initial category
  useEffect(() => {
    if (serviceCategories.length > 0 && !activeCategory) {
      setActiveCategory(serviceCategories[0].id);
    }
  }, [serviceCategories, activeCategory]);

  // Load pre-selected services from session storage (when coming from vendor details page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedServices = sessionStorage.getItem(`booking_${vendorId}_services`);
      if (storedServices) {
        try {
          const parsed = JSON.parse(storedServices);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Ensure all numeric fields are actually numbers
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
  }, [vendorId]);

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

  // Scroll spy: observe sections and update active category
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToSection.current) return;

        // Find the section that is most visible
        let maxRatio = 0;
        let visibleCategoryId = activeCategory;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            visibleCategoryId = entry.target.getAttribute('data-category-id') || '';
          }
        });

        if (visibleCategoryId && visibleCategoryId !== activeCategory) {
          setActiveCategory(visibleCategoryId);
          // Scroll the tab into view
          scrollTabIntoView(visibleCategoryId);
        }
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all section refs
    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [activeCategory, serviceCategories]);

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
    const section = sectionRefs.current.get(categoryId);
    if (section) {
      isScrollingToSection.current = true;
      const headerOffset = 180; // Account for sticky header and tabs
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Reset the flag after scrolling completes
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
  const { subtotal, discount, total } = useMemo(() => {
    let sub = 0;
    let disc = 0;
    let tot = 0;

    selectedServices.forEach(service => {
      sub += service.originalPrice;
      disc += service.originalPrice - service.price;
      tot += service.price;
    });

    return { subtotal: sub, discount: disc, total: tot };
  }, [selectedServices]);

  // Toggle service selection
  const toggleService = (subService: SubServiceApiResponse, categoryName: string) => {
    setSelectedServices(prev => {
      const existingIndex = prev.findIndex(s => s.id === subService.id);
      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        const price = typeof subService.price === 'number'
          ? subService.price
          : parseFloat(String(subService.price || 0));
        const duration = typeof subService.duration === 'number'
          ? subService.duration
          : parseInt(String(subService.duration || 0), 10);

        // Calculate discount (assume 10-15% off)
        const discountPercent = Math.floor(Math.random() * 6) + 10; // 10-15%
        const originalPrice = Math.round(price / (1 - discountPercent / 100));

        return [...prev, {
          id: subService.id,
          name: subService.name,
          price: isNaN(price) ? 0 : price,
          originalPrice: originalPrice,
          duration: isNaN(duration) ? 0 : duration,
          durationMax: subService.duration ? duration + 15 : undefined,
          serviceCount: 2, // Placeholder
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

  // Get location string
  const location = useMemo(() => {
    if (!vendor?.service_areas || vendor.service_areas.length === 0) {
      return 'Location not available';
    }
    return vendor.service_areas[0].name;
  }, [vendor]);

  // Handle continue
  const handleContinue = () => {
    if (selectedServices.length === 0) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`booking_${vendorId}_services`, JSON.stringify(selectedServices));
    }
    router.push(`/booking/${vendorId}/time`);
  };

  // Handle back
  const handleBack = () => {
    router.back();
  };

  // Handle close
  const handleClose = () => {
    router.push(`/vendor/${vendorId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-6">
            {error?.message || 'Failed to load vendor information.'}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
            {serviceCategories.length > 0 && (
              <div className="sticky top-21 bg-white z-10 py-4 -mx-6 px-6 lg:mx-0 lg:px-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="relative">
                  {/* Left Arrow */}
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

                  {/* Right Arrow */}
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
            )}

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
                {mostPopularServices.length > 0 ? (
                  <div className="space-y-4">
                    {mostPopularServices.map((subService) => {
                      const isSelected = isServiceSelected(subService.id);
                      const price = typeof subService.price === 'number'
                        ? subService.price
                        : parseFloat(String(subService.price || 0));
                      const duration = typeof subService.duration === 'number'
                        ? subService.duration
                        : parseInt(String(subService.duration || 0), 10);

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
                                {formatDurationRange(duration, duration + 15)} • 2 services • Male only
                              </p>
                              {subService.description && (
                                <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                                  {subService.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">AED {price.toFixed(0)}</span>
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No popular services available.</p>
                  </div>
                )}
              </div>

              {/* Individual Category Sections */}
              {vendor?.services?.map((service) => {
                const subServices = getAllSubServices(service);
                if (subServices.length === 0) return null;

                return (
                  <div
                    key={service.id}
                    ref={(el) => setSectionRef(service.id, el)}
                    data-category-id={service.id}
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{service.name}</h2>
                    <div className="space-y-4">
                      {subServices.map((subService) => {
                        const isSelected = isServiceSelected(subService.id);
                        const price = typeof subService.price === 'number'
                          ? subService.price
                          : parseFloat(String(subService.price || 0));
                        const duration = typeof subService.duration === 'number'
                          ? subService.duration
                          : parseInt(String(subService.duration || 0), 10);

                        return (
                          <div
                            key={subService.id}
                            className={`bg-white rounded-xl p-5 transition-all cursor-pointer border-2 ${
                              isSelected
                                ? 'border-indigo-500 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleService(subService, service.name)}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1">{subService.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  {formatDurationRange(duration, duration + 15)} • 2 services • Male only
                                </p>
                                {subService.description && (
                                  <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                                    {subService.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">AED {price.toFixed(0)}</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleService(subService, service.name);
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
                );
              })}
            </div>
          </div>

          {/* Right Pane - Order Summary */}
          <div className="w-full lg:w-105 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col lg:h-[calc(100vh-140px)]">
              {/* Vendor Info */}
              <div className="p-6">
                <div className="flex gap-4">
                  {vendor.logo ? (
                    <img
                      src={vendor.logo}
                      alt={vendor.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-gray-500 text-lg font-semibold">
                        {vendor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 mb-1 truncate">{vendor.name}</h2>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {vendor.rating?.toFixed(1) || '0.0'}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= Math.round(vendor.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({(vendor.reviews_count || 0).toLocaleString()})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{location}</p>
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

              {/* Continue Button - Bottom */}
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

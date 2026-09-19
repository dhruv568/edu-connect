"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Flame,
  Sparkles,
  Bell,
  BookOpen,
  Calendar,
  Tag,
  ExternalLink,
} from "lucide-react";

export interface PromotionalBannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  bannerType: "OFFER" | "PROMOTION" | "ANNOUNCEMENT" | "COURSE_PROMOTION" | "EVENT" | "GENERAL" | string;
  imageUrl: string;
  imageClickUrl?: string | null;
  imageClickTarget?: "_self" | "_blank" | string;
  ctaText?: string | null;
  ctaUrl?: string | null;
  placement: "ALL" | "MAIN" | "LEARNERS" | "EDUCATORS" | string;
  displayOrder: number;
}

export interface PromotionalBannerCarouselProps {
  placement?: "MAIN" | "LEARNERS" | "EDUCATORS";
  initialBanners?: PromotionalBannerItem[];
  previewMode?: boolean;
}

export function PromotionalBannerCarousel({
  placement: explicitPlacement,
  initialBanners,
  previewMode = false,
}: PromotionalBannerCarouselProps) {
  const pathname = usePathname() || "/";
  const [banners, setBanners] = useState<PromotionalBannerItem[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [loading, setLoading] = useState(!initialBanners);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  // Exclude non-public pages (admin, classroom, auth, live sessions)
  const isExcluded = useMemo(() => {
    if (previewMode) return false;
    const clean = pathname.toLowerCase();
    return (
      clean.startsWith("/admin") ||
      clean.startsWith("/staff") ||
      clean.startsWith("/classroom") ||
      clean.startsWith("/live/session") ||
      clean.startsWith("/payment/checkout") ||
      clean.startsWith("/checkout") ||
      clean.startsWith("/login") ||
      clean.startsWith("/register") ||
      clean.startsWith("/verify-") ||
      clean.startsWith("/reset-password") ||
      clean.startsWith("/forgot-password")
    );
  }, [pathname, previewMode]);

  // Determine current website context / theme
  const siteContext = useMemo((): "MAIN" | "LEARNERS" | "EDUCATORS" => {
    if (explicitPlacement) return explicitPlacement;
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (
        host.startsWith("educators.") ||
        host.startsWith("educator.") ||
        host.startsWith("teachers.") ||
        host.startsWith("teacher.")
      ) {
        return "EDUCATORS";
      }
      if (
        host.startsWith("learners.") ||
        host.startsWith("learner.") ||
        host.startsWith("students.") ||
        host.startsWith("student.")
      ) {
        return "LEARNERS";
      }
    }
    if (pathname.startsWith("/teacher")) return "EDUCATORS";
    if (pathname.startsWith("/student")) return "LEARNERS";
    return "MAIN";
  }, [explicitPlacement, pathname]);

  // Fetch active banners for this website placement
  useEffect(() => {
    if (initialBanners || isExcluded) return;

    let isMounted = true;
    const fetchBanners = async () => {
      try {
        const queryParam = siteContext ? `?placement=${encodeURIComponent(siteContext)}` : "";
        let res = await fetch(`/api/banners/active${queryParam}`, {
          cache: "no-store",
        });

        // If relative fetch fails (e.g. reverse proxy subdomain routing issue), fallback to canonical origin
        if (!res.ok && typeof window !== "undefined") {
          try {
            res = await fetch(`${window.location.origin}/api/banners/active${queryParam}`, {
              cache: "no-store",
            });
          } catch {
            // Ignore secondary error
          }
        }

        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data?.banners)) {
            setBanners(json.data.banners);
          }
        }
      } catch (err) {
        console.error("[PromotionalBannerCarousel] Failed to fetch active banners:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanners();

    return () => {
      isMounted = false;
    };
  }, [siteContext, isExcluded, initialBanners]);

  // Navigation handlers
  const total = banners.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // 10-second autoplay with pause on hover
  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [total, isHovered, nextSlide]);

  // Keyboard navigation (Left / Right arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (total <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  // Touch / Swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    const threshold = 50; // min distance for swipe
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // If excluded, loading, or no banners: return null completely
  if (isExcluded || (!previewMode && banners.length === 0)) {
    return null;
  }

  const currentBanner = banners[currentIndex] || banners[0];
  if (!currentBanner) return null;

  // Website Theme Styles Configuration
  const themeStyles = {
    MAIN: {
      cardBg: "bg-gradient-to-br from-[#083F3D] via-[#0B4F4B] to-[#0F5C5A]",
      border: "border-[#1B6863]/60",
      shadow: "shadow-xl shadow-teal-950/25",
      badgeDefault: "bg-[#F2C14E] text-[#083F3D]",
      titleColor: "text-white",
      subtitleColor: "text-[#F2C14E]",
      descColor: "text-teal-100/90",
      ctaBg: "bg-[#F2C14E] hover:bg-[#E0B03C] text-[#083F3D] shadow-md shadow-amber-950/30",
      arrowBg: "bg-white/15 hover:bg-white/25 text-white border-white/20 focus:ring-[#F2C14E]",
      dotActive: "bg-[#F2C14E] w-6",
      dotInactive: "bg-white/35 hover:bg-white/60",
      imageGlow: "group-hover:ring-2 group-hover:ring-[#F2C14E]/60",
    },
    LEARNERS: {
      cardBg: "bg-gradient-to-br from-[#1A2E7B] via-[#243B9B] to-[#3157D5]",
      border: "border-[#BFDBFE]/40",
      shadow: "shadow-xl shadow-blue-950/25",
      badgeDefault: "bg-white text-[#1E3185]",
      titleColor: "text-white",
      subtitleColor: "text-blue-200",
      descColor: "text-blue-100/90",
      ctaBg: "bg-white hover:bg-blue-50 text-[#1E3185] shadow-md shadow-blue-950/30",
      arrowBg: "bg-white/15 hover:bg-white/25 text-white border-white/20 focus:ring-blue-300",
      dotActive: "bg-white w-6",
      dotInactive: "bg-white/35 hover:bg-white/60",
      imageGlow: "group-hover:ring-2 group-hover:ring-blue-300/60",
    },
    EDUCATORS: {
      cardBg: "bg-gradient-to-br from-[#0A4732] via-[#0D5C41] to-[#16805B]",
      border: "border-[#A7F3D0]/40",
      shadow: "shadow-xl shadow-emerald-950/25",
      badgeDefault: "bg-[#DCFCE7] text-[#0D5C41]",
      titleColor: "text-white",
      subtitleColor: "text-[#A7F3D0]",
      descColor: "text-emerald-100/90",
      ctaBg: "bg-white hover:bg-emerald-50 text-[#0D5C41] shadow-md shadow-emerald-950/30",
      arrowBg: "bg-white/15 hover:bg-white/25 text-white border-white/20 focus:ring-[#A7F3D0]",
      dotActive: "bg-[#A7F3D0] w-6",
      dotInactive: "bg-white/35 hover:bg-white/60",
      imageGlow: "group-hover:ring-2 group-hover:ring-[#A7F3D0]/60",
    },
  };
  const currentTheme = themeStyles[siteContext] || themeStyles.MAIN;

  // Banner Type Icon & Label Mapping
  const getBannerTypeDetails = (type: string) => {
    switch (type.toUpperCase()) {
      case "OFFER":
        return { icon: Flame, label: "Special Offer" };
      case "PROMOTION":
        return { icon: Sparkles, label: "Featured Promotion" };
      case "ANNOUNCEMENT":
        return { icon: Bell, label: "Announcement" };
      case "COURSE_PROMOTION":
        return { icon: BookOpen, label: "Course Spotlight" };
      case "EVENT":
        return { icon: Calendar, label: "Special Event" };
      default:
        return { icon: Tag, label: "EduConnects Update" };
    }
  };

  const { icon: BannerIcon, label: defaultTypeLabel } = getBannerTypeDetails(
    currentBanner.bannerType
  );

  const hasImageClick = Boolean(currentBanner.imageClickUrl && currentBanner.imageClickUrl.trim());
  const hasCta = Boolean(currentBanner.ctaText && currentBanner.ctaUrl);

  return (
    <section
      aria-label="Promotional Carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`w-full relative z-20 focus:outline-none ${
        previewMode
          ? "pt-0 pb-0"
          : "pt-20 sm:pt-24 lg:pt-28 pb-3 sm:pb-4"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-3xl overflow-hidden border backdrop-blur-xl ${currentTheme.cardBg} ${currentTheme.border} ${currentTheme.shadow} transition-all duration-300`}
        >
          {/* Subtle Decorative Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Slide Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id || currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 sm:gap-8 p-5 sm:p-7 lg:p-9"
            >
              {/* Left Column: Banner Typography & CTA Action */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-center lg:text-left flex flex-col justify-center">
                {/* Banner Badge */}
                <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-2xs ${currentTheme.badgeDefault}`}
                  >
                    <BannerIcon className="h-3.5 w-3.5" />
                    <span>{defaultTypeLabel}</span>
                  </span>

                  {currentBanner.subtitle && currentBanner.bannerType.toUpperCase() === "OFFER" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/15 text-white border border-white/20">
                      {currentBanner.subtitle}
                    </span>
                  )}
                </div>

                {/* Banner Headline */}
                <h2
                  className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${currentTheme.titleColor}`}
                >
                  {currentBanner.title}
                </h2>

                {/* Subtitle (when not purely offer badge) */}
                {currentBanner.subtitle && currentBanner.bannerType.toUpperCase() !== "OFFER" && (
                  <p className={`text-sm sm:text-base font-bold ${currentTheme.subtitleColor}`}>
                    {currentBanner.subtitle}
                  </p>
                )}

                {/* Description */}
                {currentBanner.description && (
                  <p
                    className={`text-xs sm:text-sm lg:text-base font-normal leading-relaxed line-clamp-2 sm:line-clamp-3 ${currentTheme.descColor}`}
                  >
                    {currentBanner.description}
                  </p>
                )}

                {/* CTA Button */}
                {hasCta && (
                  <div className="pt-2 flex items-center justify-center lg:justify-start">
                    <Link
                      href={currentBanner.ctaUrl!}
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 transform hover:scale-[1.03] active:scale-95 cursor-pointer select-none ${currentTheme.ctaBg}`}
                    >
                      <span>{currentBanner.ctaText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Right Column: Banner Image Container */}
              <div className="lg:col-span-5 flex items-center justify-center">
                {hasImageClick ? (
                  /* ========================================================= */
                  /* CLICKABLE IMAGE (When Image Click URL is configured)     */
                  /* ========================================================= */
                  <Link
                    href={currentBanner.imageClickUrl!}
                    target={currentBanner.imageClickTarget === "_blank" ? "_blank" : undefined}
                    rel={currentBanner.imageClickTarget === "_blank" ? "noopener noreferrer" : undefined}
                    aria-label={`Promotional banner: ${currentBanner.title}. Click to visit ${currentBanner.imageClickUrl}`}
                    className={`group relative block w-full max-w-md aspect-video sm:aspect-[16/9] lg:aspect-[4/3] min-h-[190px] sm:min-h-[220px] lg:min-h-[250px] rounded-2xl overflow-hidden border border-white/20 shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.99] ${currentTheme.imageGlow}`}
                  >
                    <Image
                      src={
                        imageErrorMap[currentBanner.id || currentBanner.imageUrl]
                          ? "/images/educonnects-owner-banner.jpeg"
                          : currentBanner.imageUrl
                      }
                      alt={currentBanner.title}
                      fill
                      priority={currentIndex === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={true}
                      onError={() => {
                        setImageErrorMap((prev) => ({
                          ...prev,
                          [currentBanner.id || currentBanner.imageUrl]: true,
                        }));
                      }}
                    />

                    {/* Subtle Overlay Hint indicating clickable destination */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                        <span>Visit Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                ) : (
                  /* ========================================================= */
                  /* NON-CLICKABLE IMAGE (When Image Click URL is empty)       */
                  /* ========================================================= */
                  <div
                    aria-label={`Promotional banner image: ${currentBanner.title}`}
                    className="relative w-full max-w-md aspect-video sm:aspect-[16/9] lg:aspect-[4/3] min-h-[190px] sm:min-h-[220px] lg:min-h-[250px] rounded-2xl overflow-hidden border border-white/20 shadow-lg cursor-default select-none"
                  >
                    <Image
                      src={
                        imageErrorMap[currentBanner.id || currentBanner.imageUrl]
                          ? "/images/educonnects-owner-banner.jpeg"
                          : currentBanner.imageUrl
                      }
                      alt={currentBanner.title}
                      fill
                      priority={currentIndex === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 400px"
                      className="object-cover"
                      unoptimized={true}
                      onError={() => {
                        setImageErrorMap((prev) => ({
                          ...prev,
                          [currentBanner.id || currentBanner.imageUrl]: true,
                        }));
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows (Only shown when multiple banners exist) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Previous promotional slide"
                className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full border backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 ${currentTheme.arrowBg}`}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Next promotional slide"
                className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full border backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 ${currentTheme.arrowBg}`}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* Carousel Indicators / Dots (Only shown when multiple banners exist) */}
          {total > 1 && (
            <div
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
              role="tablist"
              aria-label="Promotional banner carousel pagination"
            >
              {banners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentIndex}
                  aria-label={`Go to slide ${idx + 1}: ${b.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? currentTheme.dotActive : `w-2 ${currentTheme.dotInactive}`
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PromotionalBannerCarousel;

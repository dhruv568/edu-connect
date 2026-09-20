"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // 3-second autoplay with pause on hover
  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // 3 seconds

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

  const hasImageClick = Boolean(currentBanner.imageClickUrl && currentBanner.imageClickUrl.trim());
  const clickTarget = currentBanner.imageClickTarget === "_blank" ? "_blank" : undefined;
  const clickRel = currentBanner.imageClickTarget === "_blank" ? "noopener noreferrer" : undefined;

  const bannerImageSrc =
    imageErrorMap[currentBanner.id || currentBanner.imageUrl]
      ? "/images/educonnects-owner-banner.jpeg"
      : currentBanner.imageUrl;

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
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-slate-900/5 aspect-[16/8] sm:aspect-[21/8] md:aspect-[24/8] lg:aspect-[3/1] min-h-[160px] max-h-[440px]">
          {/* Animated Slide Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id || currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="relative w-full h-full"
            >
              {hasImageClick ? (
                <Link
                  href={currentBanner.imageClickUrl!.trim()}
                  target={clickTarget}
                  rel={clickRel}
                  aria-label={`Promotional banner: ${currentBanner.title || "EduConnects Banner"}`}
                  className="relative block w-full h-full cursor-pointer focus:outline-none select-none"
                >
                  <Image
                    src={bannerImageSrc}
                    alt={currentBanner.title || "Promotional Banner"}
                    fill
                    priority={currentIndex === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                    className="object-cover w-full h-full"
                    unoptimized={true}
                    onError={() => {
                      setImageErrorMap((prev) => ({
                        ...prev,
                        [currentBanner.id || currentBanner.imageUrl]: true,
                      }));
                    }}
                  />
                </Link>
              ) : (
                <div
                  aria-label={`Promotional banner: ${currentBanner.title || "EduConnects Banner"}`}
                  className="relative w-full h-full cursor-default select-none"
                >
                  <Image
                    src={bannerImageSrc}
                    alt={currentBanner.title || "Promotional Banner"}
                    fill
                    priority={currentIndex === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                    className="object-cover w-full h-full"
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
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows (Only shown when multiple banners exist) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Previous promotional slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg focus:outline-none"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Next promotional slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg focus:outline-none"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* Carousel Indicators / Dots (Only shown when multiple banners exist) */}
          {total > 1 && (
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-sm"
              role="tablist"
              aria-label="Promotional banner carousel pagination"
            >
              {banners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentIndex}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
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

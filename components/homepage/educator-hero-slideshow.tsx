"use client";

import React, { useState, useEffect } from "react";

interface EducatorSlide {
  url: string;
  alt: string;
  theme: string;
}

const EDUCATOR_SLIDES: EducatorSlide[] = [
  {
    url: "/images/educators/anand-vardhan.jpg",
    alt: "Build Your Teaching Career with verified educator credentials on EduConnects",
    theme: "Build Your Teaching Career",
  },
  {
    url: "/images/educators/meenakshi-sundaram.jpg",
    alt: "Share Your Expertise with learners nationwide through online classes",
    theme: "Share Your Expertise",
  },
  {
    url: "/images/educators/vikramaditya-sen.jpg",
    alt: "Teach Live. Teach Better. with HD video classroom and interactive whiteboards",
    theme: "Teach Live. Teach Better.",
  },
  {
    url: "/images/educators/arundhati-mukherjee.jpg",
    alt: "Create Courses. Grow Your Reach. with on-demand video modules and resources",
    theme: "Create Courses. Grow Your Reach.",
  },
  {
    url: "/images/educators/harish-parthasarathy.jpg",
    alt: "Build Your Educator Brand with direct payouts and verified authority",
    theme: "Build Your Educator Brand",
  },
];

export function EducatorHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Respect system reduced-motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    // Smooth, visible background image cycling every 5 seconds
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        setCurrentIndex((prev) => (prev + 1) % EDUCATOR_SLIDES.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
    >
      {/* 1. IMAGE LAYER (Subtle 42% opacity showing authentic Indian educators) */}
      {EDUCATOR_SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-45" : "opacity-0"
            }`}
          >
            <img
              src={slide.url}
              alt={slide.alt}
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover object-center filter saturate-90"
            />
          </div>
        );
      })}

      {/* 2. OVERLAY LAYER (Keeps text completely sharp & legible using Educator theme #F0FAF5 / white) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F0FAF5]/95 via-white/85 to-[#F0FAF5]/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-[#F0FAF5]/95" />

      {/* 3. Subtle Brand Accent Glows (#16805B and #35A979) */}
      <div className="absolute -top-20 left-1/4 w-[600px] h-[400px] bg-[#16805B]/12 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-[#35A979]/12 rounded-full blur-3xl" />
    </div>
  );
}

export default EducatorHeroSlideshow;

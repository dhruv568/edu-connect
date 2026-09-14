"use client";

import React, { useState, useEffect } from "react";

interface HeroBanner {
  url: string;
  alt: string;
  theme: string;
}

const HERO_BANNERS: HeroBanner[] = [
  {
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80",
    alt: "Personalized online learning and peer collaboration",
    theme: "Personalized Learning",
  },
  {
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&auto=format&fit=crop&q=80",
    alt: "Dedicated educator mentoring a student",
    theme: "Verified Educators",
  },
  {
    url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1600&auto=format&fit=crop&q=80",
    alt: "Focused digital learning and skill development",
    theme: "Skill Development",
  },
  {
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80",
    alt: "Interactive modern classroom and educational technology",
    theme: "Educational Technology",
  },
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80",
    alt: "Learners celebrating academic growth and future success",
    theme: "Learner Success",
  },
];

export function HeroBackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    // Slow, professional rotation every 7 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Slideshow Image Layers */}
      {HERO_BANNERS.map((banner, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={banner.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-20" : "opacity-0"
            }`}
          >
            <img
              src={banner.url}
              alt={banner.alt}
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* 2. Soft, Premium Brand Overlays for Maximum Text Legibility */}
      {/* Base soft tint overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F2FAF8]/92 via-[#FBF7EE]/88 to-white/95 backdrop-blur-[1px]" />

      {/* Brand Teal glow overlay */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#0F5C5A]/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-[#2A8C84]/5 rounded-full blur-3xl" />
    </div>
  );
}

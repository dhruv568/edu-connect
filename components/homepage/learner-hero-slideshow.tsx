"use client";

import React, { useState, useEffect } from "react";

interface LearnerSlide {
  url: string;
  alt: string;
  theme: string;
}

const LEARNER_SLIDES: LearnerSlide[] = [
  {
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80",
    alt: "Personalized 1-on-1 learning with interactive mentor support",
    theme: "Personalized Learning",
  },
  {
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&auto=format&fit=crop&q=80",
    alt: "Structured exam preparation and strategic practice for learners",
    theme: "Exam Preparation",
  },
  {
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&auto=format&fit=crop&q=80",
    alt: "Finding the right verified educator for your academic goals",
    theme: "Finding the Right Educator",
  },
  {
    url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1600&auto=format&fit=crop&q=80",
    alt: "Building in-demand coding, analytical, and digital skills",
    theme: "Skill Development",
  },
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80",
    alt: "Celebrating academic milestones, top exam percentiles, and career growth",
    theme: "Learning & Career Growth",
  },
];

export function LearnerHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Respect system reduced-motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    // Smooth, unobtrusive background image cycling every 7 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LEARNER_SLIDES.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Slideshow Image Layers */}
      {LEARNER_SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-25" : "opacity-0"
            }`}
          >
            <img
              src={slide.url}
              alt={slide.alt}
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* 2. Soft Learner Blue & White Gradient Overlays for High Contrast Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F3F6FF]/90 via-white/85 to-[#F3F6FF]/95" />

      {/* 3. Subtle Brand Accent Glows (#3157D5 and #667EEA) */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#3157D5]/8 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-[#667EEA]/8 rounded-full blur-3xl" />
    </div>
  );
}

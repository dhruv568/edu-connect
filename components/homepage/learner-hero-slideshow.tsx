"use client";

import React, { useState, useEffect } from "react";

interface LearnerSlide {
  url: string;
  alt: string;
  theme: string;
}

const LEARNER_SLIDES: LearnerSlide[] = [
  {
    url: "/images/learner-hero.jpeg",
    alt: "Personalized 1-on-1 learning with interactive mentor support",
    theme: "Personalized Learning",
  },
  {
    url: "/images/learner-hero.jpeg",
    alt: "Structured exam preparation and strategic practice for learners",
    theme: "Exam Preparation",
  },
  {
    url: "/images/learner-hero.jpeg",
    alt: "Finding the right verified educator for your academic goals",
    theme: "Finding the Right Educator",
  },
  {
    url: "/images/learner-hero.jpeg",
    alt: "Building in-demand coding, analytical, and digital skills",
    theme: "Skill Development",
  },
  {
    url: "/images/learner-hero.jpeg",
    alt: "Celebrating academic milestones, top exam percentiles, and learning growth",
    theme: "Learn and Grow",
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

    // Smooth, visible background image cycling every 5 seconds (4-6s requirement)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        setCurrentIndex((prev) => (prev + 1) % LEARNER_SLIDES.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
    >
      {/* 1. IMAGE LAYER (Properly visible at 48% opacity, recognizing the scene) */}
      {LEARNER_SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-50" : "opacity-0"
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

      {/* 2. OVERLAY LAYER (Keeps text completely sharp & legible using Learner palette) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F3F6FF]/92 via-white/80 to-[#F3F6FF]/88" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-[#F3F6FF]/95" />

      {/* 3. Subtle Brand Accent Glows (#3157D5 and #667EEA) */}
      <div className="absolute -top-20 left-1/4 w-[600px] h-[400px] bg-[#3157D5]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-[#667EEA]/10 rounded-full blur-3xl" />
    </div>
  );
}

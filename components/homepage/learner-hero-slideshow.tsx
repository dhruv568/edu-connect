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
      {/* 1. BACKGROUND IMAGE CONTAINER
          - Desktop (lg+): Anchored to the right side (w-[56%] / w-[50%]) so the left column hero text sits on a clean background without graphic collision.
          - Mobile/Tablet: Full width with object-[82%_28%] focusing on the student portrait instead of the baked-in graphic text.
          - Opacity adjusted to a subtle, elegant 15-25% range.
      */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[56%] xl:w-[50%] overflow-hidden">
        {LEARNER_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={`${slide.theme}-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive
                  ? "opacity-15 sm:opacity-20 lg:opacity-25"
                  : "opacity-0"
              }`}
            >
              <img
                src={slide.url}
                alt={slide.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover object-[82%_28%] sm:object-[80%_30%] lg:object-[76%_32%]"
              />
            </div>
          );
        })}

        {/* Soft edge blend on the left of the image container to transition into the hero background */}
        <div className="absolute inset-y-0 left-0 w-28 sm:w-36 lg:w-48 bg-gradient-to-r from-[#F3F6FF] to-transparent pointer-events-none" />

        {/* Soft bottom edge blend to seamlessly fade out bottom image details */}
        <div className="absolute bottom-0 inset-x-0 h-24 sm:h-32 lg:h-40 bg-gradient-to-t from-[#F3F6FF] via-[#F3F6FF]/70 to-transparent pointer-events-none" />

        {/* Soft top edge blend under navbar */}
        <div className="absolute top-0 inset-x-0 h-20 sm:h-28 bg-gradient-to-b from-[#F3F6FF] to-transparent pointer-events-none" />
      </div>

      {/* 2. OVERLAY LAYERS (Protects hero copy contrast and smoothly blends edges) */}
      {/* Horizontal overlay: solid #F3F6FF on the left where hero text lives, softly tapering to transparent on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F3F6FF] via-[#F3F6FF]/85 to-transparent sm:via-[#F3F6FF]/70 lg:via-[#F3F6FF]/50" />

      {/* Mobile-specific overlay: adds soft contrast over mobile centered text */}
      <div className="absolute inset-0 bg-[#F3F6FF]/35 sm:bg-transparent" />

      {/* Vertical overlay: blends smoothly into top navbar and bottom section */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F3F6FF]/80 via-transparent to-[#F3F6FF]" />

      {/* 3. Subtle Brand Accent Glows (#3157D5 and #667EEA) */}
      <div className="absolute -top-20 left-1/4 w-[600px] h-[400px] bg-[#3157D5]/8 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-[#667EEA]/8 rounded-full blur-3xl" />
    </div>
  );
}

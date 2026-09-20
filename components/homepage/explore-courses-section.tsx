"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Video, BookOpen, CheckCircle2 } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";

export function ExploreCoursesSection() {
  const features = [
    {
      icon: Video,
      title: "Video Lessons",
      desc: "Structured, high-definition modular video lessons designed by verified educators to break down complex topics into clear concepts.",
    },
    {
      icon: BookOpen,
      title: "Study Resources",
      desc: "Comprehensive chapter notes, formula cheat-sheets, and curated practice sets for thorough academic revision.",
    },
    {
      icon: CheckCircle2,
      title: "Quizzes",
      desc: "Interactive topic assessments and practice quizzes with instant feedback to test and strengthen understanding.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#DCE5E4] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-[#0F5C5A] uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#E6F0EF] inline-block">
            LEARNING EXPERIENCE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102A2A] tracking-tight">
            Learn. Practice. Grow.
          </h2>
          <p className="text-sm sm:text-base text-[#5D7373] leading-relaxed">
            Advance your learning journey with structured video lessons, comprehensive study resources, and interactive quizzes designed by verified educators to support every step of your academic path.
          </p>
        </div>

        {/* Content & Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Image Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative rounded-3xl overflow-hidden border border-[#DCE5E4] bg-[#F5F7F8] shadow-md p-3 sm:p-4 group w-full max-w-md lg:max-w-none">
              <img
                src="/images/courses-learning.png"
                alt="EduConnects Learning Experience - Video Lessons, Study Resources, Quizzes"
                className="w-full h-auto object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right: 3 Feature Cards + CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              {features.map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-5 sm:p-6 rounded-3xl bg-[#F5F7F8] border border-[#DCE5E4] hover:border-[#0F5C5A]/40 hover:bg-[#E6F0EF]/40 transition-all flex items-start gap-4 sm:gap-5 group"
                  >
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E6F0EF] text-[#0F5C5A] group-hover:bg-[#0F5C5A] group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-[#102A2A] group-hover:text-[#0F5C5A] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link href="/find-teachers" className="inline-block w-full sm:w-auto">
                <GlassButton
                  variant="primary"
                  className="w-full sm:w-auto bg-[#0F5C5A] hover:bg-[#083F3D] active:bg-[#052C2A] text-white font-extrabold px-8 py-3.5 rounded-full transition-all shadow-md inline-flex items-center justify-center gap-2"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Explore Educators
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

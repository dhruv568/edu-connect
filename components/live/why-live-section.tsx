"use client";

import React from "react";
import { Zap, Sparkles, HeartHandshake, Compass } from "lucide-react";

export interface FeatureBlock {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function WhyLiveSection() {
  const featureBlocks: FeatureBlock[] = [
    {
      icon: <Zap className="h-6 w-6 text-[#FFD700]" />,
      title: "Real-Time Learning",
      description: "Learn directly from passionate educators in synchronized live sessions with zero delay.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-[#FFD700]" />,
      title: "Interactive Sessions",
      description: "Ask questions, share ideas, and actively participate instead of passively watching videos.",
    },
    {
      icon: <HeartHandshake className="h-6 w-6 text-[#FFD700]" />,
      title: "Community & Belonging",
      description: "Connect with like-minded learners, peer study partners, and supportive teaching mentors.",
    },
    {
      icon: <Compass className="h-6 w-6 text-[#FFD700]" />,
      title: "New Opportunities",
      description: "Discover curated courses, 1-on-1 tutoring, modern skills, and educational growth roadmaps.",
    },
  ];

  return (
    <section id="why-educonnects" className="py-16 sm:py-24 bg-gradient-to-b from-[#3B0202] via-[#590404] to-[#3B0202] text-white font-sans border-b border-[#FFD700]/20 relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-[#FFD700] bg-[#FFD700]/15 px-3.5 py-1 rounded-full border border-[#FFD700]/30">
            Why EduConnects Live
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Why Join EduConnects Live?
          </h2>
          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
            Education is more effective when it is collaborative, real-time, and built around genuine human connections.
          </p>
        </div>

        {/* 4 Feature Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featureBlocks.map((block, i) => (
            <div
              key={i}
              className="p-6 sm:p-7 rounded-3xl bg-[#4A0303]/80 border border-[#FFD700]/30 shadow-xl hover:border-[#FFD700] hover:scale-[1.02] transition-all duration-300 flex flex-col space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                {block.icon}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {block.title}
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
                  {block.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

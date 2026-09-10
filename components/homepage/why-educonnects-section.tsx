"use client";

import React from "react";
import { Target, Calendar, UserCheck, HeartHandshake } from "lucide-react";

export function WhyEduConnectsSection() {
  const benefits = [
    {
      icon: Target,
      title: "Personalized Learning",
      desc: "Find learning experiences tailored specifically to your academic goals, current level, and individual learning speed.",
    },
    {
      icon: Calendar,
      title: "Flexible Learning",
      desc: "Choose learning options that fit seamlessly into your personal schedule — from 1-on-1 tutoring to self-paced video courses.",
    },
    {
      icon: UserCheck,
      title: "Educator Connection",
      desc: "Connect directly with verified subject educators without rigid annual locks or opaque intermediary agencies.",
    },
    {
      icon: HeartHandshake,
      title: "One Learning Community",
      desc: "Learn, connect, track your progress, and grow inside a clean, modern, and transparent educational ecosystem.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F5F7F8] border-b border-[#DCE5E4] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-[#0B4F4B] uppercase tracking-widest px-3 py-1 rounded-full bg-[#E6F0EF]">
            REAL VALUE & FLEXIBILITY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102A2A] tracking-tight">
            Why choose EduConnects?
          </h2>
          <p className="text-sm sm:text-base text-[#5D7373]">
            Designed with clarity, flexibility, and learner-first values at its core.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const IconComp = b.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white border border-[#DCE5E4] hover:border-[#0B4F4B]/40 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#E6F0EF] text-[#0B4F4B] w-fit group-hover:bg-[#0B4F4B] group-hover:text-white transition-colors">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#102A2A]">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

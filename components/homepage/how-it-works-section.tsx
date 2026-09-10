"use client";

import React from "react";
import { Search, Compass, Rocket } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Tell Us What You Want to Learn",
      desc: "Choose a subject, skill, level or learning goal based on your current academic or professional needs.",
      icon: Search,
    },
    {
      number: "02",
      title: "Find the Right Learning Experience",
      desc: "Discover verified educators, pre-recorded video courses or interactive live sessions that fit your budget & schedule.",
      icon: Compass,
    },
    {
      number: "03",
      title: "Start Learning",
      desc: "Connect directly with your tutor, enroll in your chosen course, and begin your journey towards academic mastery.",
      icon: Rocket,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white border-b border-[#DCE5E4] font-sans scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-[#0B4F4B] uppercase tracking-widest px-3 py-1 rounded-full bg-[#E6F0EF]">
            SIMPLE 3-STEP PROCESS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102A2A] tracking-tight">
            How EduConnects Works
          </h2>
          <p className="text-sm sm:text-base text-[#5D7373]">
            Getting started with EduConnects is quick, simple, and straightforward.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => {
            const IconComp = s.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#F5F7F8] border border-[#DCE5E4] hover:border-[#0B4F4B] hover:shadow-xl transition-all space-y-5 flex flex-col justify-between relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-[#0B4F4B]/30 group-hover:text-[#0B4F4B] transition-colors">
                      {s.number}
                    </span>
                    <div className="p-3 rounded-2xl bg-white border border-[#DCE5E4] text-[#0B4F4B] shadow-xs">
                      <IconComp className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-[#102A2A]">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
                    {s.desc}
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

"use client";

import React from "react";
import { GraduationCap, Users, MessageSquare, Rocket } from "lucide-react";

export interface ExperienceCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}

export function LiveExperienceSection() {
  const experiences: ExperienceCard[] = [
    {
      icon: <GraduationCap className="h-7 w-7 text-[#7A0000]" />,
      badge: "Interactive",
      title: "🎓 Learn Live",
      description: "Interactive learning sessions delivered directly by expert educators and mentors.",
    },
    {
      icon: <Users className="h-7 w-7 text-[#7A0000]" />,
      badge: "Community",
      title: "👨‍🏫 Meet Educators",
      description: "Connect directly with passionate educators, tutors, and subject specialists.",
    },
    {
      icon: <MessageSquare className="h-7 w-7 text-[#7A0000]" />,
      badge: "Real-Time Q&A",
      title: "💬 Ask & Connect",
      description: "Interact live, ask questions during sessions, and participate in open discussions.",
    },
    {
      icon: <Rocket className="h-7 w-7 text-[#7A0000]" />,
      badge: "Growth",
      title: "🚀 Grow Together",
      description: "Become an active part of a stronger, supportive, and connected learning community.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FFF9F2] text-[#3B0202] font-sans border-b border-[#F3E2D0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-[#7A0000] bg-[#7A0000]/10 px-3.5 py-1 rounded-full border border-[#7A0000]/20">
            Interactive Experience
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#3B0202] tracking-tight">
            What You&apos;ll Experience
          </h2>
          <p className="text-[#6E4F42] text-sm sm:text-base leading-relaxed">
            Designed to elevate online education beyond traditional video streaming into an active learning ecosystem.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {experiences.map((item, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-[#F3E2D0] shadow-sm hover:border-[#7A0000] hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                {/* Top Row: Icon & Pill Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#FFF5E8] border border-[#F3E2D0] group-hover:bg-[#7A0000]/10 group-hover:scale-105 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-extrabold text-[#590404] uppercase tracking-wider bg-[#FFD700]/20 px-2.5 py-0.5 rounded-full border border-[#FFD700]/40">
                    {item.badge}
                  </span>
                </div>

                {/* Card Title & Body */}
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-[#3B0202] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E4F42] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Line */}
              <div className="pt-2 border-t border-[#F3E2D0] flex items-center gap-1.5 text-xs font-extrabold text-[#7A0000] group-hover:translate-x-1 transition-transform">
                <span>Explore Feature</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

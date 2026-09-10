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
      icon: <GraduationCap className="h-7 w-7 text-[#0B4F4B]" />,
      badge: "Interactive",
      title: "🎓 Learn Live",
      description: "Interactive learning sessions delivered directly by expert educators and mentors.",
    },
    {
      icon: <Users className="h-7 w-7 text-[#0B4F4B]" />,
      badge: "Community",
      title: "👨‍🏫 Meet Educators",
      description: "Connect directly with passionate educators, tutors, and subject specialists.",
    },
    {
      icon: <MessageSquare className="h-7 w-7 text-[#0B4F4B]" />,
      badge: "Real-Time Q&A",
      title: "💬 Ask & Connect",
      description: "Interact live, ask questions during sessions, and participate in open discussions.",
    },
    {
      icon: <Rocket className="h-7 w-7 text-[#0B4F4B]" />,
      badge: "Growth",
      title: "🚀 Grow Together",
      description: "Become an active part of a stronger, supportive, and connected learning community.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FBF7EE] text-[#102A2A] font-sans border-b border-[#DCE5E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-[#0B4F4B] bg-[#0B4F4B]/10 px-3.5 py-1 rounded-full border border-[#0B4F4B]/20">
            Interactive Experience
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102A2A] tracking-tight">
            What You&apos;ll Experience
          </h2>
          <p className="text-[#5D7373] text-sm sm:text-base leading-relaxed">
            Designed to elevate online education beyond traditional video streaming into an active learning ecosystem.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {experiences.map((item, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DCE5E4] shadow-sm hover:border-[#0B4F4B] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                {/* Top Row: Icon & Pill Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#FBF7EE] border border-[#DCE5E4] group-hover:bg-[#0B4F4B]/10 group-hover:scale-105 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-extrabold text-[#102A2A] uppercase tracking-wider bg-[#F2C14E]/20 px-2.5 py-0.5 rounded-full border border-[#F2C14E]/40">
                    {item.badge}
                  </span>
                </div>

                {/* Card Title & Body */}
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-[#102A2A] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Line */}
              <div className="pt-2 border-t border-[#DCE5E4] flex items-center gap-1.5 text-xs font-extrabold text-[#0B4F4B] group-hover:translate-x-1 transition-transform">
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

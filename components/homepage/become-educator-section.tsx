"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Award, BookOpen, Video, TrendingUp } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";

export function BecomeEducatorSection() {
  const educatorFeatures = [
    "Create courses",
    "Share your expertise",
    "Teach learners",
    "Grow your educational presence",
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#FBF7EE] border-b border-[#DCE5E4] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-[#0F5C5A] text-white shadow-2xl relative overflow-hidden">
          {/* Background Glow Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2C14E]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="text-xs font-black text-[#F2C14E] uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20">
                TEACH ON EDUCONNECTS
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Your knowledge can help someone grow.
              </h2>

              <p className="text-base sm:text-lg text-teal-100/90 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Create courses, teach learners and build your presence through EduConnects. Set your own rates, host live classes, and receive automated payouts.
              </p>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm font-bold text-white max-w-lg mx-auto lg:mx-0 text-left">
                {educatorFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-[#F2C14E] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-4 flex justify-center lg:justify-start">
                <Link href="/teacher">
                  <GlassButton
                    variant="secondary"
                    size="lg"
                    className="bg-[#F2C14E] hover:bg-[#E0B03C] text-[#102A2A] font-extrabold px-8 py-3.5 rounded-full shadow-xl text-sm"
                    rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
                  >
                    Become an Educator →
                  </GlassButton>
                </Link>
              </div>
            </div>

            {/* Right Graphics Badge */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-[#083F3D] border border-[#1B6863] shadow-xl space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#0F5C5A] text-[#F2C14E]">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Full IP Ownership</h3>
                    <p className="text-xs text-teal-100/70">Your courses & content remain 100% yours</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F5C5A]/60 border border-[#1B6863]/60 space-y-2 text-xs text-teal-100/80">
                  <div className="flex justify-between font-bold text-white">
                    <span>Platform Commission:</span>
                    <span className="text-[#F2C14E]">Fair & Transparent</span>
                  </div>
                  <div className="flex justify-between font-bold text-white">
                    <span>Direct Bank Deposit:</span>
                    <span>Automated Cashfree Payouts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

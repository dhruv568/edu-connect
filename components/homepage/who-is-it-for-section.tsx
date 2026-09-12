"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Users, BookOpen, Video, ShieldCheck } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";

export function WhoIsItForSection() {
  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#DCE5E4] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-[#0F5C5A] uppercase tracking-widest px-3 py-1 rounded-full bg-[#E6F0EF]">
            TAILORED LEARNING & TEACHING EXPERIENCE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102A2A] tracking-tight">
            Built for learners and educators
          </h2>
          <p className="text-sm sm:text-base text-[#5D7373] max-w-xl mx-auto">
            EduConnects bridges the gap between ambitious learners seeking quality guidance and expert educators building their brand.
          </p>
        </div>

        {/* Two Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 — For Learners */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#F5F7F8] border border-[#DCE5E4] hover:border-[#0F5C5A]/40 transition-all flex flex-col justify-between space-y-8 relative overflow-hidden group shadow-sm hover:shadow-xl">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#0F5C5A]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />

            <div className="space-y-5 relative z-10">
              <div className="p-3.5 rounded-2xl bg-[#0F5C5A] text-white w-fit shadow-md">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-black text-[#0F5C5A] uppercase tracking-wider">
                  FOR LEARNERS
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#102A2A] mt-1">
                  Find. Learn. Grow.
                </h3>
              </div>
              <p className="text-sm text-[#5D7373] leading-relaxed">
                Find educators, courses and learning experiences that fit your goals. Connect directly for 1-on-1 sessions, structured video courses, or live interactive batches.
              </p>

              {/* Feature Points */}
              <div className="space-y-2 pt-2 text-xs font-semibold text-[#102A2A]">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F5C5A]" />
                  <span>Discover verified tutors across academic & professional subjects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F5C5A]" />
                  <span>Enroll in self-paced video courses or attend live classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F5C5A]" />
                  <span>Flexible schedules matched to your learning speed</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#DCE5E4]">
              <Link href="/find-teachers">
                <GlassButton
                  variant="primary"
                  className="bg-[#0F5C5A] hover:bg-[#083F3D] text-white font-extrabold px-6 rounded-full"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Find an Educator →
                </GlassButton>
              </Link>
            </div>
          </div>

          {/* Card 2 — For Educators */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#FBF7EE] border border-[#F2C14E]/40 hover:border-[#F2C14E] transition-all flex flex-col justify-between space-y-8 relative overflow-hidden group shadow-sm hover:shadow-xl">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#F2C14E]/15 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />

            <div className="space-y-5 relative z-10">
              <div className="p-3.5 rounded-2xl bg-[#1B6863] text-white w-fit shadow-md">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-black text-[#1B6863] uppercase tracking-wider">
                  FOR EDUCATORS
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#102A2A] mt-1">
                  Teach. Connect. Grow.
                </h3>
              </div>
              <p className="text-sm text-[#5D7373] leading-relaxed">
                Share your expertise, create courses and reach learners through EduConnects. Build your teaching brand, set your rates, and host live sessions effortlessly.
              </p>

              {/* Feature Points */}
              <div className="space-y-2 pt-2 text-xs font-semibold text-[#102A2A]">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1B6863]" />
                  <span>Build verified educator credentials & display student reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1B6863]" />
                  <span>Publish recorded course modules with automated video processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1B6863]" />
                  <span>Set your own hourly rate & receive direct payouts</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#F2C14E]/30">
              <Link href="/teacher">
                <GlassButton
                  variant="secondary"
                  className="bg-[#1B6863] hover:bg-[#0F5C5A] text-white font-extrabold px-6 rounded-full"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Become an Educator →
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

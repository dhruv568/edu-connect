"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { PlayCircle, CheckCircle2, BookOpen, Clock, FileText, ArrowRight } from "lucide-react";
import { UserRole } from "@/types/auth";

export interface CourseExperienceSectionProps {
  onOpenAuth: (role: UserRole) => void;
}

export function CourseExperienceSection({ onOpenAuth }: CourseExperienceSectionProps) {
  const modules = [
    { title: "Module 01: Foundations of Quadratic Functions", status: "100% Completed", active: false },
    { title: "Module 02: Complex Polynomial Factoring", status: "100% Completed", active: false },
    { title: "Module 03: Vector Calculus & Coordinates", status: "In Progress (82%)", active: true },
    { title: "Module 04: Advanced Trigonometric Identities", status: "Upcoming", active: false },
  ];

  return (
    <section className="py-24 bg-white/60 backdrop-blur-md border-y border-white/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">
            Self-Paced Learning Engine
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Structured Pre-recorded LMS Courses
          </h2>
          <p className="text-base text-slate-600">
            Learn at your own pace with bite-sized HD video lessons, auto-graded quizzes, and downloadable resources.
          </p>
        </div>

        {/* Diagonal / Horizontal Layout Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Course Card */}
          <GlassCard glowColor="rgba(16, 185, 129, 0.2)" className="lg:col-span-7 p-5 sm:p-8 space-y-6 border-2 border-white/90">
            <div className="flex items-center justify-between">
              <GlassBadge variant="emerald" size="md">COURSE IN PROGRESS</GlassBadge>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 14.5 Hours Total
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">High School & College STEM</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">Advanced Mathematics & Calculus Mastery</h3>
              <p className="text-xs text-slate-500 mt-1">12 Modules • 48 Video Lessons • 12 Downloadable Workbooks</p>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Course Progress</span>
                <span className="text-emerald-600">82% Complete</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 w-[82%] rounded-full" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <GlassButton
                variant="primary"
                size="md"
                onClick={() => onOpenAuth("STUDENT")}
                leftIcon={<PlayCircle className="h-4 w-4" />}
              >
                Continue Lesson 14
              </GlassButton>
            </div>
          </GlassCard>

          {/* Right Modules Stack */}
          <div className="lg:col-span-5 space-y-4">
            {modules.map((m, idx) => (
              <GlassCard
                key={idx}
                enableTilt={false}
                className={`p-4 border transition-all ${
                  m.active ? "border-emerald-400 bg-emerald-50/50 shadow-md" : "border-white/80 bg-white/60"
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-2 text-xs font-bold">
                  <span className={m.active ? "text-emerald-800" : "text-slate-800"}>{m.title}</span>
                  {m.active ? (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Active</span>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

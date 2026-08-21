"use client";

import React from "react";
import Link from "next/link";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <GlassBadge variant="blue">JOIN EDUCONNECT</GlassBadge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Choose Your Role</h1>
          <p className="text-sm text-slate-600">
            Select how you will participate in the EduConnect digital learning universe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TEACHER ROLE CARD */}
          <Link href="/register/teacher">
            <GlassCard
              glowColor="rgba(99, 102, 241, 0.2)"
              className="group cursor-pointer p-8 space-y-6 border-2 border-white/90 hover:border-indigo-400 transition-all flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <GlassBadge variant="indigo" size="sm">FOR EDUCATORS</GlassBadge>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">Teacher / Educator</h2>
                  <p className="text-xs font-bold text-indigo-600 italic mt-0.5">&ldquo;Teach. Inspire. Grow.&rdquo;</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Create your verified profile, set hourly rates, host live class slots, and offer demo trial sessions.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                <span>Start Educator Registration</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </GlassCard>
          </Link>

          {/* STUDENT ROLE CARD */}
          <Link href="/register/student">
            <GlassCard
              glowColor="rgba(16, 185, 129, 0.2)"
              className="group cursor-pointer p-8 space-y-6 border-2 border-white/90 hover:border-emerald-400 transition-all flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <GlassBadge variant="emerald" size="sm">FOR LEARNERS</GlassBadge>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">Student / Learner</h2>
                  <p className="text-xs font-bold text-emerald-600 italic mt-0.5">&ldquo;Learn. Practice. Achieve.&rdquo;</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Find top verified tutors, book introductory trial demos, join live classes, and track your streak.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                <span>Start Student Registration</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </GlassCard>
          </Link>
        </div>

        <div className="text-center pt-4 border-t border-slate-200/80 text-sm font-semibold">
          <span className="text-slate-600">Already have an account? </span>
          <Link href="/login" className="text-blue-600 hover:underline font-extrabold">
            Sign In to EduConnect
          </Link>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

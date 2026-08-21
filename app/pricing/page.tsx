"use client";

import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Target, Video, Play, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-5xl mx-auto px-4 w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <GlassBadge variant="blue">TRANSPARENT BUSINESS MODEL</GlassBadge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Flexible Pricing for Every Learning Need</h1>
          <p className="text-sm text-slate-600">
            No surprise monthly commitments. Choose between introductory demos, pay-per-class live slots, or one-off recorded course purchases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Demo Model */}
          <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-8 space-y-6 border-2 border-white/90">
            <div className="space-y-2">
              <GlassBadge variant="blue">1-ON-1 DEMO</GlassBadge>
              <h3 className="text-xl font-extrabold text-slate-900">Demo Sessions</h3>
              <p className="text-xs text-slate-500">Try a verified educator before committing</p>
            </div>
            <div className="text-3xl font-black text-slate-900">Set by Tutor</div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 1-on-1 trial session</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Direct teacher Q&A</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Instant scheduling</li>
            </ul>
            <Link href="/find-teachers">
              <GlassButton variant="primary" className="w-full mt-4" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Find Demo Tutors
              </GlassButton>
            </Link>
          </GlassCard>

          {/* Live Slot Model */}
          <GlassCard glowColor="rgba(99, 102, 241, 0.15)" className="p-8 space-y-6 border-2 border-indigo-200">
            <div className="space-y-2">
              <GlassBadge variant="indigo">POPULAR</GlassBadge>
              <h3 className="text-xl font-extrabold text-slate-900">Live Class Slots</h3>
              <p className="text-xs text-slate-500">Pay only for scheduled live classes you join</p>
            </div>
            <div className="text-3xl font-black text-slate-900">Per Class Slot</div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Built-in virtual classroom</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Interactive whiteboard & chat</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automatic attendance recording</li>
            </ul>
            <Link href="/find-teachers">
              <GlassButton variant="primary" className="w-full mt-4" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Reserve Live Slot
              </GlassButton>
            </Link>
          </GlassCard>

          {/* Recorded Course Model */}
          <GlassCard glowColor="rgba(16, 185, 129, 0.15)" className="p-8 space-y-6 border-2 border-white/90">
            <div className="space-y-2">
              <GlassBadge variant="emerald">24/7 ACCESS</GlassBadge>
              <h3 className="text-xl font-extrabold text-slate-900">Recorded Courses</h3>
              <p className="text-xs text-slate-500">Lifetime access to structured LMS modules</p>
            </div>
            <div className="text-3xl font-black text-slate-900">Per Course</div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Self-paced HD video lessons</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Downloadable workbooks</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Auto-graded quizzes & certificate</li>
            </ul>
            <Link href="/courses">
              <GlassButton variant="secondary" className="w-full mt-4" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Explore LMS Courses
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

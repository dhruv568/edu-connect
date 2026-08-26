"use client";

import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GraduationCap, ShieldCheck, Heart, Users, Sparkles, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-5xl mx-auto px-4 w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <GlassBadge variant="blue">ABOUT EDUCONNECT</GlassBadge>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Connecting Education for Every Learner
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            EduConnect is built on the belief that flexible learning models, verified tutors, and interactive virtual classrooms build better educational futures.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-6 space-y-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Educators</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every teacher undergoes multi-stage credential checks, background verification, and administrative audit.
            </p>
          </GlassCard>

          <GlassCard glowColor="rgba(99, 102, 241, 0.15)" className="p-6 space-y-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3 Independent Models</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Separated workflows for Demo Bookings, Live Class Slots, and Pre-recorded Courses.
            </p>
          </GlassCard>

          <GlassCard glowColor="rgba(16, 185, 129, 0.15)" className="p-6 space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
              <Heart className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Interactive Classroom</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time WebRTC video, digital whiteboard collaboration, live classroom chat, and attendance tracking.
            </p>
          </GlassCard>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

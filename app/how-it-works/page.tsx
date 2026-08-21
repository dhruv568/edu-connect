"use client";

import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { LearningJourneyPath } from "@/components/homepage/learning-journey-path";
import { GlassBadge } from "@/components/glass/glass-badge";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="text-center max-w-2xl mx-auto space-y-3 px-4 mb-8">
          <GlassBadge variant="blue">EDUCATIONAL PLATFORM WORKFLOW</GlassBadge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">How EduConnect Works</h1>
          <p className="text-sm text-slate-600">
            A step-by-step walkthrough of how teachers, students, and parents collaborate for academic growth.
          </p>
        </div>

        <LearningJourneyPath />
      </main>

      <PremiumFooter />
    </div>
  );
}

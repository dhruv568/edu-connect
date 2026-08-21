import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="outline">LEGAL DOCUMENT PLACEHOLDER</GlassBadge>
          <h1 className="text-3xl font-black text-slate-900">Terms & Conditions</h1>
          <p className="text-xs text-slate-500">Last updated: August 2026</p>
        </div>

        <GlassCard className="p-8 space-y-6 text-xs text-slate-600 leading-relaxed border border-slate-200">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 font-semibold">
            ℹ️ CLIENT NOTICE: This page serves as a customizable legal document template. Formal terms of service supplied by the platform owner will be integrated here.
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. Acceptance of Terms</h3>
            <p>
              By accessing or using the EduConnect platform, services, demo bookings, live classes, or pre-recorded LMS courses, you agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">2. User Roles & Account Responsibilities</h3>
            <p>
              Users registering as Teachers, Students, or Parents must provide accurate registration details and maintain secure credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">3. Class Booking & Conduct</h3>
            <p>
              Live class sessions and demo bookings are subject to educator availability and platform conduct guidelines.
            </p>
          </section>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

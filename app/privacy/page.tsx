import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="outline">LEGAL DOCUMENT PLACEHOLDER</GlassBadge>
          <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Last updated: August 2026</p>
        </div>

        <GlassCard className="p-8 space-y-6 text-xs text-slate-600 leading-relaxed border border-slate-200">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 font-semibold">
            ℹ️ CLIENT NOTICE: This privacy policy outline provides the structural placeholder for approved data protection, cookie policy, and encryption policies.
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. Data Collection & Security</h3>
            <p>
              EduConnect collects minimal personal data required for account registration, email verification, and learning progress monitoring. All passwords and tokens are securely hashed.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">2. Student & Child Data Protection</h3>
            <p>
              We enforce strict privacy controls and encrypted data transmission for all student accounts and learning activities.
            </p>
          </section>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

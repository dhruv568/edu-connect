import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="outline">LEGAL DOCUMENT PLACEHOLDER</GlassBadge>
          <h1 className="text-3xl font-black text-slate-900">Refund Policy</h1>
          <p className="text-xs text-slate-500">Last updated: August 2026</p>
        </div>

        <GlassCard className="p-8 space-y-6 text-xs text-slate-600 leading-relaxed border border-slate-200">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 font-semibold">
            ℹ️ CLIENT NOTICE: This page details the refund parameters for demo sessions, live class cancellations, and digital course access.
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. Demo Session Refunds</h3>
            <p>
              Demo sessions cancelled at least 24 hours prior to the scheduled time are eligible for full wallet credit or refund.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">2. Live Class Slot Cancellations</h3>
            <p>
              Cancellations submitted within the specified window automatically return slot credits to the parent/student wallet balance.
            </p>
          </section>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

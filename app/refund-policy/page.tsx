import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";
import { ShieldCheck, RefreshCw, AlertCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy — MyProFunnels Ventures",
  description: "Official Refund & Cancellation Policy for digital products, live classes, subscriptions, and services.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="emerald">CUSTOMER POLICY</GlassBadge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Refund & Cancellation Policy</h1>
          <p className="text-xs text-slate-500 font-medium">Effective Date: September 2026</p>
        </div>

        {/* Highlight Card */}
        <div className="p-6 rounded-3xl bg-emerald-900 text-white space-y-4 shadow-xl border border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-2xl text-emerald-300">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Official Refund Period</span>
              <h3 className="text-xl font-black text-white">Within 24 Hours</h3>
            </div>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Refund requests submitted within 24 hours of transaction/order placement are accepted, subject to applicable terms, conditions, and service eligibility criteria of {OFFICIAL_COMPANY_INFO.brandName}.
          </p>
        </div>

        {/* Policy Details */}
        <GlassCard className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed border border-slate-200">
          {/* Section 1: Overview & Scope */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Overview & Business Identity</h3>
            <p>
              This Refund & Cancellation Policy applies to all digital products, LMS online courses, live training sessions, software subscriptions, and technology-enabled business services provided by <strong>{OFFICIAL_COMPANY_INFO.legalName}</strong> (Brand: <strong>{OFFICIAL_COMPANY_INFO.brandName}</strong>).
            </p>
          </section>

          {/* Section 2: 24-Hour Refund Window & Eligibility */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Refund Request Window & Eligibility Conditions</h3>
            <p>
              - Eligible refund requests must be initiated <strong>within 24 hours</strong> of the transaction or purchase timestamp.
              <br />
              - Digital products, downloadable content, or service packages that have already been accessed, downloaded, or delivered in full may have specific eligibility limitations.
              <br />
              - Custom done-for-you services or tailored marketing setups where active resource allocation has commenced will be evaluated based on the specific scope completed prior to the cancellation request.
            </p>
          </section>

          {/* Section 3: Verification & Payment Method */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">3. Verification & Refund Processing Method</h3>
            <p>
              - All refund requests require verification of the original transaction ID, order reference, and customer registration credentials.
              <br />
              - Approved refunds will be credited back to the <strong>original payment method</strong> used during checkout.
              <br />
              - Payments processed online through our official payment gateway provider, <strong>Cashfree</strong>, will follow standard Cashfree merchant refund routing procedures.
            </p>
          </section>

          {/* Section 4: Distinguishing Cancellation from Refund */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">4. Distinguishing Cancellation from Refund</h3>
            <p>
              - <strong>Subscription / Order Cancellation:</strong> Prevents future renewal charges or halts ongoing service delivery. Cancelling an active recurring subscription stops future billing cycles.
              <br />
              - <strong>Transaction Refund:</strong> Refers to the return of funds paid for a specific transaction initiated within the eligible 24-hour window, subject to verification.
            </p>
          </section>

          {/* Section 5: Payment Gateway Reference */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">5. Payment Gateway Partner</h3>
            <p>
              Online payment collection and processing on this website are facilitated securely through <strong>Cashfree Payments</strong>. Refunds processed through Cashfree are subject to bank processing cycles and gateway timelines.
            </p>
          </section>

          {/* Section 6: Requesting a Refund / Contact */}
          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-900">6. How to Submit a Refund or Cancellation Request</h3>
            <p>
              To request a refund within the 24-hour period, please contact our support team with your order details:
              <br />
              <strong>Official WhatsApp:</strong> {OFFICIAL_COMPANY_INFO.whatsappNumber}
              <br />
              <strong>Registered Office:</strong> {OFFICIAL_COMPANY_INFO.registeredAddress}
              <br />
              <strong>Authorized Signatory:</strong> {OFFICIAL_COMPANY_INFO.authorizedSignatory}
            </p>
          </section>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";
import { Truck, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy — EduConnects",
  description: "Official Shipping & Fulfillment Policy for digital educational services and online learning platform.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="emerald">FULFILLMENT POLICY</GlassBadge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Shipping & Delivery Policy</h1>
          <p className="text-xs text-slate-500 font-medium">Effective Date: September 2026</p>
        </div>

        {/* Highlight Card */}
        <div className="p-6 rounded-3xl bg-[#0F5C5A] text-white space-y-4 shadow-xl border border-[#083F3D]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl text-emerald-300">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Digital Fulfillment</span>
              <h3 className="text-xl font-black text-white">100% Digital Delivery</h3>
            </div>
          </div>
          <p className="text-xs text-emerald-50 leading-relaxed font-medium">
            We do not ship any physical products. EduConnects provides digital learning services and online educational content delivered electronically upon successful order confirmation.
          </p>
        </div>

        {/* Policy Details */}
        <GlassCard className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed border border-slate-200">
          {/* Section 1: Nature of Services */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Nature of Services</h3>
            <p>
              EduConnects is a premier online education and digital mentorship marketplace operated by <strong>{OFFICIAL_COMPANY_INFO.legalName}</strong>. All offerings—including interactive live classes, digital courses, educator sessions, study material downloads, and learning credentials—are exclusively delivered digitally.
            </p>
          </section>

          {/* Section 2: Delivery & Access Timelines */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Delivery Timeline & Immediate Access</h3>
            <p>
              - <strong>Recorded Courses & Digital Resources:</strong> Access is provisioned immediately upon successful completion of payment through our secure payment gateway. Your course dashboard is activated in real time.
              <br />
              - <strong>Live Classes & 1-on-1 Sessions:</strong> Access links, scheduling confirmations, and live room invitations are delivered instantaneously to your registered dashboard and confirmed via email.
              <br />
              - <strong>Receipts & Order Confirmations:</strong> An electronic invoice and transaction confirmation are dispatched immediately to your registered email address.
            </p>
          </section>

          {/* Section 3: Physical Shipping Disclaimer */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">3. Physical Shipping Disclaimer</h3>
            <p>
              Because all products and educational experiences are purely digital, no physical shipping fees, couriers, tracking numbers, or physical delivery addresses are required or utilized. There are zero shipping charges associated with any digital course or live booking on EduConnects.
            </p>
          </section>

          {/* Section 4: Secure Transactions & Payment Gateway */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">4. Payment Gateway & Security</h3>
            <p>
              All transactions on EduConnects are processed through <strong>Cashfree Payments</strong>, ensuring 100% secure, encrypted digital transactions in Indian Rupees (₹ INR).
            </p>
          </section>

          {/* Section 5: Support & Fulfillment Inquiries */}
          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-900">5. Support & Fulfillment Inquiries</h3>
            <p>
              If you experience any delay in accessing your purchased digital course, educator session, or order confirmation, please reach out to our customer support team:
              <br />
              <strong>Official WhatsApp / Helpline:</strong> {OFFICIAL_COMPANY_INFO.whatsappNumber}
              <br />
              <strong>Company Entity:</strong> {OFFICIAL_COMPANY_INFO.legalName}
              <br />
              <strong>Registered Office:</strong> {OFFICIAL_COMPANY_INFO.registeredAddress}
              <br />
              <strong>CIN:</strong> {OFFICIAL_COMPANY_INFO.cin}
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

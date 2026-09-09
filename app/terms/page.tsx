import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";
import { ShieldCheck, Info } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions — MyProFunnels Ventures",
  description: "Official Terms and Conditions for digital products, subscriptions, services, training programs, and LMS courses.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="outline">LEGAL POLICY DOCUMENT</GlassBadge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Terms & Conditions</h1>
          <p className="text-xs text-slate-500 font-medium">Effective Date: September 2026</p>
        </div>

        {/* Advisory Review Note */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-3">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Legal Review Notice:</span>
            <span>
              This Terms & Conditions document outlines the standard legal rules for using digital products, subscriptions, training programs, online courses, and technology-enabled services offered under {OFFICIAL_COMPANY_INFO.brandName}. Final policy text remains subject to approval by the authorized signatory and legal counsel.
            </span>
          </div>
        </div>

        {/* Main Document Content */}
        <GlassCard className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed border border-slate-200">
          {/* Company Identification Header */}
          <section className="bg-slate-900 text-slate-100 p-6 rounded-2xl space-y-3">
            <h2 className="text-base font-extrabold text-white">Company Information & Legal Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Legal Company Name:</span>
                <span className="font-bold text-white">{OFFICIAL_COMPANY_INFO.legalName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Brand Name:</span>
                <span className="font-bold text-white">{OFFICIAL_COMPANY_INFO.brandName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">CIN:</span>
                <span className="font-mono font-bold text-white">{OFFICIAL_COMPANY_INFO.cin}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">PAN:</span>
                <span className="font-mono font-bold text-white">{OFFICIAL_COMPANY_INFO.pan}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Authorized Signatory:</span>
                <span className="font-bold text-white">{OFFICIAL_COMPANY_INFO.authorizedSignatory}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Governing Law:</span>
                <span className="font-bold text-white">{OFFICIAL_COMPANY_INFO.governingLaw}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 font-medium block">Nature of Business:</span>
                <span className="font-bold text-white">{OFFICIAL_COMPANY_INFO.natureOfBusiness}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 font-medium block">Registered Office:</span>
                <span className="font-bold text-white">{OFFICIAL_COMPANY_INFO.registeredAddress}</span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h3>
            <p>
              By accessing, browsing, registering for, or making purchases on this platform (operated under brand name {OFFICIAL_COMPANY_INFO.brandName} by {OFFICIAL_COMPANY_INFO.legalName}), you agree to be bound by these Terms & Conditions, our Privacy Policy, and Refund & Cancellation Policy. If you do not agree to these terms, please discontinue use of the platform and services immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Scope of Services & Offerings</h3>
            <p>
              {OFFICIAL_COMPANY_INFO.brandName} provides technology-enabled business solutions, digital marketing infrastructure, automated sales funnels, CRM integrations, WhatsApp automation services, live interactive classes, online course hosting, training programs, and skill development offerings. Detailed service parameters for specific Done-For-You packages or subscriptions are governed by respective order agreements.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">3. User Accounts & Responsibilities</h3>
            <p>
              Users registering on the platform must provide truthful, accurate registration information and maintain confidential account login credentials. You are responsible for all activities that occur under your registered account. Any unauthorized access must be reported to the platform administration immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">4. Subscriptions, Digital Products & Payments</h3>
            <p>
              All online transactions, service offerings, and course enrollments are billed in INR (₹) via Cashfree payment gateway. Access to digital products, pre-recorded LMS modules, or scheduled live training slots is granted upon successful payment confirmation. Pricing ranges from ₹99 to ₹2.99 Lakh based on selected services, modules, or custom business requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">5. Intellectual Property Rights</h3>
            <p>
              All curriculum content, video lessons, automated funnel templates, software code, graphic designs, logos, and materials provided by {OFFICIAL_COMPANY_INFO.brandName} remain the exclusive intellectual property of {OFFICIAL_COMPANY_INFO.legalName}. Unauthorized distribution, copying, reselling, or recording of proprietary content is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">6. User Conduct & Acceptable Use</h3>
            <p>
              Users agree not to misuse platform infrastructure, transmit malicious content, breach system security, or engage in abusive behavior towards instructors, staff, or fellow platform users. Violation of conduct standards may result in immediate suspension without refund.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">7. Limitation of Liability & Governing Law</h3>
            <p>
              To the maximum extent permitted by applicable law, {OFFICIAL_COMPANY_INFO.legalName} shall not be liable for indirect, incidental, or consequential damages resulting from service interruptions or third-party platform dependencies. These terms are governed by and construed in accordance with the laws of {OFFICIAL_COMPANY_INFO.governingLaw}.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">8. Contact Information</h3>
            <p>
              For legal notices or questions regarding these Terms & Conditions, please contact:
              <br />
              <strong>Authorized Signatory:</strong> {OFFICIAL_COMPANY_INFO.authorizedSignatory}
              <br />
              <strong>WhatsApp:</strong> {OFFICIAL_COMPANY_INFO.whatsappNumber}
              <br />
              <strong>Registered Address:</strong> {OFFICIAL_COMPANY_INFO.registeredAddress}
            </p>
          </section>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

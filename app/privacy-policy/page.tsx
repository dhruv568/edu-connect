import React from "react";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";
import { ShieldCheck, Lock, Database, Cpu } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — MyProFunnels Ventures",
  description: "Official Privacy Policy explaining data processing, infrastructure technology, and customer data protection.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="indigo">DATA PROTECTION</GlassBadge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-500 font-medium">Effective Date: September 2026</p>
        </div>

        {/* Main Document Content */}
        <GlassCard className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed border border-slate-200">
          {/* Section 1: Overview */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Overview & Data Controller</h3>
            <p>
              This Privacy Policy describes how <strong>{OFFICIAL_COMPANY_INFO.legalName}</strong> (Brand Name: <strong>{OFFICIAL_COMPANY_INFO.brandName}</strong>) collects, processes, and protects information when you access our website ({OFFICIAL_COMPANY_INFO.website}), platform, online courses, and digital solutions.
            </p>
          </section>

          {/* Section 2: Information Collected & Purposes */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Information Collection & Processing Purposes</h3>
            <p>
              We collect and process personal and technical information strictly necessary for the operation and delivery of our business services. Information processing includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700 font-medium">
              <li><strong>Account Registration:</strong> Name, email address, password hash, role credentials, and contact details.</li>
              <li><strong>Lead Management:</strong> Lead inquiries, contact submission forms, and audience segmentation.</li>
              <li><strong>Customer Communication:</strong> Service updates, support messages, and transaction notifications.</li>
              <li><strong>Payment Processing:</strong> Order details, transaction references, and payment verification via Cashfree.</li>
              <li><strong>Course & Service Delivery:</strong> LMS progress tracking, lesson completion, certificates, and live class access.</li>
              <li><strong>Marketing Automation:</strong> Email campaign workflows, broadcast lists, and WhatsApp automation triggers.</li>
              <li><strong>Customer Support:</strong> Direct support requests, helpdesk tickets, and inquiry responses.</li>
              <li><strong>Analytics & Platform Improvement:</strong> System usage metrics, error logs, and performance optimization.</li>
            </ul>
          </section>

          {/* Section 3: Technology Infrastructure & Third-Party Services */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">3. Technology Ecosystem & Integrated Services</h3>
            <p>
              To deliver seamless online education, digital automation, and payment processing, the platform utilizes industry-standard technology solutions including:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-100/80 rounded-xl font-medium">
                <span className="font-bold text-slate-900 block">Mux:</span>
                <span>Secure video lesson processing, streaming, and delivery.</span>
              </div>
              <div className="p-3 bg-slate-100/80 rounded-xl font-medium">
                <span className="font-bold text-slate-900 block">LiveKit:</span>
                <span>Real-time interactive WebRTC live class video and audio streaming.</span>
              </div>
              <div className="p-3 bg-slate-100/80 rounded-xl font-medium">
                <span className="font-bold text-slate-900 block">Cashfree:</span>
                <span>Payment gateway integration for secure checkout transactions.</span>
              </div>
              <div className="p-3 bg-slate-100/80 rounded-xl font-medium">
                <span className="font-bold text-slate-900 block">WhatsApp API:</span>
                <span>Official Meta WhatsApp Cloud API for customer communications.</span>
              </div>
              <div className="p-3 bg-slate-100/80 rounded-xl font-medium">
                <span className="font-bold text-slate-900 block">Email Services:</span>
                <span>Transactional emails, account verification OTPs, and notifications.</span>
              </div>
              <div className="p-3 bg-slate-100/80 rounded-xl font-medium">
                <span className="font-bold text-slate-900 block">Analytics & CRM Infrastructure:</span>
                <span>Platform audit logging, performance metrics, and lead tracking.</span>
              </div>
            </div>
          </section>

          {/* Section 4: Data Protection Measures */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">4. Technical & Organizational Protection Measures</h3>
            <p>
              We implement appropriate technical and organizational measures to safeguard user information against unauthorized access, loss, alteration, or disclosure. All sensitive communication with server endpoints occurs over secure encrypted protocols, and database access is strictly restricted.
            </p>
          </section>

          {/* Section 5: Data Rights & Contact */}
          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-900">5. Contact Information & Data Requests</h3>
            <p>
              If you have questions regarding this Privacy Policy or wish to update your personal information, please contact:
              <br />
              <strong>Company:</strong> {OFFICIAL_COMPANY_INFO.legalName} ({OFFICIAL_COMPANY_INFO.brandName})
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

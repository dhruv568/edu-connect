"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";
import {
  Target,
  Video,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Layers,
  HelpCircle,
  Briefcase,
} from "lucide-react";

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const matrixRows = [
    { feature: "Direct 1-on-1 Mentorship", demo: true, live: false, lms: false },
    { feature: "Live WebRTC Two-Way Audio/Video", demo: true, live: true, lms: false },
    { feature: "Interactive Shared Digital Whiteboard", demo: true, live: true, lms: false },
    { feature: "Real-Time In-Class Q&A Chat", demo: true, live: true, lms: false },
    { feature: "Auto-Graded Concept Quizzes", demo: false, live: true, lms: true },
    { feature: "Downloadable Lesson Workbooks & PDFs", demo: false, live: true, lms: true },
    { feature: "Course Completion Certificate", demo: false, live: false, lms: true },
    { feature: "24/7 Unlimited Lifetime Access", demo: false, live: false, lms: true },
    { feature: "Pay-As-You-Go (No Subscription Trap)", demo: true, live: true, lms: true },
  ];

  const pricingFaqs = [
    {
      q: "What is the overall price range for MyProFunnels products and services?",
      a: "MyProFunnels subscription and service offerings range from ₹99 to ₹2.99 Lakh depending on the selected plan, digital product, training package, or custom business requirement.",
    },
    {
      q: "Are there any hidden platform or convenience fees?",
      a: "No. The price listed at checkout is the exact total you pay. All payments are processed in Indian Rupees (INR - ₹) securely via Cashfree.",
    },
    {
      q: "How do custom business services work?",
      a: "For custom enterprise setups, done-for-you sales funnels, or specialized digital automation, click 'Get a Custom Quote' or contact us directly on WhatsApp at +91 8062181499.",
    },
    {
      q: "What payment gateway is used for online checkout?",
      a: "All online payments support UPI, Netbanking, Debit/Credit Cards, and Wallets integrated via Cashfree Payment Gateway.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-20 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Transparent Business Model</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Fair & Transparent Pricing for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Every Business & Learning Need
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {OFFICIAL_COMPANY_INFO.brandName} subscription and service offerings range from{" "}
            <strong className="text-slate-900">{OFFICIAL_COMPANY_INFO.pricingRange}</strong> depending on the selected plan, service, package, or business requirement.
          </p>
        </div>

        {/* Pricing Range Highlights Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white space-y-3 shadow-xl border border-indigo-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">Official Pricing Structure</span>
            <h2 className="text-2xl font-black">Plans & Services Starting from ₹99</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Pricing ranges from ₹99 to ₹2.99 Lakh across our 27 digital products, LMS courses, live classes, marketing automation, and done-for-you technical services.
            </p>
          </div>
          <Link href="/services">
            <GlassButton variant="primary" className="shrink-0" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore All 27 Services
            </GlassButton>
          </Link>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Sessions & Micro Products */}
          <GlassCard
            glowColor="rgba(37, 99, 235, 0.15)"
            className="p-7 sm:p-8 space-y-6 border-2 border-white/90 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Target className="h-6 w-6" />
                </div>
                <GlassBadge variant="blue">STARTER PLANS</GlassBadge>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Demo Sessions & Digital Guides</h3>
                <p className="text-xs text-slate-500 mt-0.5">Introductory sessions, trial access, and starter digital assets</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Starting from</div>
                <div className="text-3xl font-black text-slate-900">₹99</div>
                <p className="text-[11px] text-blue-600 font-medium mt-1">Single module / introductory access</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>30-minute private trial or demo class</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Downloadable workbooks & starter templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Interactive shared whiteboard preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Zero ongoing lock-in commitment</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Link href="/services">
                <GlassButton variant="primary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Get Started at ₹99
                </GlassButton>
              </Link>
            </div>
          </GlassCard>

          {/* Live Classes & LMS Courses */}
          <GlassCard
            glowColor="rgba(99, 102, 241, 0.25)"
            className="p-7 sm:p-8 space-y-6 border-2 border-indigo-300 bg-white/85 shadow-xl relative flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Video className="h-6 w-6" />
                </div>
                <GlassBadge variant="indigo">POPULAR</GlassBadge>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Live Slots & LMS Courses</h3>
                <p className="text-xs text-slate-500 mt-0.5">Scheduled live interactive cohorts & recorded video courses</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Standard Pricing</div>
                <div className="text-3xl font-black text-indigo-600">₹499 - ₹4,999</div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Per course / live class cohort</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>HD Mux on-demand video lesson access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Live WebRTC two-way interactive classes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Auto-graded quizzes & completion certificate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Cashfree secure checkout (INR)</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Link href="/courses">
                <GlassButton
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Explore LMS & Live Slots
                </GlassButton>
              </Link>
            </div>
          </GlassCard>

          {/* Done-For-You Business Solutions */}
          <GlassCard
            glowColor="rgba(16, 185, 129, 0.15)"
            className="p-7 sm:p-8 space-y-6 border-2 border-white/90 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Briefcase className="h-6 w-6" />
                </div>
                <GlassBadge variant="indigo">ENTERPRISE DFY</GlassBadge>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Done-for-You & Custom Services</h3>
                <p className="text-xs text-slate-500 mt-0.5">Complete sales funnels, CRM, WhatsApp API, & website builds</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Package Pricing</div>
                <div className="text-3xl font-black text-slate-900">Up to ₹2.99 Lakh</div>
                <p className="text-[11px] text-purple-600 font-medium mt-1">Contact us for custom quote</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Custom funnel, website & CRM deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Meta WhatsApp Cloud API setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Facebook/Instagram Ads & strategy guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Dedicated tech onboarding support</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Link href="/contact">
                <GlassButton variant="secondary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Get a Custom Quote
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* The Consumer Protection Safeguard Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Consumer Safeguard & Payment Assurance</h3>
                <p className="text-xs text-slate-400">Official Cashfree payment gateway integration (INR - ₹)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              100% Secure Checkout
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">Transparent INR Pricing</h5>
              <p className="text-slate-400 leading-relaxed">
                All pricing is displayed clearly in INR (₹99 to ₹2.99 Lakh) with zero hidden transaction surcharges.
              </p>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">24-Hour Refund Request Window</h5>
              <p className="text-slate-400 leading-relaxed">
                Eligible refund requests submitted within 24 hours are accepted subject to terms & conditions.
              </p>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">Cashfree Payment Gateway</h5>
              <p className="text-slate-400 leading-relaxed">
                Supports UPI, Netbanking, Debit/Credit Cards, and Digital Wallets for seamless checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing FAQs */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Billing Transparency</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Pricing & Payment Questions</h2>
          </div>

          <div className="space-y-3">
            {pricingFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      openFaq === idx ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

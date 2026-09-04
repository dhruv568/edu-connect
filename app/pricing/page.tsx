"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import {
  Target,
  Video,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Clock,
  Award,
  Layers,
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
      q: "Are there any hidden platform or convenience fees?",
      a: "No. The price you see listed on an educator's profile, live slot, or course is the exact total you pay at checkout. There are no surprise monthly subscription fees or transaction surcharges.",
    },
    {
      q: "How does the refund policy work for live class slots?",
      a: "If an educator is unable to hold a scheduled live class, or if you cancel more than 12 hours before the start time, your money is instantly refunded 100% to your platform balance or original payment method.",
    },
    {
      q: "Can I buy a recorded course and also book a live class with the same tutor?",
      a: "Yes! Many students watch the self-paced LMS course during the week and book live slots or 1-on-1 sessions with the instructor for doubt clearing before exams.",
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
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Fair, Predictable Pricing for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Every Learning Need
            </span>
          </h1>
          <p className="text-base text-slate-600">
            No expensive annual commitments. Choose introductory demos, pay-as-you-go live slots, or one-time recorded course purchases.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Demo Model */}
          <GlassCard
            glowColor="rgba(37, 99, 235, 0.15)"
            className="p-7 sm:p-8 space-y-6 border-2 border-white/90 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Target className="h-6 w-6" />
                </div>
                <GlassBadge variant="blue">1-ON-1 DEMO</GlassBadge>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Demo Sessions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Meet verified tutors before committing</p>
              </div>

              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Starting from</div>
                <div className="text-3xl font-black text-slate-900">Free / Low Cost</div>
                <p className="text-[11px] text-blue-600 font-medium mt-1">Set independently by each tutor</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>30-minute private trial session</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Personalized syllabus evaluation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Interactive shared whiteboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Zero ongoing lock-in</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Link href="/find-teachers">
                <GlassButton variant="primary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Find Demo Tutors
                </GlassButton>
              </Link>
            </div>
          </GlassCard>

          {/* Live Slot Model */}
          <GlassCard
            glowColor="rgba(99, 102, 241, 0.25)"
            className="p-7 sm:p-8 space-y-6 border-2 border-indigo-300 bg-white/85 shadow-xl relative flex flex-col justify-between scale-102"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Video className="h-6 w-6" />
                </div>
                <GlassBadge variant="indigo">MOST POPULAR</GlassBadge>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Live Class Slots</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pay only for scheduled live sessions you attend</p>
              </div>

              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Typical Pricing</div>
                <div className="text-3xl font-black text-indigo-600">₹300 - ₹750</div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Per scheduled 60-90 min live class</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Small cohorts (max 25 students)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Built-in WebRTC video & pen canvas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Live interactive audio & chat Q&A</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Instant 100% refund if cancelled</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Link href="/find-teachers">
                <GlassButton
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Reserve a Live Slot
                </GlassButton>
              </Link>
            </div>
          </GlassCard>

          {/* Recorded Course Model */}
          <GlassCard
            glowColor="rgba(16, 185, 129, 0.15)"
            className="p-7 sm:p-8 space-y-6 border-2 border-white/90 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Play className="h-6 w-6" />
                </div>
                <GlassBadge variant="emerald">LIFETIME ACCESS</GlassBadge>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Recorded LMS Courses</h3>
                <p className="text-xs text-slate-500 mt-0.5">Comprehensive self-paced video modules</p>
              </div>

              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">One-Time Purchase</div>
                <div className="text-3xl font-black text-slate-900">₹499 - ₹2,999</div>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">Pay once, own forever</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>HD on-demand lessons (10-40+ hrs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Downloadable workbooks & solution sets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Auto-graded concept checkpoint tests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Verified course completion certificate</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Link href="/courses">
                <GlassButton variant="secondary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Explore LMS Courses
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Visual Feature Comparison Matrix */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Side-By-Side Comparison</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Compare All 3 Learning Models</h2>
            <p className="text-xs sm:text-sm text-slate-600">Pick the format that best matches your learning style.</p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[650px] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-900">
                    <th className="p-4 sm:p-5 font-bold">Feature & Capability</th>
                    <th className="p-4 sm:p-5 font-bold text-blue-600 text-center">1-on-1 Demo</th>
                    <th className="p-4 sm:p-5 font-bold text-indigo-600 text-center bg-indigo-50/50">Live Class Slots</th>
                    <th className="p-4 sm:p-5 font-bold text-emerald-600 text-center">Recorded LMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800">{row.feature}</td>
                      <td className="p-4 sm:p-5 text-center">
                        {row.demo ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 sm:p-5 text-center bg-indigo-50/30">
                        {row.live ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 sm:p-5 text-center">
                        {row.lms ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* The EduConnect Pricing Guarantee Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">The EduConnect Consumer Safeguard</h3>
                <p className="text-xs text-slate-400">Protected transactions with automated escrow.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              100% Buyer Protection
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">Zero Surprise Renewals</h5>
              <p className="text-slate-400 leading-relaxed">
                You are never auto-charged for future months without explicit opt-in confirmation.
              </p>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">Instant Cancellation Refund</h5>
              <p className="text-slate-400 leading-relaxed">
                If an educator cancels or reschedules, your payment is immediately returned with zero deductions.
              </p>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">Direct Verified Escrow</h5>
              <p className="text-slate-400 leading-relaxed">
                Educators are compensated only after successful class completion and student sign-off.
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


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import {
  Search,
  Users,
  Video,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  CreditCard,
  PenTool,
  Clock,
  BookOpen,
  DollarSign,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const studentSteps = [
    {
      num: "01",
      title: "Discover Verified Educators",
      desc: "Filter through verified tutors by academic subject, rating, curriculum (CBSE, ICSE, IB, College), and budget.",
      icon: Search,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      renderMock: () => (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Matcher</span>
            <span className="text-blue-400 font-bold text-[10px]">24 Tutors Online</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-300 font-semibold text-[10px] border border-blue-500/40">
              Physics STEM
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[10px]">
              ₹400 - ₹600/hr
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-600/20 text-emerald-300 font-semibold text-[10px]">
              ★ 4.9+ Rated
            </span>
          </div>
        </div>
      ),
    },
    {
      num: "02",
      title: "Book a 1-on-1 Trial Demo",
      desc: "Select a convenient time slot from the educator's live calendar. Experience their teaching style with zero commitment.",
      icon: Calendar,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      renderMock: () => (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Trial Schedule</span>
            <span className="text-emerald-400 font-bold text-[10px]">Free Slot</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center font-bold text-[10px]">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white">4:00 PM</span>
            <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300">5:30 PM</span>
            <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300">7:00 PM</span>
          </div>
        </div>
      ),
    },
    {
      num: "03",
      title: "Learn in Built-in Live Classroom",
      desc: "Join real-time WebRTC live classes with two-way HD video, interactive whiteboard collaboration, and instant chat.",
      icon: Video,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      renderMock: () => (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> LIVE NOW
            </div>
            <span className="text-slate-400 text-[10px]">Room 4-B</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 text-indigo-300 font-mono text-[10px] text-center">
            y - y₁ = m(x - x₁)
          </div>
        </div>
      ),
    },
    {
      num: "04",
      title: "Master Concepts & Earn Certificates",
      desc: "Reinforce learning with self-paced LMS workbooks, auto-graded quizzes, and platform completion certificates.",
      icon: Award,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      renderMock: () => (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Curriculum Milestone</span>
            <span className="text-emerald-400 font-bold text-[10px]">100% Passed</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-300">
            <span>Certificate #EDU-8821</span>
            <span className="text-emerald-400 font-bold">Verified</span>
          </div>
        </div>
      ),
    },
  ];

  const teacherSteps = [
    {
      num: "01",
      title: "Apply & Complete Verification",
      desc: "Submit your academic credentials, degree certificates, and experience records for administrator review.",
      icon: ShieldCheck,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      renderMock: () => (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Audit Status</span>
            <span className="text-emerald-400 font-bold text-[10px]">Certified</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>M.Sc. Credentials Approved</span>
          </div>
        </div>
      ),
    },
    {
      num: "02",
      title: "Set Your Schedule & Rates",
      desc: "Define your weekly availability calendar, set custom hourly pricing, and configure demo slot limits.",
      icon: Clock,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      renderMock: () => (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Hourly Rate</span>
            <span className="text-blue-400 font-bold text-[10px]">₹500 / Hour</span>
          </div>
          <div className="text-[10px] text-slate-300">Mon - Fri: 4:00 PM - 9:00 PM</div>
        </div>
      ),
    },
    {
      num: "03",
      title: "Teach with Built-in Digital Tools",
      desc: "Lead live interactive cohort sessions using pen tablet tools, shared whiteboards, screen sharing, and recording.",
      icon: PenTool,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      renderMock: () => (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Active Session</span>
            <span className="text-emerald-400 font-bold text-[10px]">22 Enrolled</span>
          </div>
          <div className="text-[10px] text-slate-300">Parabola & Conic Sections</div>
        </div>
      ),
    },
    {
      num: "04",
      title: "Receive Direct Escrow Payouts",
      desc: "Earnings from completed sessions and course purchases are deposited securely with transparent statements.",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      renderMock: () => (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Escrow Settlement</span>
            <span className="text-emerald-400 font-bold text-[10px]">Instant Transfer</span>
          </div>
          <div className="text-[10px] text-slate-300">₹24,500 Disbursed This Week</div>
        </div>
      ),
    },
  ];

  const faqs = [
    {
      q: "How does the 1-on-1 demo session work?",
      a: "Demo sessions are introductory trial slots created by verified tutors. You choose a time on the tutor's calendar, meet inside the built-in browser classroom, review your syllabus, and decide whether to book regular slots.",
    },
    {
      q: "Do I need to download Zoom or any third-party app?",
      a: "No. EduConnect features full WebRTC live streaming directly inside modern desktop and mobile browsers. Everything from video calls, whiteboard, chat, and notes operates on our platform.",
    },
    {
      q: "What happens if a teacher cancels or cannot make the class?",
      a: "All payments are held in automated platform escrow. If a scheduled live class is cancelled by the tutor, your payment is immediately refunded 100% to your account balance with zero cancellation fee.",
    },
    {
      q: "Can educators upload their own pre-recorded LMS courses?",
      a: "Yes! Verified educators can upload structured video modules, downloadable worksheets, and auto-graded quizzes to generate recurring course revenue.",
    },
  ];

  const currentSteps = activeTab === "STUDENT" ? studentSteps : teacherSteps;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-20 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Intuitive Educational Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            How Learning Flows on{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EduConnect
            </span>
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            A transparent, step-by-step walkthrough designed for academic success, whether you are a learner mastering subjects or an educator inspiring minds.
          </p>

          {/* Interactive Role Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <button
                onClick={() => setActiveTab("STUDENT")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "STUDENT"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Students & Parents
              </button>
              <button
                onClick={() => setActiveTab("TEACHER")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "TEACHER"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Verified Educators
              </button>
            </div>
          </div>
        </div>

        {/* Step Cards with Mock UI Graphics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentSteps.map((step) => {
            const Icon = step.icon;
            return (
              <GlassCard
                key={step.num}
                className="p-6 border-2 border-white/90 shadow-md flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${step.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300">{step.num}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {/* Mock UI Element */}
                <div className="pt-2">{step.renderMock()}</div>
              </GlassCard>
            );
          })}
        </div>

        {/* Reassurance & Security Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% Escrow Protection</h4>
              <p className="text-xs text-slate-500 mt-0.5">Tutors are paid only after classes are successfully conducted.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">No Sneaky Lock-Ins</h4>
              <p className="text-xs text-slate-500 mt-0.5">Pay per live slot or recorded course. Zero surprise subscriptions.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Zero App Installs</h4>
              <p className="text-xs text-slate-500 mt-0.5">Runs seamlessly on Chrome, Safari, and Firefox on any modern device.</p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Got Questions?</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs"
              >
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

        {/* CTA Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-black">Ready to experience connected learning?</h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-lg">
              Browse top educators and schedule your first 1-on-1 demo in under 2 minutes.
            </p>
          </div>
          <Link href="/find-teachers">
            <GlassButton variant="secondary" size="lg" className="bg-white text-blue-700 hover:bg-slate-50 shrink-0">
              Browse Verified Tutors
            </GlassButton>
          </Link>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}


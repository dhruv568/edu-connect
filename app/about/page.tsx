"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import {
  GraduationCap,
  ShieldCheck,
  Heart,
  Users,
  Sparkles,
  Award,
  BookOpen,
  Video,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  FileCheck,
  Headphones,
  Star,
} from "lucide-react";

export default function AboutPage() {
  const [themeMode, setThemeMode] = useState<"educator" | "main">(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const themeParam = params.get("theme") || params.get("site");
      if (themeParam === "educator" || themeParam === "educators" || themeParam === "teacher") {
        return "educator";
      }
      if (themeParam === "main" || themeParam === "default") {
        return "main";
      }
      if (
        hostname.startsWith("educators.") ||
        hostname.startsWith("educator.") ||
        hostname.startsWith("teachers.") ||
        hostname.startsWith("teacher.") ||
        hostname === "educators.educonnects.co.in"
      ) {
        return "educator";
      }
    }
    return "main";
  });

  useEffect(() => {
    const updateTheme = () => {
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const themeParam = params.get("theme") || params.get("site");

        if (themeParam === "educator" || themeParam === "educators" || themeParam === "teacher") {
          setThemeMode("educator");
        } else if (themeParam === "main" || themeParam === "default") {
          setThemeMode("main");
        } else if (
          hostname.startsWith("educators.") ||
          hostname.startsWith("educator.") ||
          hostname.startsWith("teachers.") ||
          hostname.startsWith("teacher.") ||
          hostname === "educators.educonnects.co.in"
        ) {
          setThemeMode("educator");
        } else {
          setThemeMode("main");
        }
      }
    };

    updateTheme();
    window.addEventListener("popstate", updateTheme);
    return () => window.removeEventListener("popstate", updateTheme);
  }, []);

  const isEducator = themeMode === "educator";

  const stats = [
    { label: "Active Students", value: "15,000+", sub: "Enrolled globally" },
    { label: "Verified Educators", value: "850+", sub: "Audit certified" },
    { label: "Live Class Hours", value: "45,000+", sub: "Seamless WebRTC" },
    { label: "Average Rating", value: "4.95 / 5.0", sub: "12,000+ reviews" },
  ];

  const verificationStages = [
    {
      num: "01",
      title: "Academic Audit",
      desc: "Every educator's university degrees, STEM certifications, and institutional background are verified.",
      icon: FileCheck,
      color: isEducator
        ? "text-[#16805B] bg-[#E6F7F0] border-[#A7F3D0]"
        : "text-[#0F5C5A] bg-[#E6F0EF] border-[#DCE5E4]",
    },
    {
      num: "02",
      title: "Pedagogy Screening",
      desc: "Educators conduct a live mock teaching session to evaluate conceptual clarity and student empathy.",
      icon: Video,
      color: isEducator
        ? "text-[#0D5C41] bg-[#E8F8F2] border-[#A7F3D0]"
        : "text-[#16706E] bg-[#EAF5F4] border-[#CDE5E3]",
    },
    {
      num: "03",
      title: "Hardware & AV Check",
      desc: "Instructors must pass high-definition audio, digital pen tablet, and fiber-connection tests.",
      icon: Headphones,
      color: isEducator
        ? "text-[#16805B] bg-[#E6F7F0] border-[#A7F3D0]"
        : "text-[#0F5C5A] bg-[#E6F0EF] border-[#DCE5E4]",
    },
    {
      num: "04",
      title: "Continuous Governance",
      desc: "Student ratings are monitored live, with escrow payouts held until session completion.",
      icon: ShieldCheck,
      color: isEducator
        ? "text-[#0D5C41] bg-slate-100 border-slate-200"
        : "text-[#083F3D] bg-slate-100 border-slate-200",
    },
  ];

  const facultySpotlight = [
    {
      name: "Dr. Rajeshwar Kulkarni",
      role: "Head of Physical Sciences",
      avatar: "/images/educators/male-2.png",
      subject: "Chemistry & Medical Prep",
      credential: "Ex-University Lecturer (19+ Yrs)",
      rating: "4.97",
      students: "1,400+ Mentored",
    },
    {
      name: "Sunita Natarajan, M.Sc.",
      role: "Lead STEM Instructor",
      avatar: "/images/educators/educator_02.jpg",
      subject: "Calculus & Olympiad Math",
      credential: "Senior STEM Coach (16+ Yrs)",
      rating: "4.94",
      students: "2,100+ Mentored",
    },
    {
      name: "Meenakshi Sundaram",
      role: "Computer Science Faculty",
      avatar: "/images/educators/educator_04.jpg",
      subject: "Algorithms & AI Foundations",
      credential: "Software Architect & Mentor (14+ Yrs)",
      rating: "4.93",
      students: "1,250+ Mentored",
    },
  ];

  return (
    <div
      data-theme={isEducator ? "educator" : "main"}
      className={`min-h-screen flex flex-col ${
        isEducator ? "bg-[#F0FAF5]/40" : "bg-[#F2FAF8]/40"
      } relative overflow-hidden font-sans transition-colors duration-200`}
    >
      {/* Background Decorative Ambient Blobs */}
      <div
        className={`liquid-blob-1 top-20 left-1/4 pointer-events-none ${
          isEducator ? "bg-[#16805B]/10" : "bg-[#0F5C5A]/10"
        }`}
      />
      <div
        className={`liquid-blob-2 top-1/2 right-10 pointer-events-none ${
          isEducator ? "bg-[#35A979]/10" : "bg-[#16706E]/10"
        }`}
      />

      <FloatingNavbar variant={isEducator ? "teacher" : "default"} />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-24 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs ${
              isEducator
                ? "bg-[#E6F7F0] border border-[#A7F3D0] text-[#0D5C41]"
                : "bg-[#E6F0EF] border border-[#DCE5E4] text-[#0F5C5A]"
            }`}
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${
                isEducator ? "text-[#16805B]" : "text-[#0F5C5A]"
              }`}
            />
            <span>The EduConnects Vision</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Connecting Education for{" "}
            <span
              className={
                isEducator
                  ? "bg-gradient-to-r from-[#16805B] via-[#0D5C41] to-[#16805B] bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-[#0F5C5A] via-[#16706E] to-[#083F3D] bg-clip-text text-transparent"
              }
            >
              Every Curious Learner
            </span>
          </h1>
          <p
            className={`text-base sm:text-lg ${
              isEducator ? "text-slate-700 font-normal" : "text-slate-600 font-normal"
            } leading-relaxed max-w-2xl mx-auto`}
          >
            EduConnects is built on the conviction that transparent flexible learning models, certified educators, and real-time interactive classrooms unlock academic excellence.
          </p>
        </div>

        {/* High-Impact Statistics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => (
            <GlassCard
              key={idx}
              className={`p-6 text-center space-y-1 border-2 bg-white/90 shadow-xs transition-all ${
                isEducator
                  ? "border-[#A7F3D0]/60 hover:border-[#16805B]/40"
                  : "border-[#DCE5E4]/80 hover:border-[#0F5C5A]/30"
              }`}
            >
              <div
                className={`text-3xl sm:text-4xl font-black ${
                  isEducator ? "text-[#16805B]" : "text-[#0F5C5A]"
                }`}
              >
                {s.value}
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {s.label}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{s.sub}</p>
            </GlassCard>
          ))}
        </div>

        {/* Visual Story Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Image Card with Floating Badges */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                alt="Interactive Mentorship Session"
                className="w-full h-[380px] sm:h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span
                  className={`text-xs font-extrabold uppercase tracking-wider ${
                    isEducator ? "text-emerald-400" : "text-teal-300"
                  }`}
                >
                  Interactive Pedagogy
                </span>
                <h4 className="text-lg font-bold">1-on-1 Mentorship That Actually Adapts</h4>
                <p className="text-xs text-slate-300">
                  Live whiteboard, real-time formula solving, and instant Q&A.
                </p>
              </div>
            </div>

            {/* Floating Trust Chip */}
            <div className="absolute -top-4 -right-4 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isEducator ? "bg-[#E6F7F0] text-[#16805B]" : "bg-[#E6F0EF] text-[#0F5C5A]"
                }`}
              >
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">100% Verified Tutors</div>
                <p className="text-[10px] text-slate-500">Zero Unvetted Profiles</p>
              </div>
            </div>
          </div>

          {/* Right: Core Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span
                className={`text-xs font-extrabold uppercase tracking-widest ${
                  isEducator ? "text-[#16805B]" : "text-[#0F5C5A]"
                }`}
              >
                Our Core Philosophy
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Why EduConnects Was Created
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Traditional tutoring platforms forced families into rigid, expensive annual subscriptions with little control over teaching quality. We built EduConnects around three transparent pillars:
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`flex items-start gap-4 p-4 rounded-2xl bg-white border ${
                  isEducator ? "border-[#A7F3D0]/60" : "border-[#DCE5E4]/80"
                } shadow-xs`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isEducator
                      ? "bg-[#E6F7F0] text-[#16805B]"
                      : "bg-[#E6F0EF] text-[#0F5C5A]"
                  }`}
                >
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">1. Flexibility Without Lock-In</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Choose 1-on-1 introductory demos, reserve individual live class slots, or purchase self-paced LMS courses with lifetime access.
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-4 p-4 rounded-2xl bg-white border ${
                  isEducator ? "border-[#A7F3D0]/60" : "border-[#DCE5E4]/80"
                } shadow-xs`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isEducator
                      ? "bg-[#E8F8F2] text-[#0D5C41]"
                      : "bg-[#EAF5F4] text-[#16706E]"
                  }`}
                >
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">2. Built-in WebRTC Classroom</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    No third-party app installations required. Enjoy built-in multi-party video, interactive shared whiteboard, and class chat directly in the browser.
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-4 p-4 rounded-2xl bg-white border ${
                  isEducator ? "border-[#A7F3D0]/60" : "border-[#DCE5E4]/80"
                } shadow-xs`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isEducator
                      ? "bg-[#E6F7F0] text-[#35A979]"
                      : "bg-[#E6F0EF] text-[#083F3D]"
                  }`}
                >
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">3. Transparent Academic Outcomes</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Track lesson milestones, complete auto-graded concept quizzes, and verify student attendance with automated reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stage Educator Verification Process (Infographic Grid) */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span
              className={`text-xs font-extrabold uppercase tracking-widest ${
                isEducator ? "text-[#16805B]" : "text-[#0F5C5A]"
              }`}
            >
              Quality Assurance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The 4-Stage Educator Verification Protocol
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Only the top 8% of applicants receive verified educator status on EduConnects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationStages.map((stage) => {
              const Icon = stage.icon;
              return (
                <GlassCard
                  key={stage.num}
                  className={`p-6 space-y-4 border-2 bg-white/90 shadow-xs flex flex-col justify-between transition-all ${
                    isEducator
                      ? "border-[#A7F3D0]/60 hover:border-[#16805B]/30"
                      : "border-[#DCE5E4]/80 hover:border-[#0F5C5A]/30"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${stage.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-black text-slate-300">{stage.num}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{stage.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{stage.desc}</p>
                  </div>
                  <div
                    className={`pt-2 flex items-center gap-1.5 text-[11px] font-bold ${
                      isEducator ? "text-[#16805B]" : "text-[#0F5C5A]"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${
                        isEducator ? "text-emerald-500" : "text-teal-600"
                      }`}
                    />
                    Audit Mandatory
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Faculty & Educator Spotlight */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span
              className={`text-xs font-extrabold uppercase tracking-widest ${
                isEducator ? "text-[#16805B]" : "text-[#0F5C5A]"
              }`}
            >
              Faculty Spotlight
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Meet Some of Our Verified Educators
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Passionate educators dedicated to student clarity, confidence, and exam success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facultySpotlight.map((f, idx) => (
              <GlassCard
                key={idx}
                className={`p-6 space-y-4 border-2 bg-white/90 shadow-xs transition-all ${
                  isEducator
                    ? "border-[#A7F3D0]/60 hover:border-[#16805B]/30"
                    : "border-[#DCE5E4]/80 hover:border-[#0F5C5A]/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={f.avatar}
                    alt={f.name}
                    className={`w-16 h-16 rounded-full object-cover ring-4 ${
                      isEducator ? "ring-[#16805B]/25" : "ring-[#0F5C5A]/25"
                    }`}
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{f.name}</h3>
                    <p
                      className={`text-xs font-semibold ${
                        isEducator ? "text-[#16805B]" : "text-[#0F5C5A]"
                      }`}
                    >
                      {f.subject}
                    </p>
                    <p className="text-[11px] text-slate-500">{f.credential}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> {f.rating} Rating
                  </span>
                  <span>{f.students}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div
          className={`p-8 sm:p-12 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl transition-all ${
            isEducator
              ? "bg-gradient-to-r from-[#0D5C41] via-[#16805B] to-[#0D5C41] border border-[#16805B]/40"
              : "bg-gradient-to-r from-[#083F3D] via-[#0F5C5A] to-[#083F3D] border border-[#1B6863]/40"
          }`}
        >
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">Ready to begin your learning journey?</h3>
            <p
              className={`text-sm max-w-lg ${
                isEducator ? "text-emerald-100" : "text-teal-100"
              }`}
            >
              Explore hundreds of verified tutors or book a trial demo session with zero commitment today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/find-teachers">
              <GlassButton
                variant="secondary"
                size="lg"
                className={`bg-white ${
                  isEducator
                    ? "text-[#0D5C41] hover:bg-emerald-50"
                    : "text-[#083F3D] hover:bg-teal-50"
                } font-bold shadow-md`}
              >
                Explore Teachers
              </GlassButton>
            </Link>
            <Link href="/register/teacher">
              <GlassButton
                variant="primary"
                size="lg"
                className="border border-white/40 text-white hover:bg-white/10 font-bold"
              >
                Apply to Teach
              </GlassButton>
            </Link>
          </div>
        </div>
      </main>

      <PremiumFooter variant={isEducator ? "teacher" : "default"} />
    </div>
  );
}


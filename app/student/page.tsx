"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { CourseCard } from "@/components/courses/course-card";
import { AuthModal } from "@/components/shared/auth-modal";
import {
  GraduationCap,
  BookOpen,
  Video,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Star,
  Users,
  ShieldCheck,
  Play,
  Award,
  ChevronDown,
  Layers,
  Zap,
  Target,
  FileText,
  CreditCard,
  Laptop,
  Check,
  MessageSquare,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { UserRole, UserSession } from "@/types/auth";

export default function StudentLandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [courseSearch, setCourseSearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Check auth status
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.user) {
          setUserSession(json.data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const queryParams = new URLSearchParams({ limit: "6" });
        if (activeCategory !== "ALL") {
          queryParams.set("subject", activeCategory);
        }
        if (courseSearch.trim()) {
          queryParams.set("search", courseSearch.trim());
        }
        const res = await fetch(`/api/courses?${queryParams.toString()}`);
        const json = await res.json();
        if (json.success && json.data?.courses) {
          setCourses(json.data.courses);
        }
      } catch (err) {
        console.error("Failed to load courses for student landing page:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [activeCategory, courseSearch]);

  const categories = [
    { label: "All Subjects", value: "ALL" },
    { label: "Mathematics", value: "Mathematics" },
    { label: "Physics", value: "Physics" },
    { label: "Chemistry", value: "Chemistry" },
    { label: "Computer Science", value: "Computer Science" },
    { label: "English", value: "English" },
  ];

  const studentBenefits = [
    {
      icon: ShieldCheck,
      title: "100% Verified Tutors",
      desc: "Every educator undergoes strict identity, degree, and background verification before teaching.",
      badge: "Quality Guaranteed",
      color: "blue",
    },
    {
      icon: Video,
      title: "Interactive Live Classes",
      desc: "Join real-time video classrooms with digital whiteboard, live chat, and instant teacher feedback.",
      badge: "Real-Time WebRTC",
      color: "emerald",
    },
    {
      icon: Play,
      title: "Recorded On-Demand LMS",
      desc: "Watch crystal-clear video lessons at your own pace with downloadable notes and milestone quizzes.",
      badge: "24/7 Access",
      color: "purple",
    },
    {
      icon: Target,
      title: "1-on-1 Trial Sessions",
      desc: "Book zero-commitment demo lessons with top tutors to find your ideal learning mentor.",
      badge: "Risk-Free Trial",
      color: "indigo",
    },
    {
      icon: Flame,
      title: "Progress & Streak Tracking",
      desc: "Visualize your learning hours, lesson completions, and study streaks in your personalized hub.",
      badge: "Stay Motivated",
      color: "amber",
    },
    {
      icon: Award,
      title: "Course Certificates",
      desc: "Earn verified course completion certificates upon completing lessons to showcase your achievements.",
      badge: "Accredited",
      color: "rose",
    },
  ];

  const testimonials = [
    {
      name: "Aarav Mehta",
      role: "Class 12 CBSE Aspirant",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      subject: "Calculus & Linear Algebra",
      quote:
        "The live whiteboard feature made complex calculus integrations click instantly. Having recorded video backup meant I could revise right before my exams!",
      achievement: "Scored 98% in Board Math",
    },
    {
      name: "Sneha Patel",
      role: "NEET Physics Learner",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      subject: "Electrostatics & Optics",
      quote:
        "Booking a 1-on-1 demo gave me the confidence to choose my tutor without committing upfront. My physics problem-solving speed improved tremendously.",
      achievement: "NEET Physics: 168/180",
    },
    {
      name: "Rohan Verma",
      role: "Python & Data Science Learner",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      subject: "Python Programming & AI",
      quote:
        "The self-paced video modules accompanied by live weekend doubt-clearing sessions are the perfect hybrid format. Everything just works in the browser.",
      achievement: "Built 4 Portfolio Projects",
    },
  ];

  const faqs = [
    {
      question: "How do I enroll in a course on EduConnects?",
      answer:
        "You can explore our course catalog, filter by subject or difficulty level, view the curriculum overview and preview lessons, and click 'Enroll Now'. Payments are securely handled via Razorpay UPI, Netbanking, or Debit/Credit Cards.",
    },
    {
      question: "How do live interactive classes work?",
      answer:
        "Live classes take place directly inside your web browser using high-speed WebRTC video powered by LiveKit. You get a built-in shared digital whiteboard, live chat, screen sharing, and the ability to ask questions directly to your teacher in real time.",
    },
    {
      question: "Can I watch recorded lessons and revisit past classes?",
      answer:
        "Yes! Self-paced courses include lifetime on-demand access to all video lessons and downloadable study resources. You can pause, speed up, or resume wherever you left off on both desktop and mobile.",
    },
    {
      question: "How do I find and book the right teacher?",
      answer:
        "Visit the 'Find Teachers' section to browse verified educator profiles, review their teaching experience, subjects, hourly rates, and verified credentials. You can schedule 1-on-1 trial demo slots or group sessions based on your availability.",
    },
    {
      question: "How does progress tracking work?",
      answer:
        "Your Student Dashboard automatically tracks your completed lessons, upcoming live classes, study hours, and daily learning streak so you always know what to study next.",
    },
    {
      question: "What if I need help or have payment issues?",
      answer:
        "EduConnects provides 24/7 student support and transparent escrow payment protection. If a scheduled live class is cancelled by a teacher, automated refund processing ensures your funds are protected.",
    },
  ];

  const handleOpenAuth = () => {
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans text-slate-900">
      {/* 1. Student-Oriented Role Navbar */}
      <FloatingNavbar variant="student" />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative pt-32 sm:pt-36 lg:pt-44 pb-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-white">
          {/* Subtle Background Elements */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10">
            <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Hero Left Column: Copy & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                  <span>The Learning Platform for Ambitious Students</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Learn from the <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">right teacher.</span> <br />
                  Build the skills for your future.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Connect with verified top-tier educators, join interactive live video classrooms with real-time digital whiteboards, and master structured self-paced courses.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  {userSession?.role === "STUDENT" ? (
                    <Link href="/student/dashboard" className="w-full sm:w-auto">
                      <GlassButton
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto shadow-xl shadow-blue-500/25 text-sm"
                        leftIcon={<LayoutDashboard className="h-4 w-4" />}
                      >
                        Go to Student Dashboard
                      </GlassButton>
                    </Link>
                  ) : (
                    <Link href="/student/register" className="w-full sm:w-auto">
                      <GlassButton
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto shadow-xl shadow-blue-500/25 text-sm"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Start Learning
                      </GlassButton>
                    </Link>
                  )}

                  <Link href="#courses" className="w-full sm:w-auto">
                    <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto text-sm" leftIcon={<BookOpen className="h-4 w-4 text-slate-600" />}>
                      Browse Courses
                    </GlassButton>
                  </Link>
                </div>

                {/* Trust Statistics Strip */}
                <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
                  <div>
                    <div className="text-2xl lg:text-3xl font-black text-slate-900">15,000+</div>
                    <div className="text-xs text-slate-500 font-medium">Active Students</div>
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-black text-blue-600">850+</div>
                    <div className="text-xs text-slate-500 font-medium">Verified Tutors</div>
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-black text-emerald-600">4.95 ★</div>
                    <div className="text-xs text-slate-500 font-medium">Learner Rating</div>
                  </div>
                </div>
              </div>

              {/* Hero Right Column: Interactive Visual Showcase Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Floating Live Classroom Glass Preview */}
                  <GlassCard
                    glowColor="rgba(37, 99, 235, 0.2)"
                    className="p-6 border-2 border-white shadow-2xl space-y-5 rounded-3xl bg-white/90 backdrop-blur-xl"
                  >
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Live Interactive Classroom
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        HD 1080p WebRTC
                      </span>
                    </div>

                    {/* Classroom Simulation Video Stage */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner group">
                      <img
                        src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80"
                        alt="Teacher conducting live session"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                      {/* Floating In-Class Overlay Elements */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white text-[11px] font-semibold">
                        <Video className="w-3 h-3 text-emerald-400" />
                        <span>Prof. Rajesh Sharma</span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-semibold text-[11px]">Calculus & Advanced Vectors</span>
                        </div>
                        <span className="text-[10px] bg-blue-600/90 px-2 py-0.5 rounded font-mono font-bold">
                          45:20
                        </span>
                      </div>
                    </div>

                    {/* Student Dashboard Widget Preview */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Daily Streak</div>
                          <div className="text-xs font-black text-slate-900">7 Days Active 🔥</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Course Lessons</div>
                          <div className="text-xs font-black text-slate-900">84% Completed</div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Floating Trust Chip Badge */}
                  <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-3 hidden sm:flex">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-extrabold text-slate-900">Zero Hidden Fees</div>
                      <div className="text-[10px] text-slate-500 font-medium">Pay only for what you learn</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. WHY EDUCONNECTS FOR STUDENTS */}
        {/* ========================================================================= */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <GlassBadge variant="blue">DESIGNED FOR MAXIMUM STUDENT SUCCESS</GlassBadge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Everything You Need to Master Any Subject
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Whether you need 1-on-1 personalized guidance, group exam prep, or self-paced video lessons, EduConnects gives you the complete learning stack.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studentBenefits.map((b, idx) => {
                const IconComp = b.icon;
                return (
                  <GlassCard
                    key={idx}
                    className="p-7 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3.5 rounded-2xl bg-blue-100 text-blue-600 w-fit">
                          <IconComp className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700">
                          {b.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{b.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. COURSE DISCOVERY (REAL BACKEND DATA) */}
        {/* ========================================================================= */}
        <section id="courses" className="py-20 lg:py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <GlassBadge variant="emerald">REAL-TIME COURSE CATALOG</GlassBadge>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Explore Verified Courses
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Discover structured curriculums created and taught by certified educators.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/courses">
                  <GlassButton variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    View All Courses ({courses.length}+)
                  </GlassButton>
                </Link>
              </div>
            </div>

            {/* Subject Tabs Filter */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat.value
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            {loadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-80 rounded-3xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <GlassCard className="p-12 text-center rounded-3xl space-y-4 border border-dashed border-slate-300">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-black text-slate-800">No Courses Found in this Category</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try switching subject categories or explore our tutor roster to book a customized live learning session.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveCategory("ALL")}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Reset Filter
                  </button>
                  <Link href="/find-teachers">
                    <button className="px-4 py-2 bg-white text-slate-800 border border-slate-200 text-xs font-bold rounded-xl">
                      Find Live Tutors
                    </button>
                  </Link>
                </div>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    slug={course.slug}
                    description={course.description}
                    subject={course.subject}
                    level={course.level}
                    price={course.price}
                    rating={course.rating || 5.0}
                    reviewCount={course.reviewCount || 12}
                    lessonCount={course.lessonCount || 8}
                    durationHours={course.durationHours || 4.5}
                    thumbnailUrl={course.thumbnailUrl}
                    teacher={{
                      id: course.teacher?.id || "t1",
                      name: course.teacher?.name || "Verified Educator",
                      avatarUrl: course.teacher?.avatarUrl,
                      isVerified: true,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LIVE LEARNING DEEP DIVE */}
        {/* ========================================================================= */}
        <section id="live-classes" className="py-20 lg:py-28 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Visual Mock of WebRTC Classroom */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-slate-950">
                  <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-mono font-bold text-slate-400 ml-2">
                        LiveKit Classroom Room #LK-9402
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      LIVE REC
                    </span>
                  </div>

                  <div className="p-5 space-y-4 text-white">
                    {/* Simulated Whiteboard Drawing Canvas */}
                    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-800 pb-2">
                        <span>Interactive Shared Whiteboard</span>
                        <span>Pen Tool Active ✏️</span>
                      </div>
                      <div className="h-36 flex flex-col justify-center items-center text-center space-y-2 font-mono text-emerald-400 text-sm">
                        <div>f'(x) = lim(h→0) [f(x+h) - f(x)] / h</div>
                        <div className="text-xs text-blue-300">d/dx [sin(x)] = cos(x)</div>
                        <div className="text-[11px] text-amber-300">Teacher has granted drawing permissions</div>
                      </div>
                    </div>

                    {/* Chat Bubble simulation */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-3 text-xs">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        P
                      </div>
                      <div>
                        <span className="font-bold text-slate-300">Priya (Student):</span>
                        <span className="text-slate-400 ml-2">"Understood! Can we solve question 4 from the problem set next?"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Features Explanation */}
              <div className="lg:col-span-6 space-y-6">
                <GlassBadge variant="indigo">BUILT-IN VIRTUAL CLASSROOM</GlassBadge>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  High-Definition Live Learning Without External Apps
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Forget switching between Zoom links, chat apps, and email chains. EduConnects gives you a complete, secure browser classroom built right in.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-600 mt-1 shrink-0">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Zero Software Downloads</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Runs seamlessly in Chrome, Safari, Firefox, and Edge on laptop or mobile.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 mt-1 shrink-0">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Digital Whiteboard & Annotation</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Collaborate directly on formulas, diagrams, and equations in real time.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-600 mt-1 shrink-0">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">In-Class Instant File Sharing</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Receive assignment sheets, PDF solution keys, and notes instantly during class.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/find-teachers">
                    <GlassButton variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Find a Live Tutor Now
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. STUDENT TESTIMONIALS */}
        {/* ========================================================================= */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <GlassBadge variant="blue">VERIFIED LEARNING OUTCOMES</GlassBadge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Trusted by Top Performing Students
              </h2>
              <p className="text-sm text-slate-600">
                Read how EduConnects learners achieved their target grades and examination scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <GlassCard
                  key={idx}
                  className="p-7 rounded-3xl border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold w-fit">
                      🎯 {t.achievement}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center gap-3 mt-4">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/20"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.role}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">{t.subject}</div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. STUDENT FAQ ACCORDION */}
        {/* ========================================================================= */}
        <section id="faq" className="py-20 lg:py-28 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <GlassBadge variant="indigo">STUDENT FAQ</GlassBadge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-600">
                Got questions about how learning on EduConnects works? We have answers.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FINAL CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="py-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-bold uppercase tracking-wider border border-white/20">
              Start Today with Zero Risk
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Start Your Learning Journey
            </h2>

            <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto font-medium">
              Join 15,000+ students mastering difficult subjects, passing entrance exams, and building skills with verified mentors.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/student/register" className="w-full sm:w-auto">
                <GlassButton
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-black shadow-xl"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Join as a Student
                </GlassButton>
              </Link>

              <Link href="/find-teachers" className="w-full sm:w-auto">
                <GlassButton
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto text-white border border-white/30 hover:bg-white/10"
                >
                  Explore Verified Teachers
                </GlassButton>
              </Link>
            </div>

            <div className="pt-6 flex items-center justify-center gap-6 text-xs text-blue-200">
              <span>✓ Free student registration</span>
              <span>•</span>
              <span>✓ Instant access to demo sessions</span>
              <span>•</span>
              <span>✓ Encrypted classrooms</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PremiumFooter />

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole="STUDENT"
      />
    </div>
  );
}


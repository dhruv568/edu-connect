"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  LogIn,
  UserPlus,
  Menu,
  X,
  Search,
  ChevronDown,
  Target,
  Video,
  Play,
  LogOut,
  User,
  LayoutDashboard,
  MailCheck,
  Sparkles,
  BookOpen,
  DollarSign,
  HelpCircle,
  Award,
} from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";
import { AuthModal } from "@/components/shared/auth-modal";
import { GlobalSearchModal } from "@/components/discovery/global-search-modal";
import { UserRole, UserSession } from "@/types/auth";

export interface FloatingNavbarProps {
  variant?: "default" | "student" | "teacher";
}

export function FloatingNavbar({ variant }: FloatingNavbarProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");

  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Determine effective variant
  const effectiveVariant =
    variant ||
    (pathname === "/student" ||
    (pathname.startsWith("/student/") && !pathname.startsWith("/student/dashboard"))
      ? "student"
      : pathname === "/teacher" ||
        (pathname.startsWith("/teacher/") && !pathname.startsWith("/teacher/dashboard"))
      ? "teacher"
      : "default");

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.data?.user) {
          setUserSession(json.data.user);
          return;
        }
      }
      setUserSession(null);
    } catch {
      setUserSession(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuth = (mode: "register" | "login", role?: UserRole) => {
    setAuthMode(mode);
    if (role) setSelectedRole(role);
    setAuthModalOpen(true);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUserSession(null);
      setMobileOpen(false);
    } catch {
      setUserSession(null);
    }
  };

  const getDashboardPath = (session: UserSession) => {
    if (session.role === "TEACHER") return "/teacher/dashboard";
    if (session.role === "ADMIN") return "/admin/dashboard";
    return "/student/dashboard";
  };

  const getDashboardLabel = (session: UserSession) => {
    if (session.role === "TEACHER") return "Teacher Dashboard";
    if (session.role === "ADMIN") return "Admin Dashboard";
    return "Student Dashboard";
  };

  return (
    <>
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 lg:px-12 pointer-events-none flex items-center justify-between">
        {/* SEPARATE LOGO IN TOP LEFT CORNER */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-auto shrink-0"
        >
          <Link
            href={effectiveVariant === "student" ? "/student" : effectiveVariant === "teacher" ? "/teacher" : "/"}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl glass-surface border border-white/80 shadow-lg group transition-transform hover:scale-105"
          >
            <div
              className={`p-1.5 sm:p-2 rounded-xl text-white shadow-md ${
                effectiveVariant === "teacher"
                  ? "bg-gradient-to-tr from-indigo-600 to-purple-600"
                  : effectiveVariant === "student"
                  ? "bg-gradient-to-tr from-blue-600 to-emerald-600"
                  : "bg-gradient-to-tr from-blue-600 to-indigo-600"
              }`}
            >
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight whitespace-nowrap leading-none">
                EDU<span className={effectiveVariant === "teacher" ? "text-indigo-600" : "text-blue-600"}>CONNECTS</span>
              </span>
              {effectiveVariant === "student" && (
                <span className="text-[9px] font-extrabold text-emerald-600 tracking-wider uppercase">
                  For Students
                </span>
              )}
              {effectiveVariant === "teacher" && (
                <span className="text-[9px] font-extrabold text-indigo-600 tracking-wider uppercase">
                  For Educators
                </span>
              )}
            </div>
          </Link>
        </motion.div>

        {/* CENTER FLOATING GLASS NAVIGATION PILL (DESKTOP) */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pointer-events-auto hidden lg:flex items-center gap-6 px-6 py-2.5 rounded-full glass-pill border border-white/90 shadow-xl transition-all duration-300"
        >
          {effectiveVariant === "student" ? (
            /* Student-Specific Navigation Links */
            <nav className="flex items-center gap-6 text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              <Link href="/courses" className="hover:text-blue-600 transition-colors">
                Courses
              </Link>
              <Link href="/find-teachers" className="hover:text-blue-600 transition-colors">
                Teachers
              </Link>
              <Link href="/student#live-classes" className="hover:text-blue-600 transition-colors">
                Live Classes
              </Link>
              <Link href="/student#benefits" className="hover:text-blue-600 transition-colors">
                Benefits
              </Link>
              <Link href="/student#faq" className="hover:text-blue-600 transition-colors">
                FAQ
              </Link>
              <Link href="/teacher" className="text-slate-400 hover:text-indigo-600 text-[11px] font-semibold transition-colors pl-2 border-l border-slate-200">
                Teach on EduConnects →
              </Link>
            </nav>
          ) : effectiveVariant === "teacher" ? (
            /* Teacher-Specific Navigation Links */
            <nav className="flex items-center gap-6 text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              <Link href="/teacher#how-it-works" className="hover:text-indigo-600 transition-colors">
                How It Works
              </Link>
              <Link href="/teacher#courses" className="hover:text-indigo-600 transition-colors">
                Create Courses
              </Link>
              <Link href="/teacher#live-classes" className="hover:text-indigo-600 transition-colors">
                Live Classes
              </Link>
              <Link href="/teacher#earnings" className="hover:text-indigo-600 transition-colors">
                Earnings
              </Link>
              <Link href="/teacher#benefits" className="hover:text-indigo-600 transition-colors">
                Benefits
              </Link>
              <Link href="/teacher#faq" className="hover:text-indigo-600 transition-colors">
                FAQ
              </Link>
              <Link href="/student" className="text-slate-400 hover:text-blue-600 text-[11px] font-semibold transition-colors pl-2 border-l border-slate-200">
                Student Portal →
              </Link>
            </nav>
          ) : (
            /* Default Global Homepage Navigation Links */
            <nav className="flex items-center gap-6 text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/services" className="hover:text-blue-600 transition-colors">
                Services
              </Link>
              <Link href="/courses" className="hover:text-blue-600 transition-colors">
                Courses
              </Link>
              <Link href="/find-teachers" className="hover:text-blue-600 transition-colors">
                Find Tutors
              </Link>
              <Link href="/pricing" className="hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>
          )}
        </motion.div>

        {/* RIGHT ACTIONS */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-auto flex items-center gap-2 sm:gap-3 shrink-0"
        >
          {/* Mobile/Tablet: compact icon-only search button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="lg:hidden p-2 sm:p-2.5 rounded-2xl bg-white/95 border border-slate-200/90 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm flex items-center justify-center"
            aria-label="Open Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Large Desktop: expanded search bar */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden lg:flex w-48 xl:w-60 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200/90 text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:shadow-md transition-all text-xs font-semibold items-center justify-between shadow-sm group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 shrink-0 transition-colors" />
              <span className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors truncate">
                {effectiveVariant === "teacher"
                  ? "Search teaching guides..."
                  : effectiveVariant === "student"
                  ? "Search courses & tutors..."
                  : "Search tutors, courses..."}
              </span>
            </div>
            <kbd className="hidden xl:inline-block bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-mono font-bold border border-slate-200/90 shadow-2xs shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Desktop Auth Buttons based on session state and variant */}
          <div className="hidden lg:flex items-center gap-2">
            {!userSession ? (
              effectiveVariant === "teacher" ? (
                <>
                  <Link href="/teacher/login">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      leftIcon={<LogIn className="h-3.5 w-3.5 text-slate-600" />}
                    >
                      Teacher Login
                    </GlassButton>
                  </Link>
                  <Link href="/teacher/register">
                    <GlassButton
                      variant="primary"
                      size="sm"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                    >
                      Start Teaching
                    </GlassButton>
                  </Link>
                </>
              ) : effectiveVariant === "student" ? (
                <>
                  <Link href="/student/login">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      leftIcon={<LogIn className="h-3.5 w-3.5 text-slate-600" />}
                    >
                      Student Login
                    </GlassButton>
                  </Link>
                  <Link href="/student/register">
                    <GlassButton
                      variant="primary"
                      size="sm"
                      leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                    >
                      Start Learning
                    </GlassButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      leftIcon={<LogIn className="h-3.5 w-3.5 text-slate-600" />}
                    >
                      Login
                    </GlassButton>
                  </Link>
                  <Link href="/register">
                    <GlassButton
                      variant="primary"
                      size="sm"
                      leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                    >
                      Get Started
                    </GlassButton>
                  </Link>
                </>
              )
            ) : !userSession.emailVerified ? (
              <>
                <Link href={`/verify-email?email=${encodeURIComponent(userSession.email)}`}>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    leftIcon={<MailCheck className="h-3.5 w-3.5" />}
                  >
                    Verify Email
                  </GlassButton>
                </Link>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-3.5 w-3.5 text-slate-600" />}
                >
                  Logout
                </GlassButton>
              </>
            ) : (
              <>
                <Link href={getDashboardPath(userSession)}>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    leftIcon={<LayoutDashboard className="h-3.5 w-3.5" />}
                  >
                    {getDashboardLabel(userSession)}
                  </GlassButton>
                </Link>
                <Link href="/profile">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    leftIcon={<User className="h-3.5 w-3.5" />}
                  >
                    Profile
                  </GlassButton>
                </Link>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-3.5 w-3.5 text-slate-600" />}
                >
                  Logout
                </GlassButton>
              </>
            )}
          </div>

          {/* Mobile / Tablet Hamburger Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 sm:p-2.5 rounded-2xl glass-surface border border-white/80 text-slate-800 hover:bg-slate-100 shadow-sm flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </motion.div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-16 sm:top-20 left-3 right-3 sm:left-6 sm:right-6 z-40 p-5 sm:p-6 glass-surface rounded-3xl shadow-2xl lg:hidden space-y-4 text-center pointer-events-auto border border-white/90 max-h-[calc(100vh-5.5rem)] overflow-y-auto"
          >
            {/* Quick Search Tap Button inside Mobile Menu */}
            <button
              onClick={() => {
                setMobileOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white text-slate-700 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700 font-semibold truncate">
                  {effectiveVariant === "teacher"
                    ? "Search teaching resources..."
                    : effectiveVariant === "student"
                    ? "Search courses & tutors..."
                    : "Search tutors, courses..."}
                </span>
              </div>
              <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded-md text-blue-600 font-bold border border-blue-100 shrink-0">
                Search
              </span>
            </button>

            {effectiveVariant === "student" ? (
              <nav className="flex flex-col gap-2.5 font-bold text-slate-800 text-sm pt-1">
                <Link href="/courses" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Browse Courses
                </Link>
                <Link href="/find-teachers" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Find Verified Teachers
                </Link>
                <Link href="/student#live-classes" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Live Classroom Learning
                </Link>
                <Link href="/student#benefits" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Student Benefits
                </Link>
                <Link href="/student#faq" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Student FAQ
                </Link>
                <Link href="/teacher" onClick={() => setMobileOpen(false)} className="py-2 text-left px-2 text-indigo-600 font-bold text-xs">
                  Switch to Teacher Portal →
                </Link>
              </nav>
            ) : effectiveVariant === "teacher" ? (
              <nav className="flex flex-col gap-2.5 font-bold text-slate-800 text-sm pt-1">
                <Link href="/teacher#how-it-works" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  How Teaching Works
                </Link>
                <Link href="/teacher#courses" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Create & Upload Courses
                </Link>
                <Link href="/teacher#live-classes" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Schedule Live Classes
                </Link>
                <Link href="/teacher#earnings" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Earnings & Payouts
                </Link>
                <Link href="/teacher#benefits" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Educator Benefits
                </Link>
                <Link href="/teacher#faq" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Teacher FAQ
                </Link>
                <Link href="/student" onClick={() => setMobileOpen(false)} className="py-2 text-left px-2 text-blue-600 font-bold text-xs">
                  Switch to Student Portal →
                </Link>
              </nav>
            ) : (
              <nav className="flex flex-col gap-2.5 font-bold text-slate-800 text-sm pt-1">
                <Link href="/" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Home
                </Link>
                <Link href="/services" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2 text-blue-600">
                  Products & Services
                </Link>
                <Link href="/courses" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Courses
                </Link>
                <Link href="/find-teachers" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Find Tutors
                </Link>
                <Link href="/pricing" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Pricing
                </Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100 text-left px-2">
                  Contact Us
                </Link>
              </nav>
            )}

            <div className="pt-2 flex flex-col gap-2">
              {!userSession ? (
                effectiveVariant === "teacher" ? (
                  <>
                    <Link href="/teacher/login" onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="secondary" className="w-full justify-center">
                        Teacher Login
                      </GlassButton>
                    </Link>
                    <Link href="/teacher/register" onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="primary" className="w-full justify-center bg-indigo-600 hover:bg-indigo-700">
                        Become a Teacher
                      </GlassButton>
                    </Link>
                  </>
                ) : effectiveVariant === "student" ? (
                  <>
                    <Link href="/student/login" onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="secondary" className="w-full justify-center">
                        Student Login
                      </GlassButton>
                    </Link>
                    <Link href="/student/register" onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="primary" className="w-full justify-center">
                        Start Learning
                      </GlassButton>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="secondary" className="w-full justify-center">
                        Login
                      </GlassButton>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="primary" className="w-full justify-center">
                        Get Started
                      </GlassButton>
                    </Link>
                  </>
                )
              ) : !userSession.emailVerified ? (
                <>
                  <Link href={`/verify-email?email=${encodeURIComponent(userSession.email)}`} onClick={() => setMobileOpen(false)}>
                    <GlassButton variant="primary" className="w-full justify-center">
                      Verify Email
                    </GlassButton>
                  </Link>
                  <GlassButton variant="secondary" className="w-full justify-center" onClick={handleLogout}>
                    Logout
                  </GlassButton>
                </>
              ) : (
                <>
                  <Link href={getDashboardPath(userSession)} onClick={() => setMobileOpen(false)}>
                    <GlassButton variant="primary" className="w-full justify-center">
                      {getDashboardLabel(userSession)}
                    </GlassButton>
                  </Link>
                  <Link href="/profile" onClick={() => setMobileOpen(false)}>
                    <GlassButton variant="secondary" className="w-full justify-center">
                      Profile
                    </GlassButton>
                  </Link>
                  <GlassButton variant="ghost" className="w-full justify-center" onClick={handleLogout}>
                    Logout
                  </GlassButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          checkAuthStatus();
        }}
        initialMode={authMode}
        initialRole={selectedRole}
      />
    </>
  );
}

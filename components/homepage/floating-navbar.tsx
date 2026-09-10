"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  User,
  LayoutDashboard,
  Users,
  BookOpen,
  Grid,
} from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";
import { UserSession } from "@/types/auth";
import { getMainDomain, getLiveDomain } from "@/lib/app-url";

export interface FloatingNavbarProps {
  variant?: "default" | "student" | "teacher";
}

export function FloatingNavbar({ variant }: FloatingNavbarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown & mobile menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExploreDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExploreDropdownOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUserSession(null);
      setMobileOpen(false);
    } catch {
      setUserSession(null);
    }
  };

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    setMobileOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("how-it-works");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#how-it-works");
    }
  };

  const getDashboardPath = (session: UserSession) => {
    if (session.role === "TEACHER") return "/teacher/dashboard";
    if (session.role === "ADMIN") return "/admin/dashboard";
    return "/student/dashboard";
  };

  const getDashboardLabel = (session: UserSession) => {
    if (session.role === "TEACHER") return "Educator Portal";
    if (session.role === "ADMIN") return "Admin Dashboard";
    return "Student Dashboard";
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#DCE5E4] shadow-sm py-3"
            : "bg-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={getMainDomain() + "/"}
            className="flex items-center gap-2.5 group shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#0B4F4B] text-[#F2C14E] shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-[#102A2A] tracking-tight leading-none">
                EDU<span className="text-[#0B4F4B]">CONNECTS</span>
              </span>
              <span className="text-[10px] font-semibold text-[#5D7373] tracking-wide">
                Learn • Grow • Belong
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#102A2A]">
            {/* Explore Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                onMouseEnter={() => setExploreDropdownOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#0B4F4B] transition-colors py-2 focus:outline-none"
                aria-expanded={exploreDropdownOpen}
              >
                <span>Explore</span>
                <ChevronDown
                  className={`h-4 w-4 text-[#5D7373] transition-transform duration-200 ${
                    exploreDropdownOpen ? "rotate-180 text-[#0B4F4B]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {exploreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onMouseLeave={() => setExploreDropdownOpen(false)}
                    className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl border border-[#DCE5E4] shadow-xl p-3 space-y-1 z-50"
                  >
                    <Link
                      href="/find-teachers"
                      onClick={() => setExploreDropdownOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-[#E6F0EF] text-[#0B4F4B] group-hover:bg-[#0B4F4B] group-hover:text-white transition-colors shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#102A2A] group-hover:text-[#0B4F4B] transition-colors">
                          Find an Educator
                        </div>
                        <div className="text-[11px] text-[#5D7373] font-normal leading-tight mt-0.5">
                          Find educators based on subject, level and learning mode.
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/courses"
                      onClick={() => setExploreDropdownOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-[#FBF7EE] text-[#B8860B] group-hover:bg-[#F2C14E] group-hover:text-[#102A2A] transition-colors shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#102A2A] group-hover:text-[#0B4F4B] transition-colors">
                          Explore Courses
                        </div>
                        <div className="text-[11px] text-[#5D7373] font-normal leading-tight mt-0.5">
                          Browse available courses.
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/courses"
                      onClick={() => setExploreDropdownOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-[#F5F7F8] text-[#5D7373] group-hover:bg-[#1B6863] group-hover:text-white transition-colors shrink-0">
                        <Grid className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#102A2A] group-hover:text-[#0B4F4B] transition-colors">
                          Browse Subjects
                        </div>
                        <div className="text-[11px] text-[#5D7373] font-normal leading-tight mt-0.5">
                          Explore learning categories and subjects.
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* How It Works Link */}
            <a
              href="#how-it-works"
              onClick={handleHowItWorksClick}
              className="hover:text-[#0B4F4B] transition-colors py-2 cursor-pointer"
            >
              How It Works
            </a>

            {/* Live Link */}
            <a
              href={getLiveDomain()}
              className="flex items-center gap-1.5 hover:text-[#0B4F4B] transition-colors py-2 group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="font-bold text-red-600 group-hover:text-red-700">🔴 Live</span>
            </a>

            {/* Become an Educator Link */}
            <Link
              href="/teacher"
              className="hover:text-[#0B4F4B] transition-colors py-2 text-[#1B6863] font-bold"
            >
              Become an Educator
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {!userSession ? (
              <>
                <Link href="/login">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    className="text-[#102A2A] hover:text-[#0B4F4B]"
                    leftIcon={<LogIn className="h-4 w-4 text-[#5D7373]" />}
                  >
                    Login
                  </GlassButton>
                </Link>
                <Link href="/register">
                  <GlassButton
                    variant="primary"
                    size="sm"
                    className="bg-[#0B4F4B] hover:bg-[#073F3C] text-white rounded-full px-5 font-bold shadow-md"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                  >
                    Get Started
                  </GlassButton>
                </Link>
              </>
            ) : (
              <>
                <Link href={getDashboardPath(userSession)}>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    className="bg-[#0B4F4B] hover:bg-[#073F3C] text-white rounded-full px-4"
                    leftIcon={<LayoutDashboard className="h-4 w-4" />}
                  >
                    {getDashboardLabel(userSession)}
                  </GlassButton>
                </Link>
                <Link href="/profile">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    leftIcon={<User className="h-4 w-4" />}
                  >
                    Profile
                  </GlassButton>
                </Link>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-4 w-4 text-[#5D7373]" />}
                >
                  Logout
                </GlassButton>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#F5F7F8] border border-[#DCE5E4] text-[#102A2A] hover:bg-[#DCE5E4] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden overflow-hidden" ref={mobileMenuRef}>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative top-16 mx-3 sm:mx-6 bg-white rounded-3xl border border-[#DCE5E4] shadow-2xl p-6 space-y-5 max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              {/* Navigation Links */}
              <nav className="flex flex-col space-y-3 font-semibold text-[#102A2A] text-sm">
                <div className="pb-2 border-b border-[#DCE5E4] space-y-2">
                  <div className="text-xs font-black uppercase text-[#5D7373] tracking-wider px-2">
                    Explore
                  </div>
                  <Link
                    href="/find-teachers"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F5F7F8] text-[#102A2A] font-bold"
                  >
                    <Users className="h-4 w-4 text-[#0B4F4B]" />
                    Find an Educator
                  </Link>
                  <Link
                    href="/courses"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F5F7F8] text-[#102A2A] font-bold"
                  >
                    <BookOpen className="h-4 w-4 text-[#B8860B]" />
                    Explore Courses
                  </Link>
                  <Link
                    href="/courses"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F5F7F8] text-[#102A2A] font-bold"
                  >
                    <Grid className="h-4 w-4 text-[#5D7373]" />
                    Browse Subjects
                  </Link>
                </div>

                <a
                  href="#how-it-works"
                  onClick={handleHowItWorksClick}
                  className="py-2 px-2 hover:bg-[#F5F7F8] rounded-xl border-b border-[#DCE5E4]"
                >
                  How It Works
                </a>

                <a
                  href={getLiveDomain()}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 px-2 hover:bg-[#F5F7F8] rounded-xl border-b border-[#DCE5E4] flex items-center justify-between"
                >
                  <span>Live Events</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    🔴 Live
                  </span>
                </a>

                <Link
                  href="/teacher"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 px-2 hover:bg-[#F5F7F8] rounded-xl text-[#0B4F4B] font-bold"
                >
                  Become an Educator
                </Link>
              </nav>

              {/* Mobile Auth CTAs */}
              <div className="pt-2 border-t border-[#DCE5E4] flex flex-col gap-2.5">
                {!userSession ? (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="secondary" className="w-full justify-center text-sm font-bold">
                        Login
                      </GlassButton>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <GlassButton
                        variant="primary"
                        className="w-full justify-center bg-[#0B4F4B] hover:bg-[#073F3C] text-white text-sm font-bold"
                      >
                        Get Started
                      </GlassButton>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={getDashboardPath(userSession)} onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="primary" className="w-full justify-center bg-[#0B4F4B] text-white text-sm">
                        {getDashboardLabel(userSession)}
                      </GlassButton>
                    </Link>
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <GlassButton variant="secondary" className="w-full justify-center text-sm">
                        Profile
                      </GlassButton>
                    </Link>
                    <GlassButton
                      variant="ghost"
                      className="w-full justify-center text-sm text-[#5D7373]"
                      onClick={handleLogout}
                    >
                      Logout
                    </GlassButton>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

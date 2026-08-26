"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Menu, X, LogIn, UserPlus, LogOut, User, LayoutDashboard, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/shared/auth-modal";
import { UserSession } from "@/types/auth";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  const [userSession, setUserSession] = useState<UserSession | null>(null);

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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuth = (mode: "register" | "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUserSession(null);
      setMobileMenuOpen(false);
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
    return "Dashboard";
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              EDU<span className="text-blue-600">CONNECT</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/courses" className="hover:text-blue-600 transition-colors">
              Courses
            </Link>
            <Link href="/find-teachers" className="hover:text-blue-600 transition-colors">
              Find Teachers
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Action Buttons based on session state */}
          <div className="hidden md:flex items-center gap-3">
            {!userSession ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuth("login")}
                  leftIcon={<LogIn className="h-4 w-4" />}
                >
                  Login
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => openAuth("register")}
                  leftIcon={<UserPlus className="h-4 w-4" />}
                >
                  Get Started
                </Button>
              </>
            ) : !userSession.emailVerified ? (
              <>
                <Link href={`/verify-email?email=${encodeURIComponent(userSession.email)}`}>
                  <Button variant="gradient" size="sm" leftIcon={<MailCheck className="h-4 w-4" />}>
                    Verify Email
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut className="h-4 w-4" />}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href={getDashboardPath(userSession)}>
                  <Button variant="gradient" size="sm" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                    {getDashboardLabel(userSession)}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm" leftIcon={<User className="h-4 w-4" />}>
                    Profile
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut className="h-4 w-4" />}>
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Animated Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[72px] left-0 right-0 z-30 bg-white border-b border-slate-200 shadow-xl overflow-hidden md:hidden"
          >
            <div className="p-6 space-y-4 flex flex-col">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-blue-600 py-2 border-b border-slate-100"
              >
                Home
              </Link>
              <Link
                href="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-blue-600 py-2 border-b border-slate-100"
              >
                Courses
              </Link>
              <Link
                href="/find-teachers"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-blue-600 py-2 border-b border-slate-100"
              >
                Find Teachers
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-blue-600 py-2 border-b border-slate-100"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-blue-600 py-2 border-b border-slate-100"
              >
                Contact
              </Link>

              <div className="pt-2 flex flex-col gap-3">
                {!userSession ? (
                  <>
                    <Button variant="outline" className="w-full justify-center" onClick={() => openAuth("login")}>
                      Login
                    </Button>
                    <Button variant="gradient" className="w-full justify-center" onClick={() => openAuth("register")}>
                      Get Started
                    </Button>
                  </>
                ) : !userSession.emailVerified ? (
                  <>
                    <Link href={`/verify-email?email=${encodeURIComponent(userSession.email)}`} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="gradient" className="w-full justify-center">
                        Verify Email
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-center" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href={getDashboardPath(userSession)} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="gradient" className="w-full justify-center">
                        {getDashboardLabel(userSession)}
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center">
                        Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-center" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          checkAuthStatus();
        }}
        initialMode={authMode}
      />
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, LogIn, UserPlus, Menu, X, Search, ChevronDown, Target, Video, Play } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";
import { AuthModal } from "@/components/shared/auth-modal";
import { GlobalSearchModal } from "@/components/discovery/global-search-modal";

export function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuth = (mode: "register" | "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="fixed top-5 left-0 right-0 z-50 px-6 lg:px-12 pointer-events-none flex items-center justify-between">
        {/* SEPARATE LOGO IN TOP LEFT CORNER */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-auto shrink-0"
        >
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-surface border border-white/80 shadow-lg group transition-transform hover:scale-105"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
              EDU<span className="text-blue-600">CONNECT</span>
            </span>
          </Link>
        </motion.div>

        {/* CENTER FLOATING GLASS NAVIGATION PILL (DESKTOP) */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pointer-events-auto hidden md:flex items-center gap-6 px-6 py-2.5 rounded-full glass-pill border border-white/90 shadow-xl transition-all duration-300"
        >
          <nav className="flex items-center gap-6 text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/find-teachers" className="hover:text-blue-600 transition-colors">
              Find Teachers
            </Link>
            <Link href="/courses" className="hover:text-blue-600 transition-colors">
              Courses
            </Link>

            {/* Learning Models Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors py-1">
                <span>Learning Models</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full -left-8 w-72 p-3 glass-dropdown-menu space-y-2 pointer-events-auto text-left normal-case shadow-2xl"
                  >
                    <Link
                      href="/#models"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-blue-50/80 transition-colors flex items-start gap-3 group"
                    >
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Demo Sessions</h4>
                        <p className="text-[10px] text-slate-500">1-on-1 trial session</p>
                      </div>
                    </Link>

                    <Link
                      href="/#models"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-indigo-50/80 transition-colors flex items-start gap-3 group"
                    >
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Live Class Slots</h4>
                        <p className="text-[10px] text-slate-500">Scheduled live slots</p>
                      </div>
                    </Link>

                    <Link
                      href="/courses"
                      onClick={() => setMegaMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-emerald-50/80 transition-colors flex items-start gap-3 group"
                    >
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                        <Play className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Recorded Courses</h4>
                        <p className="text-[10px] text-slate-500">Self-paced LMS modules</p>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
        </motion.div>

        {/* RIGHT ACTIONS & EXPANDED LENGTH SEARCH BAR */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-auto flex items-center gap-3 shrink-0"
        >
          {/* Expanded Search Bar Trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-44 sm:w-56 lg:w-64 px-3.5 py-2.5 rounded-2xl glass-surface border border-white/80 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all text-xs font-semibold flex items-center justify-between shadow-sm group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Search className="h-4 w-4 text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
              <span className="text-slate-400 group-hover:text-slate-600 transition-colors truncate">
                Search tutors, courses...
              </span>
            </div>
            <kbd className="hidden sm:inline-block bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono border border-slate-200 shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <GlassButton
                variant="ghost"
                size="sm"
                leftIcon={<LogIn className="h-3.5 w-3.5 text-slate-600" />}
              >
                Login
              </GlassButton>
            </Link>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => openAuth("register")}
              leftIcon={<UserPlus className="h-3.5 w-3.5" />}
            >
              Get Started
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-2xl glass-surface border border-white/80 text-slate-800 hover:bg-slate-100 shadow-sm"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="fixed top-24 left-4 right-4 z-40 p-6 glass-surface rounded-3xl shadow-2xl md:hidden space-y-4 text-center pointer-events-auto border border-white/90"
          >
            <nav className="flex flex-col gap-3 font-bold text-slate-800 text-sm">
              <Link href="/" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100">
                Home
              </Link>
              <Link href="/find-teachers" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100">
                Find Teachers
              </Link>
              <Link href="/courses" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100">
                Courses
              </Link>
              <Link href="/pricing" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100">
                Pricing
              </Link>
              <Link href="/how-it-works" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100">
                How It Works
              </Link>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100">
                About
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-2 border-b border-slate-100">
                Contact
              </Link>
            </nav>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <GlassButton variant="secondary" className="w-full">
                  Login
                </GlassButton>
              </Link>
              <GlassButton variant="primary" className="w-full" onClick={() => openAuth("register")}>
                Get Started
              </GlassButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

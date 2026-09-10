"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface LiveHeaderProps {
  onRegisterClick?: () => void;
}

export function LiveHeader({ onRegisterClick }: LiveHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-md py-3"
            : "bg-white border-b border-amber-100/60 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 rounded-2xl bg-[#7A0000] text-white shadow-md group-hover:scale-105 transition-transform border border-[#FFD700]/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold text-[#3B0202] tracking-tight">
              EDU<span className="text-[#7A0000]">CONNECTS</span>
            </span>
          </Link>

          {/* Desktop Right Nav & Button */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#why-educonnects"
              className="text-sm font-semibold text-[#3B0202] hover:text-[#7A0000] transition-colors"
            >
              Why EduConnects
            </a>
            <a
              href="#schedule"
              className="text-sm font-semibold text-[#3B0202] hover:text-[#7A0000] transition-colors"
            >
              Event Schedule
            </a>

            {/* Prominent Live Event Pill Button */}
            <Link href="/live">
              <button
                type="button"
                onClick={onRegisterClick}
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7A0000] to-[#9E1B1B] text-white text-xs font-bold tracking-wide uppercase shadow-md hover:from-[#590404] hover:to-[#7A0000] active:scale-95 transition-all duration-200 group overflow-hidden border border-[#FFD700]/50"
              >
                {/* Gold Highlight sheen */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD700]" />
                </span>
                <Bell className="h-4 w-4 text-[#FFD700] group-hover:rotate-12 transition-transform" />
                <span className="relative">🔔 Live Event</span>
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-amber-50 text-slate-800 hover:bg-amber-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[65px] left-0 right-0 z-30 bg-white border-b border-amber-200 shadow-xl overflow-hidden md:hidden"
          >
            <div className="p-5 space-y-4 flex flex-col">
              <a
                href="#why-educonnects"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-[#7A0000] py-2 border-b border-slate-100"
              >
                Why EduConnects
              </a>
              <a
                href="#schedule"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-[#7A0000] py-2 border-b border-slate-100"
              >
                Event Schedule
              </a>
              <a
                href="#live-session"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-[#7A0000] py-2 border-b border-slate-100"
              >
                Live Session
              </a>

              <div className="pt-2">
                <Link href="/live" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onRegisterClick?.();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#7A0000] to-[#9E1B1B] text-white text-xs font-bold uppercase tracking-wider shadow-md ring-2 ring-[#FFD700]/40"
                  >
                    <Bell className="h-4 w-4 text-[#FFD700]" />
                    <span>🔔 Live Event</span>
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Heart, Shield } from "lucide-react";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";

export interface PremiumFooterProps {
  showCta?: boolean;
}

export function PremiumFooter({ showCta = false }: PremiumFooterProps = {}) {
  return (
    <footer className="bg-[#073F3C] text-white pt-16 pb-12 border-t border-[#1B6863]/30 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#F2C14E]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-[#1B6863]/40">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#0B4F4B] text-[#F2C14E] border border-[#F2C14E]/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {OFFICIAL_COMPANY_INFO.brandName}
              </span>
            </Link>
            <p className="text-xs text-[#F2C14E] font-bold uppercase tracking-wider">
              Learn • Grow • Belong
            </p>
            <p className="text-xs text-teal-100/80 leading-relaxed max-w-sm">
              EduConnects is a modern educational platform connecting learners with verified educators for personalized 1-on-1 sessions, live group classes, and self-paced video courses.
            </p>
            <div className="text-xs text-teal-100/70 space-y-1 pt-3 border-t border-[#1B6863]/40">
              <p className="font-bold text-white">{OFFICIAL_COMPANY_INFO.legalName}</p>
              <p className="font-mono text-[11px]">CIN: {OFFICIAL_COMPANY_INFO.cin}</p>
              <p className="text-[11px] text-teal-100/70 leading-relaxed">
                Registered Office: {OFFICIAL_COMPANY_INFO.registeredAddress}
              </p>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-xs font-extrabold text-[#F2C14E] uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-teal-100/80 font-medium">
              <li>
                <Link href="/find-teachers" className="hover:text-[#F2C14E] transition-colors">
                  Find an Educator
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#F2C14E] transition-colors">
                  Explore Courses
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#F2C14E] transition-colors">
                  Browse Subjects
                </Link>
              </li>
              <li>
                <Link href="/live" className="hover:text-[#F2C14E] transition-colors flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Live Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Educators */}
          <div>
            <h4 className="text-xs font-extrabold text-[#F2C14E] uppercase tracking-wider mb-4">
              For Educators
            </h4>
            <ul className="space-y-2.5 text-xs text-teal-100/80 font-medium">
              <li>
                <Link href="/teacher" className="hover:text-[#F2C14E] transition-colors">
                  Become an Educator
                </Link>
              </li>
              <li>
                <Link href="/teacher/login" className="hover:text-[#F2C14E] transition-colors">
                  Educator Login
                </Link>
              </li>
              <li>
                <Link href="/teacher/register" className="hover:text-[#F2C14E] transition-colors">
                  Educator Onboarding
                </Link>
              </li>
              <li>
                <Link href="/teacher/dashboard" className="hover:text-[#F2C14E] transition-colors">
                  Educator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Policies */}
          <div>
            <h4 className="text-xs font-extrabold text-[#F2C14E] uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-teal-100/80 font-medium mb-4">
              <li>
                <Link href="/about" className="hover:text-[#F2C14E] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F2C14E] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-[#F2C14E] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#F2C14E] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <div className="p-3 bg-[#0B4F4B]/80 rounded-2xl border border-[#1B6863] text-xs text-[#F2C14E] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Shield className="h-4 w-4 text-[#F2C14E]" /> Cashfree Payments
              </div>
              <p className="text-[11px] text-teal-100/70 leading-relaxed">
                Secure checkout in INR (₹).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-teal-100/60">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} {OFFICIAL_COMPANY_INFO.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span>Powered by {OFFICIAL_COMPANY_INFO.brandName}</span>
            <Heart className="h-3.5 w-3.5 text-[#F2C14E] fill-[#F2C14E] ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}

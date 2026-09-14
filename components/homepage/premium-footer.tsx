"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Compass,
  Sparkles,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Info,
  Mail,
  Award,
  FileText,
  ShieldCheck,
  RefreshCw,
  Truck,
  CreditCard,
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";
import { Logo } from "@/components/brand/logo";

export interface PremiumFooterProps {
  showCta?: boolean;
}

export function PremiumFooter({ showCta = false }: PremiumFooterProps = {}) {
  const [socials, setSocials] = useState(OFFICIAL_COMPANY_INFO.socials);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/company")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.data?.company?.socials) {
          setSocials(json.data.company.socials);
        }
      })
      .catch(() => {
        // Fallback to initial state
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const socialLinks = [
    {
      name: "YouTube",
      url: socials.youtube,
      icon: Youtube,
      hoverClass: "hover:text-red-400 hover:border-red-400/40",
    },
    {
      name: "Facebook",
      url: socials.facebook,
      icon: Facebook,
      hoverClass: "hover:text-blue-400 hover:border-blue-400/40",
    },
    {
      name: "Instagram",
      url: socials.instagram,
      icon: Instagram,
      hoverClass: "hover:text-pink-400 hover:border-pink-400/40",
    },
    {
      name: "LinkedIn",
      url: socials.linkedin,
      icon: Linkedin,
      hoverClass: "hover:text-sky-400 hover:border-sky-400/40",
    },
  ].filter((item) => item.url && item.url.trim() !== "");

  return (
    <footer className="bg-[#083F3D] text-white pt-16 pb-12 border-t border-[#1B6863]/30 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#2A8C84]/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Main Grid: Brand + 3 Organized Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b border-[#1B6863]/40">
          {/* Brand & Legal Info (md:col-span-4) */}
          <div className="space-y-4 md:col-span-4">
            <Logo
              variant="compact"
              size="lg"
              theme="dark"
              href="/"
              showTagline={false}
            />
            <p className="text-xs text-[#2A8C84] font-bold uppercase tracking-wider">
              Learn • Grow • Belong
            </p>
            <p className="text-xs text-teal-100/80 leading-relaxed">
              EduConnects is India&apos;s premier educational platform connecting learners with verified educators for personalized 1-on-1 sessions, interactive group workshops, and accredited courses.
            </p>

            {/* Official Legal Details Card */}
            <div className="p-4 rounded-2xl bg-[#052C2A]/70 border border-[#1B6863]/50 text-xs text-teal-100/80 space-y-1.5 shadow-sm">
              <p className="font-bold text-white">Shrivastava ProFunnels Ventures Pvt Ltd</p>
              <p className="font-mono text-[11px] text-teal-200/90">CIN: U85499UP2024PTC212061</p>
              <p className="text-[11px] text-teal-100/70 leading-relaxed">
                Registered Office: Bard No. 8, Basundhara Colony, Chandmari, Lalitpur (UP), 284403
              </p>
            </div>

            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] uppercase tracking-wider font-extrabold text-teal-200/60 mb-2">
                  Connect With Us
                </p>
                <div className="flex items-center gap-2">
                  {socialLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`EduConnects on ${item.name}`}
                        className={`h-9 w-9 rounded-xl bg-[#0F5C5A]/60 border border-[#1B6863]/60 flex items-center justify-center text-teal-100/80 transition-all duration-200 ${item.hoverClass} hover:bg-[#052C2A]`}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Column 1: Explore (md:col-span-2) */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-extrabold text-[#F2FAF8] uppercase tracking-wider mb-4 border-b border-[#1B6863]/30 pb-2">
              Explore
            </h4>
            <ul className="space-y-3 text-xs text-teal-100/80 font-medium">
              <li>
                <Link href="/find-teachers" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                  <span>Find an Educator</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                  <span>Explore Courses</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                  <span>Browse Subjects</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Educators (md:col-span-3) */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-extrabold text-[#F2FAF8] uppercase tracking-wider mb-4 border-b border-[#1B6863]/30 pb-2">
              For Educators
            </h4>
            <ul className="space-y-3 text-xs text-teal-100/80 font-medium">
              <li>
                <Link href="/teacher" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                  <span>Become an Educator</span>
                </Link>
              </li>
              <li>
                <Link href="/teacher/login" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                  <LogIn className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                  <span>Educator Login</span>
                </Link>
              </li>
              <li>
                <Link href="/teacher/register" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                  <UserPlus className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                  <span>Educator Onboarding</span>
                </Link>
              </li>
              <li>
                <Link href="/teacher/dashboard" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                  <span>Educator Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Policies (md:col-span-3) */}
          <div className="md:col-span-3 space-y-5">
            <div>
              <h4 className="text-xs font-extrabold text-[#F2FAF8] uppercase tracking-wider mb-4 border-b border-[#1B6863]/30 pb-2">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs text-teal-100/80 font-medium">
                <li>
                  <Link href="/about" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/#success-stories" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                    <span>Success Stories</span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                    <span>Terms & Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                    <span>Cancellation & Refund</span>
                  </Link>
                </li>
                <li>
                  <Link href="/shipping-policy" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-[#2A8C84] shrink-0" />
                    <span>Shipping Policy</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cashfree Payment Gateway Card */}
            <div className="p-3.5 bg-[#052C2A]/80 rounded-2xl border border-[#1B6863]/60 text-xs space-y-1 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-white">
                <CreditCard className="h-4 w-4 text-[#2A8C84]" />
                <span>Cashfree Payment Gateway</span>
              </div>
              <p className="text-[11px] text-teal-100/70 leading-relaxed">
                Secure online payments in INR (₹).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Powered by */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-teal-100/60 pt-4">
          <p className="text-center sm:text-left">
            &copy; 2026 EduConnects. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <a
              href="https://automation.myprofunnels.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#2A8C84] hover:text-white hover:underline transition-colors inline-flex items-center gap-1"
            >
              MyProFunnels
              <span role="img" aria-label="love">❤️</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

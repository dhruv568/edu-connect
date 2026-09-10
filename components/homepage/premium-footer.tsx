"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Heart, Shield, ArrowRight, MessageSquare } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";

export interface PremiumFooterProps {
  showCta?: boolean;
}

export function PremiumFooter({ showCta = true }: PremiumFooterProps = {}) {
  return (
    <footer className="bg-[#073F3C] text-white pt-20 pb-12 border-t border-[#1B6863]/30 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#F2C14E]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Top CTA Banner */}
        {showCta && (
          <div className="glass-surface-dark bg-[#0B4F4B]/90 p-5 sm:p-8 md:p-12 rounded-3xl border border-[#1B6863] flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-[#F2C14E] uppercase tracking-widest">{OFFICIAL_COMPANY_INFO.tagline}</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white">Ready to grow your business & skills?</h3>
              <p className="text-sm text-teal-100/80 max-w-lg">
                Explore 27 digital products, sales funnels, marketing automation, and LMS courses powered by {OFFICIAL_COMPANY_INFO.brandName}.
              </p>
            </div>
            <Link href="/register">
              <GlassButton variant="secondary" size="lg" className="bg-[#F2C14E] text-[#102A2A] hover:bg-[#E0B03C]" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started Free
              </GlassButton>
            </Link>
          </div>
        )}

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-[#1B6863]/40">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#0B4F4B] text-[#F2C14E] border border-[#F2C14E]/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {OFFICIAL_COMPANY_INFO.brandName}
              </span>
            </Link>
            <p className="text-xs text-[#F2C14E] font-bold uppercase tracking-wider">
              {OFFICIAL_COMPANY_INFO.tagline}
            </p>
            <p className="text-xs text-teal-100/80 leading-relaxed max-w-sm">
              {OFFICIAL_COMPANY_INFO.natureOfBusiness}
            </p>
            <div className="text-xs text-teal-100/70 space-y-1 pt-3 border-t border-[#1B6863]/40">
              <p className="font-bold text-white">{OFFICIAL_COMPANY_INFO.legalName}</p>
              <p className="font-mono text-[11px]">CIN: {OFFICIAL_COMPANY_INFO.cin}</p>
              <p className="text-[11px] text-teal-100/70 leading-relaxed">
                Registered Office: {OFFICIAL_COMPANY_INFO.registeredAddress}
              </p>
              <p className="text-[11px]">
                WhatsApp:{" "}
                <a
                  href={OFFICIAL_COMPANY_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F2C14E] font-bold hover:underline"
                >
                  {OFFICIAL_COMPANY_INFO.whatsappNumber}
                </a>
              </p>
            </div>
          </div>

          {/* Offerings */}
          <div>
            <h4 className="text-xs font-extrabold text-[#F2C14E] uppercase tracking-wider mb-4">Offerings</h4>
            <ul className="space-y-2.5 text-xs text-teal-100/80">
              <li><Link href="/services" className="hover:text-[#F2C14E] transition-colors">Products & Services</Link></li>
              <li><Link href="/pricing" className="hover:text-[#F2C14E] transition-colors">Pricing Plans</Link></li>
              <li><Link href="/courses" className="hover:text-[#F2C14E] transition-colors">LMS Courses</Link></li>
              <li><Link href="/find-teachers" className="hover:text-[#F2C14E] transition-colors">Find Tutors</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-extrabold text-[#F2C14E] uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-xs text-teal-100/80">
              <li><Link href="/student" className="hover:text-[#F2C14E] transition-colors">Student Experience</Link></li>
              <li><Link href="/teacher" className="hover:text-[#F2C14E] transition-colors">Teacher Portal</Link></li>
              <li><Link href="/student/dashboard" className="hover:text-[#F2C14E] transition-colors">Student Dashboard</Link></li>
              <li><Link href="/teacher/dashboard" className="hover:text-[#F2C14E] transition-colors">Teacher Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-[#F2C14E] transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          {/* Policies & Gateway */}
          <div>
            <h4 className="text-xs font-extrabold text-[#F2C14E] uppercase tracking-wider mb-4">Company Policies</h4>
            <ul className="space-y-2.5 text-xs text-teal-100/80 mb-4">
              <li><Link href="/contact" className="hover:text-[#F2C14E] transition-colors">Contact Us</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-[#F2C14E] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#F2C14E] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-[#F2C14E] transition-colors">Refund Policy</Link></li>
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

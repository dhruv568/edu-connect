import React from "react";
import Link from "next/link";
import { GraduationCap, Heart, Shield, MessageSquare } from "lucide-react";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                {OFFICIAL_COMPANY_INFO.brandName}
              </span>
            </Link>
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">
              {OFFICIAL_COMPANY_INFO.tagline}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {OFFICIAL_COMPANY_INFO.natureOfBusiness}
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
              <p className="font-bold text-white">{OFFICIAL_COMPANY_INFO.legalName}</p>
              <p className="font-mono text-[11px]">CIN: {OFFICIAL_COMPANY_INFO.cin}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Registered Office: {OFFICIAL_COMPANY_INFO.registeredAddress}
              </p>
              <p className="text-[11px]">
                WhatsApp:{" "}
                <a
                  href={OFFICIAL_COMPANY_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 font-bold hover:underline"
                >
                  {OFFICIAL_COMPANY_INFO.whatsappNumber}
                </a>
              </p>
            </div>
          </div>

          {/* Offerings & Pricing */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Offerings</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/services" className="hover:text-white transition-colors">Products & Services</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">LMS Courses</Link></li>
              <li><Link href="/find-teachers" className="hover:text-white transition-colors">Find Tutors</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/student" className="hover:text-white transition-colors">Student Dashboard</Link></li>
              <li><Link href="/teacher" className="hover:text-white transition-colors">Teacher Portal</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          {/* Policies & Legal */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Legal & Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 mb-4">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>Cashfree Verified Checkout</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {OFFICIAL_COMPANY_INFO.legalName}. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Powered by {OFFICIAL_COMPANY_INFO.brandName}</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}

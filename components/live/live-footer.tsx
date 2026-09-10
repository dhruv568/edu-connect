"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

export function LiveFooter() {
  return (
    <footer className="bg-[#2E0202] text-white pt-16 pb-12 border-t border-[#630707]/50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#630707]/60">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#7A0000] text-[#FFD700] border border-[#FFD700]/40 shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                EDU<span className="text-[#FFD700]">CONNECTS</span>
              </span>
            </Link>

            <p className="text-sm font-extrabold text-[#FFD700] uppercase tracking-wider">
              EduConnects • Learn | Grow | Belong
            </p>

            <p className="text-xs text-amber-100/80 leading-relaxed max-w-md">
              Connecting learners and educators across India in real-time live classrooms, structured courses, and interactive live events.
            </p>

            <p className="text-xs font-semibold text-amber-100/70">
              A Brighter Tomorrow Together • &copy; 2026 EduConnects
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-amber-100/80">
              <li>
                <a href="#why-educonnects" className="hover:text-[#FFD700] transition-colors">
                  Why EduConnects
                </a>
              </li>
              <li>
                <Link href="/live" className="hover:text-[#FFD700] transition-colors text-[#FFD700] font-bold">
                  Live Event
                </Link>
              </li>
              <li>
                <a href="#schedule" className="hover:text-[#FFD700] transition-colors">
                  Event Schedule
                </a>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#FFD700] transition-colors">
                  Explore Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-widest mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-amber-100/80">
              <li>
                <Link href="/contact" className="hover:text-[#FFD700] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-[#FFD700] transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#FFD700] transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-100/60 font-semibold">
          <p>&copy; 2026 EduConnects. All rights reserved.</p>
          <div className="flex items-center gap-1 text-amber-100/70">
            <span>Built with passion for EduConnects</span>
            <Heart className="h-3.5 w-3.5 text-[#FFD700] fill-[#FFD700] ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

export function LiveFooter() {
  return (
    <footer className="bg-[#073F3C] text-white pt-16 pb-12 border-t border-[#1B6863]/30 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#1B6863]/40">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#0B4F4B] text-[#F2C14E] border border-[#F2C14E]/30 shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                EDU<span className="text-[#F2C14E]">CONNECTS</span>
              </span>
            </Link>

            <p className="text-sm font-extrabold text-[#F2C14E] uppercase tracking-wider">
              EduConnects • Learn | Grow | Belong
            </p>

            <p className="text-xs text-teal-100/80 leading-relaxed max-w-md">
              Connecting learners and educators across India in real-time live classrooms, structured courses, and interactive live events.
            </p>

            <p className="text-xs font-semibold text-teal-100/70">
              A Brighter Tomorrow Together • &copy; 2026 EduConnects
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-[#F2C14E] uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-teal-100/80">
              <li>
                <a href="#why-educonnects" className="hover:text-[#F2C14E] transition-colors">
                  Why EduConnects
                </a>
              </li>
              <li>
                <Link href="/live" className="hover:text-[#F2C14E] transition-colors text-[#F2C14E] font-bold">
                  Live Event
                </Link>
              </li>
              <li>
                <a href="#schedule" className="hover:text-[#F2C14E] transition-colors">
                  Event Schedule
                </a>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#F2C14E] transition-colors">
                  Explore Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-black text-[#F2C14E] uppercase tracking-widest mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-teal-100/80">
              <li>
                <Link href="/contact" className="hover:text-[#F2C14E] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-[#F2C14E] transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#F2C14E] transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-teal-100/60 font-semibold">
          <p>&copy; 2026 EduConnects. All rights reserved.</p>
          <div className="flex items-center gap-1 text-teal-100/70">
            <span>Built with passion for EduConnects</span>
            <Heart className="h-3.5 w-3.5 text-[#F2C14E] fill-[#F2C14E] ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}

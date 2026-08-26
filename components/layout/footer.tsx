import React from "react";
import Link from "next/link";
import { GraduationCap, Heart, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                EDU<span className="text-blue-500">CONNECT</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering global education by connecting expert teachers and motivated students through flexible, real-time learning experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform Portals</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/teacher" className="hover:text-white transition-colors">Teacher Portal</Link></li>
              <li><Link href="/student" className="hover:text-white transition-colors">Student Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          {/* Learning Models */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Learning Models</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-pointer">Demo Class Booking</span></li>
              <li><span className="hover:text-white cursor-pointer">Live Class Slot Booking</span></li>
              <li><span className="hover:text-white cursor-pointer">Pre-Recorded Self-Paced Courses</span></li>
              <li><span className="hover:text-white cursor-pointer">Interactive Classroom</span></li>
            </ul>
          </div>

          {/* Trust & Verification */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Security & Verification</h4>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <Shield className="h-4 w-4 shrink-0" />
              <span>Verified Teachers & Protected Communications</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; 2026 EduConnect. All rights reserved. Built with Next.js App Router & Prisma.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with passion for joyful learning</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}

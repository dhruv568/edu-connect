"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Heart, Shield, ArrowRight } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";

export function PremiumFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-12 border-t border-slate-800 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Top CTA Banner */}
        <div className="glass-surface-dark p-8 sm:p-12 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white">Ready to transform your learning?</h3>
            <p className="text-sm text-slate-400 max-w-lg">
              Join thousands of teachers and students building connected education futures on EduConnect.
            </p>
          </div>
          <GlassButton variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Get Started Free
          </GlassButton>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-600 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                EDU<span className="text-blue-500">CONNECT</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              EduConnect is a next-generation education platform built around three independent learning models: Demo Sessions, Live Classes, and Pre-recorded Courses.
            </p>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Learn</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="#teachers" className="hover:text-white transition-colors">Find Teachers</Link></li>
              <li><Link href="#classroom" className="hover:text-white transition-colors">Live Classes</Link></li>
              <li><Link href="#models" className="hover:text-white transition-colors">LMS Courses</Link></li>
              <li><Link href="/verify-email" className="hover:text-white transition-colors">Verify Account</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/teacher" className="hover:text-white transition-colors">Teacher Portal</Link></li>
              <li><Link href="/student" className="hover:text-white transition-colors">Student Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">Security</h4>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-emerald-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Shield className="h-4 w-4" /> 100% Protected
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Encrypted sessions & verified tutor credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; 2026 EduConnect Liquid Learning Platform Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for connected education</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}

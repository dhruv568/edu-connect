"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Search, Award } from "lucide-react";

export default function CertificateLookupPage() {
  const router = useRouter();
  const [certId, setCertId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      router.push(`/certificate/verify/${encodeURIComponent(certId.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-200">
      {/* Top Brand Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Logo variant="compact" size="md" href="/" roleContext="teacher" />
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/training"
              className="text-xs font-bold text-slate-650 hover:text-[#16805B] transition-colors hidden sm:inline"
            >
              Educator Academy
            </Link>
            <Link
              href="/teacher/login"
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#16805B] hover:bg-[#0D5C41] text-white transition-all shadow-sm"
            >
              Educator Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Search Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#16805B] flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            EduConnects Credential Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-650 max-w-sm mx-auto">
            Enter the unique Certificate ID located at the bottom of any official EduConnects Certificate to verify authenticity.
          </p>
        </div>

        <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xl w-full space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Certificate ID
              </label>
              <input
                type="text"
                required
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. EDU-CERT-2026-A1B2C3"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 font-mono text-sm uppercase tracking-wide focus:outline-none focus:border-[#16805B] focus:ring-2 focus:ring-emerald-100 font-bold"
              />
            </div>

            <Button
              type="submit"
              disabled={!certId.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#16805B] hover:bg-[#0D5C41] text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Verify Credential Status →</span>
            </Button>
          </form>
        </Card>
      </main>

      {/* Corporate Verification Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-650 space-y-2">
        <p className="font-semibold text-slate-700">
          EduConnects Academic Credentials Verification System
        </p>
        <p>
          Corporate Entity: <span className="font-bold text-slate-800">Shrivastava ProFunnels Ventures Pvt Ltd</span> • CIN: <span className="font-mono text-slate-800">U85499UP2024PTC212061</span>
        </p>
      </footer>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto shadow-2xl shadow-red-500/20">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Payment Unsuccessful</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your payment could not be completed at this time. If any amount was deducted, Razorpay will automatically reverse it.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/courses"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base transition-all"
          >
            <RefreshCw className="w-5 h-5" /> Try Payment Again
          </Link>

          <Link
            href="/courses"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold rounded-xl text-sm border border-slate-800 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

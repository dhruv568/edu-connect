"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <GraduationCap className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-black text-blue-600">404</span>
          <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Oops! The EduConnect page or learning resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link href="/">
            <Button variant="gradient" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Return to EduConnect Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

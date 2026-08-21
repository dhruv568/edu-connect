"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("EduConnect Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            An unexpected error occurred. Our system logged the issue and security controls prevented data exposure.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Button variant="primary" onClick={() => reset()} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Download } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const isFree = searchParams.get("free") === "true";

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      if (!transactionId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/payments/${transactionId}`);
        const data = await res.json();
        if (res.ok) {
          setPayment(data.data.transaction);
        }
      } catch {
        // Fallback preview
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [transactionId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isFree ? "Enrolled Successfully! 🎉" : "Payment Successful ✓"}
          </h1>
          <p className="text-sm text-slate-400">
            {isFree
              ? "Your free access is now active."
              : "Your payment has been verified & your access is active."}
          </p>
        </div>

        {loading ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <p className="text-xs text-slate-400">Loading receipt details...</p>
          </div>
        ) : payment ? (
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl text-left space-y-3 shadow-xl">
            <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span>Transaction ID</span>
              <span className="font-mono text-slate-200">{payment.internalReference}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-300">Product</span>
              <span className="text-white text-right max-w-[200px] truncate">{payment.productTitle}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-300">Amount Paid</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(payment.amount)}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Educator</span>
              <span className="text-slate-300">{payment.teacherName}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/student/courses"
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-base transition-all"
          >
            Start Learning <ArrowRight className="w-5 h-5" />
          </Link>

          {transactionId && (
            <Link
              href={`/student/payments/${transactionId}`}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm border border-slate-800 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" /> View Payment Receipt
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Loading receipt...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

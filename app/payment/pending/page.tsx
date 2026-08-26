"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get("transactionId");

  const [status] = useState("We're confirming your payment status with Razorpay...");

  useEffect(() => {
    if (!transactionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${transactionId}`);
        const data = await res.json();
        if (res.ok && data.data.transaction) {
          const tStatus = data.data.transaction.status;
          if (tStatus === "CAPTURED") {
            clearInterval(interval);
            router.push(`/payment/success?transactionId=${transactionId}`);
          } else if (tStatus === "FAILED") {
            clearInterval(interval);
            router.push("/payment/failed");
          }
        }
      } catch {
        // Continue polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [transactionId, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Confirming Payment...</h1>
          <p className="text-sm text-slate-400 leading-relaxed">{status}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" /> Safe transaction verification in progress
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Verifying payment...</div>}>
      <PaymentPendingContent />
    </Suspense>
  );
}

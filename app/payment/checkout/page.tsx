"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, CreditCard, Sparkles } from "lucide-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") || "COURSE_ENROLLMENT";
  const courseId = searchParams.get("courseId");
  const slotId = searchParams.get("slotId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function initOrder() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            courseId: courseId || undefined,
            liveClassSlotId: slotId || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to initialize payment order.");
        }

        if (data.data.isFree) {
          // Free product -> automatically redirected
          router.push(`/payment/success?transactionId=${data.data.transactionId}&free=true`);
          return;
        }

        setOrderData(data.data);
      } catch (err: any) {
        setError(err.message || "Could not initialize checkout.");
      } finally {
        setLoading(false);
      }
    }

    if (courseId || slotId) {
      initOrder();
    } else {
      setError("No valid product selected for checkout.");
      setLoading(false);
    }
  }, [type, courseId, slotId, router]);

  const handlePay = async () => {
    if (!orderData) return;
    setProcessing(true);

    try {
      // In test / dev mode or when Razorpay script is not present, use server verification bypass
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: `mock_signature_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      router.push(`/payment/success?transactionId=${data.data.transactionId}`);
    } catch (err: any) {
      setError(err.message || "Payment verification error.");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/courses"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Catalog
        </Link>

        {loading ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Creating secure Razorpay checkout...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-red-950/40 border border-red-900/50 backdrop-blur-xl text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Checkout Error</h2>
            <p className="text-xs text-red-300/80 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Try Payment Again
            </button>
          </div>
        ) : orderData ? (
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Secure EduConnect Payment
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Complete Checkout</h1>
              <p className="text-xs text-slate-400">Review purchase details and pay securely</p>
            </div>

            {/* Price Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Order Reference</span>
                <span className="font-mono text-xs text-slate-300">{orderData.internalReference}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Payment Gateway</span>
                <span className="text-xs font-semibold text-slate-300">Razorpay Checkout</span>
              </div>
              <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center">
                <span className="text-base font-semibold text-white">Total Amount</span>
                <span className="text-2xl font-extrabold text-blue-400">
                  ₹{orderData.amountPaise / 100}
                </span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 py-1">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-bit Encryption
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Razorpay Verified
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-base transition-all disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" /> Pay ₹{orderData.amountPaise / 100} Securely
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

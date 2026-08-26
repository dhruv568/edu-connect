"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";

export default function StudentPaymentReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [refundMsg, setRefundMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      if (!id) return;
      try {
        const res = await fetch(`/api/student/payments/${id}`);
        const data = await res.json();
        if (res.ok) {
          setReceipt(data.data.receipt);
        }
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    }
    fetchReceipt();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleRequestRefund = async () => {
    if (!receipt || refunding) return;
    if (!confirm("Are you sure you want to request a refund for this purchase?")) return;

    setRefunding(true);
    setRefundMsg(null);
    try {
      const res = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: receipt.id,
          reason: "Student requested refund from receipt portal",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund request failed.");

      setRefundMsg("Refund processed successfully!");
      setReceipt({ ...receipt, status: "REFUNDED" });
    } catch (err: any) {
      setRefundMsg(err.message || "Refund request failed.");
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-xl font-bold text-white">Receipt Not Found</h2>
        <Link href="/student/payments" className="mt-4 text-xs text-blue-400 font-semibold hover:underline">
          Back to Payments
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <Link
            href="/student/payments"
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Purchases
          </Link>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print Receipt
          </button>
        </div>

        {/* Printable Receipt Card */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 print:bg-white print:text-black print:shadow-none print:border-black">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-6 print:border-gray-300">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400 print:text-blue-600" />
                <span className="text-xl font-black tracking-tight text-white print:text-black">EduConnect</span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-500 mt-1">Official Payment Receipt</p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:bg-green-100 print:text-green-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> {receipt.status}
              </span>
              <p className="text-[10px] font-mono text-slate-500 print:text-gray-400 mt-1">
                {new Date(receipt.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Customer & Product Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 print:text-gray-500 font-semibold uppercase">Billed To</span>
              <p className="font-bold text-white print:text-black">{receipt.studentName}</p>
              <p className="text-slate-400 print:text-gray-600">{receipt.studentEmail}</p>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-slate-500 print:text-gray-500 font-semibold uppercase">Educator</span>
              <p className="font-bold text-white print:text-black">{receipt.teacherName}</p>
              <p className="text-slate-400 print:text-gray-600">EduConnect Verified Partner</p>
            </div>
          </div>

          {/* Item Breakdown Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 print:bg-gray-100 text-slate-400 print:text-gray-700 font-semibold border-b border-slate-800 print:border-gray-300">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-white print:text-black">
                    {receipt.productTitle}
                    <div className="text-[10px] font-normal text-slate-400 print:text-gray-500 capitalize">
                      {receipt.productType.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-white print:text-black">
                    ₹{receipt.amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Identifiers */}
          <div className="p-4 rounded-2xl bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 print:text-gray-500">EduConnect Ref</span>
              <span className="font-mono text-slate-300 print:text-black font-semibold">{receipt.internalReference}</span>
            </div>
            {receipt.providerOrderId && (
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-500">Razorpay Order ID</span>
                <span className="font-mono text-slate-300 print:text-black">{receipt.providerOrderId}</span>
              </div>
            )}
            {receipt.providerPaymentId && (
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-500">Razorpay Payment ID</span>
                <span className="font-mono text-slate-300 print:text-black">{receipt.providerPaymentId}</span>
              </div>
            )}
          </div>

          {/* Footer Security */}
          <div className="pt-2 text-center text-[11px] text-slate-500 print:text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-600" />
            Processed securely via Razorpay Checkout. Standard receipt document.
          </div>
        </div>

        {/* Refund Action */}
        {receipt.status === "CAPTURED" && (
          <div className="print:hidden space-y-2">
            {refundMsg && (
              <p className="text-xs text-center font-medium text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                {refundMsg}
              </p>
            )}
            <button
              onClick={handleRequestRefund}
              disabled={refunding}
              className="w-full py-3 bg-slate-900 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-semibold rounded-xl text-xs border border-slate-800 hover:border-red-900/50 transition-all disabled:opacity-50"
            >
              {refunding ? "Processing Refund Request..." : "Request Purchase Refund"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

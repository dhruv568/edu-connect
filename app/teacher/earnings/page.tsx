"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, Clock, CheckCircle2, ShieldCheck, ArrowRight, ListFilter, CreditCard } from "lucide-react";

export default function TeacherEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const res = await fetch("/api/teacher/earnings");
        const json = await res.json();
        if (res.ok) {
          setData(json.data);
        }
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    }
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data?.summary || {
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingAmount: 0,
    availableAmount: 0,
    refundedAmount: 0,
  };

  const payoutAccount = data?.payoutAccount || { status: "NOT_STARTED" };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-400" /> Educator Earnings & Revenue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time track of your course sales, live class earnings, platform commission, and payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/teacher/earnings/setup"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 flex items-center gap-2 transition-all"
          >
            <CreditCard className="w-4 h-4 text-purple-400" /> Payout Setup ({payoutAccount.status})
          </Link>

          <Link
            href="/teacher/earnings/transactions"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-500/20"
          >
            <ListFilter className="w-4 h-4" /> Transaction Ledger
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-2 shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Gross Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">₹{summary.totalEarnings.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Cumulative earnings to date
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-2 shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>This Month</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400">₹{summary.thisMonthEarnings.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Current calendar month sales</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-2 shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Pending Payout</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">₹{summary.pendingAmount.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Processing or awaiting settlement</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-2 shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Available for Payout</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-purple-400">₹{summary.availableAmount.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Eligible for Route transfer</p>
        </div>
      </div>

      {/* Payout Account Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/70 border border-purple-800/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Razorpay Route Marketplace Payouts</h3>
          </div>
          <p className="text-xs text-slate-300">
            {payoutAccount.status === "ACTIVE"
              ? "Your Linked Account is active. Direct settlements to your bank account are enabled."
              : "Set up your Razorpay Linked Account to automatically receive student payments."}
          </p>
        </div>

        <Link
          href="/teacher/earnings/setup"
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          {payoutAccount.status === "ACTIVE" ? "Manage Payout Account" : "Set Up Payouts"} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

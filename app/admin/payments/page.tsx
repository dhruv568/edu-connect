"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, RefreshCw, ShieldCheck, Search, Filter, CheckCircle2, AlertCircle, Settings, ArrowUpRight } from "lucide-react";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [updatingComm, setUpdatingComm] = useState(false);
  const [commMsg, setCommMsg] = useState<string | null>(null);

  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  useEffect(() => {
    fetchAdminPayments();
  }, [search, statusFilter, typeFilter]);

  const fetchAdminPayments = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (statusFilter !== "ALL") q.set("status", statusFilter);
      if (typeFilter !== "ALL") q.set("type", typeFilter);

      const res = await fetch(`/api/admin/payments?${q.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommission = async () => {
    setUpdatingComm(true);
    setCommMsg(null);
    try {
      const res = await fetch("/api/admin/payments/commission", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent: commissionPercent }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed.");

      setCommMsg(`Commission updated to ${json.data.commissionPercent}%`);
    } catch (err: any) {
      setCommMsg(err.message || "Failed to update commission.");
    } finally {
      setUpdatingComm(false);
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    setReconcileResult(null);
    try {
      const res = await fetch("/api/admin/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      if (res.ok) {
        setReconcileResult(json.data);
      }
    } catch {
      // Error
    } finally {
      setReconciling(false);
    }
  };

  const summary = data?.summary || {
    totalRevenue: 0,
    todayRevenue: 0,
    totalCommission: 0,
    totalTeacherEarnings: 0,
    totalRefunded: 0,
    pendingCount: 0,
  };

  const transactions = data?.transactions || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-500" /> Admin Financial System & Reconciliation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System-wide platform revenue, teacher payouts, commission settings, and Razorpay transaction reconciliation.
          </p>
        </div>

        <button
          onClick={handleReconcile}
          disabled={reconciling}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${reconciling ? "animate-spin" : ""}`} /> Reconcile Payments
        </button>
      </div>

      {/* Reconciliation Result Notification */}
      {reconcileResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Reconciliation complete: <strong>{reconcileResult.matchedCount} / {reconcileResult.reconciledCount}</strong> transactions matched perfectly with Razorpay state.
            </span>
          </div>
          <button onClick={() => setReconcileResult(null)} className="text-xs underline text-emerald-400">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1.5 shadow-xl">
          <span className="text-slate-400 text-xs font-semibold">Total Revenue</span>
          <p className="text-2xl font-black text-white">₹{summary.totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400">Platform gross turnover</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1.5 shadow-xl">
          <span className="text-slate-400 text-xs font-semibold">Today&apos;s Revenue</span>
          <p className="text-2xl font-black text-blue-400">₹{summary.todayRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">24-hour total</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1.5 shadow-xl">
          <span className="text-slate-400 text-xs font-semibold">Platform Commission</span>
          <p className="text-2xl font-black text-emerald-400">₹{summary.totalCommission.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">EduConnect net share</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1.5 shadow-xl">
          <span className="text-slate-400 text-xs font-semibold">Teacher Earnings</span>
          <p className="text-2xl font-black text-purple-400">₹{summary.totalTeacherEarnings.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Educator payout pool</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1.5 shadow-xl">
          <span className="text-slate-400 text-xs font-semibold">Total Refunded</span>
          <p className="text-2xl font-black text-red-400">₹{summary.totalRefunded.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Customer refunds</p>
        </div>
      </div>

      {/* Commission Setting Card */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">System Platform Commission Rate</h3>
          </div>
          <p className="text-xs text-slate-400">
            Configurable commission split percentage deducted from educator earnings per transaction.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <input
              type="number"
              min="0"
              max="100"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
              className="w-16 bg-transparent text-sm font-bold text-white outline-none text-right"
            />
            <span className="text-xs text-slate-400 font-bold">%</span>
          </div>

          <button
            onClick={handleUpdateCommission}
            disabled={updatingComm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {updatingComm ? "Saving..." : "Update Rate"}
          </button>
        </div>
      </div>

      {commMsg && (
        <p className="text-xs text-center font-medium text-blue-400 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
          {commMsg}
        </p>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transaction ref, student, educator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-800 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CAPTURED">CAPTURED</option>
            <option value="PENDING">PENDING</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="FAILED">FAILED</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-800 outline-none"
          >
            <option value="ALL">All Product Types</option>
            <option value="COURSE_ENROLLMENT">Course Enrollment</option>
            <option value="LIVE_CLASS_BOOKING">Live Class Booking</option>
          </select>
        </div>
      </div>

      {/* Admin Transactions Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800/60">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading platform transactions...</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Transaction Ref</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Educator</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-300 font-bold">{t.internalReference}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{t.studentName}</div>
                      <div className="text-[10px] text-slate-500">{t.studentEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{t.teacherName}</td>
                    <td className="px-6 py-4 text-slate-200">
                      <div className="truncate max-w-[180px] font-semibold">{t.productTitle}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{t.type.replace("_", " ")}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">₹{t.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === "CAPTURED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : t.status === "REFUNDED"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : t.status === "FAILED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IndianRupee,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Settings,
  ExternalLink,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/currency";

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
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="educonnects.com@gmail.com">
      <div className="space-y-6 pb-16">
        {/* Breadcrumb & Header */}
        <div>
          <AdminBreadcrumb
            items={[{ label: "Finance" }, { label: "Financial Ledger & Payouts" }]}
            className="mb-3"
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Financial Ledger & Reconciliation
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  FINANCE
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">
                Platform revenue, educator payout splits, commission fee policies, and Cashfree gateway reconciliation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/refunds">
                <button className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-2xs">
                  Refund Management
                </button>
              </Link>
              <button
                onClick={handleReconcile}
                disabled={reconciling}
                className="px-4 py-2 bg-[#0B4F4B] hover:bg-[#073F3C] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? "animate-spin" : ""}`} />
                <span>{reconciling ? "Reconciling..." : "Reconcile Gateway"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reconciliation Notification */}
        {reconcileResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Reconciliation complete: <strong>{reconcileResult.matchedCount} / {reconcileResult.reconciledCount}</strong> transactions matched payment gateway state.
              </span>
            </div>
            <button onClick={() => setReconcileResult(null)} className="text-xs underline text-emerald-700 font-bold hover:text-emerald-900 ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Financial Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Total Revenue</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Platform gross turnover</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Today&apos;s Volume</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{formatCurrency(summary.todayRevenue)}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last 24-hour total</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Platform Commission</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(summary.totalCommission)}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">EduConnects retained fee</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Educator Earnings</span>
            <p className="text-2xl font-black text-purple-600 mt-1">{formatCurrency(summary.totalTeacherEarnings)}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Educator payout pool</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Total Refunded</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(summary.totalRefunded)}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Disbursed refunds</p>
          </div>
        </div>

        {/* Commission Rate Settings Card */}
        <Card className="p-5 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#0B4F4B]" />
              <h3 className="text-sm font-bold text-slate-900">Platform Commission Rate</h3>
            </div>
            <p className="text-xs text-slate-500">
              Standard commission fee split deducted from educator earnings per transaction.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <input
                type="number"
                min="0"
                max="100"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                className="w-14 bg-transparent text-sm font-bold text-slate-900 outline-none text-right"
              />
              <span className="text-xs text-slate-500 font-bold">%</span>
            </div>

            <button
              onClick={handleUpdateCommission}
              disabled={updatingComm}
              className="px-4 py-2 bg-[#0B4F4B] hover:bg-[#073F3C] text-white text-xs font-bold rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {updatingComm ? "Saving..." : "Update Rate"}
            </button>
          </div>
        </Card>

        {commMsg && (
          <p className="text-xs text-center font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            {commMsg}
          </p>
        )}

        {/* Search & Filter Bar */}
        <Card className="p-4 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ref, learner, or educator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-100 border-none rounded-2xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-[#0B4F4B]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none"
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
              className="h-10 px-3 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">All Product Types</option>
              <option value="COURSE_ENROLLMENT">Course Enrollment</option>
              <option value="LIVE_CLASS_BOOKING">Live Class Booking</option>
            </select>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="p-0 border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4">Learner</th>
                  <th className="p-4">Educator</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 text-[#0B4F4B] animate-spin mx-auto mb-2" />
                      Loading payment transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                      No payment transactions found matching criteria.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-slate-700 font-bold">
                        {t.internalReference}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{t.studentName}</div>
                        <div className="text-[11px] text-slate-400">{t.studentEmail}</div>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">{t.teacherName}</td>
                      <td className="p-4">
                        <div className="truncate max-w-[180px] font-semibold text-slate-800">{t.productTitle}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{t.type.replace("_", " ")}</div>
                      </td>
                      <td className="p-4 font-black text-slate-900">{formatCurrency(t.amount)}</td>
                      <td className="p-4">
                        <StatusBadge
                          status={t.status === "CAPTURED" ? "PUBLISHED" : t.status === "REFUNDED" ? "REJECTED" : "PENDING"}
                          size="sm"
                        />
                      </td>
                      <td className="p-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

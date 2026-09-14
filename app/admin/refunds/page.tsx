"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlassButton } from "@/components/glass/glass-button";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  X,
  FileCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Action modal state
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const statusTabs = [
    { label: "All Refunds", value: "ALL" },
    { label: "Pending Review", value: "REFUND_REQUESTED", badge: "Action" },
    { label: "Approved / Refunded", value: "REFUNDED" },
    { label: "Rejected / Failed", value: "REFUND_FAILED" },
  ];

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter, page]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        status: statusFilter,
        page: String(page),
        limit: "10",
      });

      const res = await fetch(`/api/admin/refunds?${query.toString()}`);
      const json = await res.json();

      if (json.data) {
        setRefunds(json.data.refunds || []);
        setTotalPages(json.data.pagination?.totalPages || 1);
        setTotalCount(json.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch refunds:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (refundId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/refunds/${refundId}/approve`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setSelectedRefund(null);
        fetchRefunds();
      } else {
        alert(json.error?.message || "Failed to approve refund.");
      }
    } catch (err) {
      console.error("Error approving refund:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRefund = async (refundId: string) => {
    if (!rejectReason.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/refunds/${refundId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedRefund(null);
        setRejectReason("");
        fetchRefunds();
      } else {
        alert(json.error?.message || "Failed to reject refund.");
      }
    } catch (err) {
      console.error("Error rejecting refund:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="educonnects.com@gmail.com">
      <div className="space-y-6 pb-16">
        {/* Breadcrumb & Header */}
        <div>
          <AdminBreadcrumb
            items={[{ label: "Finance" }, { label: "Refund Management" }]}
            className="mb-3"
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Refund Governance & Audits
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                  {totalCount} Claims
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">
                Review learner refund requests, reverse platform ledger disbursements, and audit transaction resolutions.
              </p>
            </div>

            <Link href="/admin/payments">
              <button className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs">
                Financial Ledger & Payouts
              </button>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#0B4F4B] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-teal-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">ALL REFUND STATUSES</option>
              <option value="REFUND_REQUESTED">PENDING REVIEW</option>
              <option value="REFUNDED">APPROVED / REFUNDED</option>
              <option value="REFUND_FAILED">REJECTED / FAILED</option>
            </select>
          </div>
        </Card>

        {/* Refunds Table */}
        <Card className="p-0 border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Refund ID</th>
                  <th className="p-4">Learner Requester</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 text-[#0B4F4B] animate-spin mx-auto mb-2" />
                      Loading refund requests...
                    </td>
                  </tr>
                ) : refunds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                      No refund records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  refunds.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-700">{ref.id.substring(0, 8)}...</td>
                      <td className="p-4 font-extrabold text-slate-900">{ref.requestedBy}</td>
                      <td className="p-4 font-black text-slate-900">{formatCurrency(ref.amountRupees)}</td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">{ref.reason || "N/A"}</td>
                      <td className="p-4">
                        <StatusBadge status={ref.status} size="sm" />
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{new Date(ref.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="p-4 text-right">
                        {ref.status === "REFUND_REQUESTED" && (
                          <button
                            onClick={() => setSelectedRefund(ref)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Review & Process</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing Page <span className="font-bold text-slate-900">{page}</span> of{" "}
              <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount} total requests)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Review Modal */}
        {selectedRefund && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <RotateCcw className="h-5 w-5" />
                  <h3 className="text-lg font-black text-slate-900">Process Refund</h3>
                </div>
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div><strong>Refund Amount:</strong> <span className="font-bold text-emerald-600">{formatCurrency(selectedRefund.amountRupees)}</span></div>
                  <div><strong>Requester:</strong> {selectedRefund.requestedBy}</div>
                  <div><strong>Reason:</strong> {selectedRefund.reason || "No reason specified"}</div>
                  <div><strong>Requested:</strong> {new Date(selectedRefund.createdAt).toLocaleString("en-IN")}</div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Rejection Reason (required if rejecting)</label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejecting this refund..."
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0B4F4B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  disabled={submitting || !rejectReason.trim()}
                  onClick={() => handleRejectRefund(selectedRefund.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Reject Claim
                </button>

                <button
                  disabled={submitting}
                  onClick={() => handleApproveRefund(selectedRefund.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  Approve & Disburse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

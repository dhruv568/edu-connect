"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, RotateCcw, CheckCircle2, XCircle, X } from "lucide-react";

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
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="admin@educonnect.com">
      <div className="space-y-6 pb-16">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Refund Governance & Audits
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Review student refund requests, approve via ledger operations, or document rejection reasons.
          </p>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">ALL REFUND STATUSES</option>
              <option value="REFUND_REQUESTED">PENDING REVIEW</option>
              <option value="REFUNDED">APPROVED / REFUNDED</option>
              <option value="REFUND_FAILED">REJECTED / FAILED</option>
            </select>
          </div>
        </Card>

        {/* Refunds Table */}
        <Card className="p-0 border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Refund ID</th>
                  <th className="p-4">Requested By</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto mb-2" />
                      Loading refund requests...
                    </td>
                  </tr>
                ) : refunds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                      No refund records found.
                    </td>
                  </tr>
                ) : (
                  refunds.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">{ref.id.substring(0, 8)}...</td>
                      <td className="p-4 font-extrabold text-slate-900 dark:text-slate-100">{ref.requestedBy}</td>
                      <td className="p-4 font-extrabold text-emerald-600">₹{ref.amountRupees.toFixed(2)}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{ref.reason || "N/A"}</td>
                      <td className="p-4">
                        <StatusBadge status={ref.status} size="sm" />
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{new Date(ref.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {ref.status === "REFUND_REQUESTED" && (
                          <GlassButton
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedRefund(ref)}
                            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                          >
                            Review & Process
                          </GlassButton>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing Page <span className="font-bold text-slate-900 dark:text-slate-100">{page}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span> ({totalCount} total requests)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Review Modal */}
        {selectedRefund && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Review Refund Request</h3>
                <button onClick={() => setSelectedRefund(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3">
                <div>
                  <span className="text-slate-400 block font-semibold">Requester</span>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{selectedRefund.requestedBy}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Refund Amount</span>
                  <div className="font-black text-emerald-600 text-base">₹{selectedRefund.amountRupees.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Stated Reason</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mt-1 border border-slate-100 dark:border-slate-700">
                    {selectedRefund.reason || "No detailed reason provided."}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rejection Reason (Required if rejecting)</label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejecting refund..."
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <GlassButton
                  variant="secondary"
                  className="text-red-400 border-red-500/30 hover:bg-red-500/20"
                  size="sm"
                  disabled={submitting || !rejectReason.trim()}
                  onClick={() => handleRejectRefund(selectedRefund.id)}
                  leftIcon={<XCircle className="h-4 w-4" />}
                >
                  Reject Request
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleApproveRefund(selectedRefund.id)}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Approve Refund
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

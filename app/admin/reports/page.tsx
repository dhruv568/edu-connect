"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Flag, CheckCircle2, XCircle, Eye, X } from "lucide-react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [targetFilter, setTargetFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail / Moderation modal state
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [actionTakenNote, setActionTakenNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [statusFilter, targetFilter, page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        status: statusFilter,
        targetType: targetFilter,
        page: String(page),
        limit: "10",
      });

      const res = await fetch(`/api/admin/reports?${query.toString()}`);
      const json = await res.json();

      if (json.data) {
        setReports(json.data.reports || []);
        setTotalPages(json.data.pagination?.totalPages || 1);
        setTotalCount(json.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED") => {
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reports/${selectedReport.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, actionTaken: actionTakenNote }),
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedReport(null);
        setActionTakenNote("");
        fetchReports();
      } else {
        alert(json.error?.message || "Failed to update report status.");
      }
    } catch (err) {
      console.error("Error updating report status:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="admin@educonnect.com">
      <div className="space-y-6 pb-16">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Content & User Report Moderation
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Review community reports for users, courses, reviews, live classes, and inappropriate content.
          </p>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="OPEN">OPEN / UNREVIEWED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">DISMISSED / REJECTED</option>
              </select>
            </div>

            <select
              value={targetFilter}
              onChange={(e) => {
                setTargetFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">ALL TARGET TYPES</option>
              <option value="USER">USER</option>
              <option value="TEACHER">TEACHER</option>
              <option value="COURSE">COURSE</option>
              <option value="REVIEW">REVIEW</option>
              <option value="LIVE_CLASS">LIVE CLASS</option>
              <option value="CONTENT">CONTENT</option>
            </select>
          </div>
        </Card>

        {/* Reports Table */}
        <Card className="p-0 border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Report Target</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reported Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto mb-2" />
                      Loading moderation reports...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                      No reports match your filters.
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {rep.targetType}
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-slate-100">{rep.targetId.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{rep.reporterName}</td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{rep.reason}</td>
                      <td className="p-4">
                        <StatusBadge status={rep.status} size="sm" />
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{new Date(rep.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <GlassButton
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedReport(rep)}
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          Moderate
                        </GlassButton>
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
              Showing Page <span className="font-bold text-slate-900 dark:text-slate-100">{page}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span> ({totalCount} total reports)
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

        {/* Report Moderation Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Moderate Report</h3>
                <button onClick={() => setSelectedReport(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block font-semibold">Target Type</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{selectedReport.targetType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Target ID</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{selectedReport.targetId}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold">Stated Reason</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{selectedReport.reason}</div>
                </div>

                {selectedReport.description && (
                  <div>
                    <span className="text-slate-400 block font-semibold">Detailed Description</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mt-1 border border-slate-100 dark:border-slate-700">
                      {selectedReport.description}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Action Note / Note Taken</label>
                <input
                  type="text"
                  value={actionTakenNote}
                  onChange={(e) => setActionTakenNote(e.target.value)}
                  placeholder="Details of action taken by admin..."
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleUpdateStatus("REJECTED")}
                  leftIcon={<XCircle className="h-4 w-4" />}
                >
                  Dismiss Report
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleUpdateStatus("RESOLVED")}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Mark Resolved
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

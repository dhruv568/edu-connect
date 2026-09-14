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
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  BookOpen,
} from "lucide-react";

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

  const statusTabs = [
    { label: "All Reports", value: "ALL" },
    { label: "Open / Unreviewed", value: "OPEN", badge: "Action" },
    { label: "Under Review", value: "UNDER_REVIEW" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Dismissed", value: "REJECTED" },
  ];

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
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="educonnects.com@gmail.com">
      <div className="space-y-6 pb-16">
        {/* Breadcrumb & Header */}
        <div>
          <AdminBreadcrumb
            items={[{ label: "Content" }, { label: "Content & User Reports" }]}
            className="mb-3"
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Content & User Reports
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                  {totalCount} Reports
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">
                Investigate reported content, abusive conduct, inappropriate courses, and platform compliance violations.
              </p>
            </div>

            <Link href="/admin/courses">
              <button className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs">
                Course Moderation Catalog
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
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none"
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
              className="h-10 px-3 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">ALL TARGET TYPES</option>
              <option value="USER">USER</option>
              <option value="TEACHER">EDUCATOR</option>
              <option value="COURSE">COURSE</option>
              <option value="REVIEW">REVIEW</option>
              <option value="LIVE_CLASS">LIVE CLASS</option>
              <option value="CONTENT">CONTENT</option>
            </select>
          </div>
        </Card>

        {/* Reports Table */}
        <Card className="p-0 border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Report Target</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reported Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 text-[#0B4F4B] animate-spin mx-auto mb-2" />
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
                    <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-slate-200 text-slate-800">
                            {rep.targetType === "TEACHER" ? "EDUCATOR" : rep.targetType}
                          </span>
                          <span className="font-mono text-slate-600 text-[11px]">{rep.targetId.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{rep.reporterName}</td>
                      <td className="p-4 font-semibold text-slate-800">{rep.reason}</td>
                      <td className="p-4">
                        <StatusBadge status={rep.status} size="sm" />
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {new Date(rep.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold inline-flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Investigate</span>
                        </button>
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
              <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount} total reports)
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

        {/* Report Moderation Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertOctagon className="h-5 w-5" />
                  <h3 className="text-lg font-black text-slate-900">Moderate Report</h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div><strong>Target:</strong> {selectedReport.targetType} (ID: {selectedReport.targetId})</div>
                  <div><strong>Reporter:</strong> {selectedReport.reporterName}</div>
                  <div><strong>Reason:</strong> {selectedReport.reason}</div>
                  <div><strong>Reported:</strong> {new Date(selectedReport.createdAt).toLocaleString("en-IN")}</div>
                </div>

                {selectedReport.description && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-slate-800">
                    <strong>Reporter Notes:</strong> {selectedReport.description}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Administrative Action Note</label>
                  <textarea
                    value={actionTakenNote}
                    onChange={(e) => setActionTakenNote(e.target.value)}
                    placeholder="Enter details of compliance investigation, warning issued, or dismissal rationale..."
                    className="w-full h-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0B4F4B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  disabled={submitting}
                  onClick={() => handleUpdateStatus("REJECTED")}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Dismiss Report
                </button>

                <div className="flex items-center gap-2">
                  <button
                    disabled={submitting}
                    onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                  >
                    Mark Under Review
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleUpdateStatus("RESOLVED")}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  >
                    Resolve & Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

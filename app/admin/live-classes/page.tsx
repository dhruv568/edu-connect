"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlassButton } from "@/components/glass/glass-button";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Video,
  Calendar,
  Clock,
  AlertTriangle,
  X,
  Radio,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Cancellation modal state
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const statusTabs = [
    { label: "All Classes", value: "ALL" },
    { label: "Live Now", value: "LIVE", badge: "Live" },
    { label: "Scheduled", value: "SCHEDULED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  useEffect(() => {
    fetchLiveClasses();
  }, [search, statusFilter, page]);

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(page),
        limit: "10",
      });

      const res = await fetch(`/api/admin/live-classes?${query.toString()}`);
      const json = await res.json();

      if (json.data) {
        setClasses(json.data.classes || []);
        setTotalPages(json.data.pagination?.totalPages || 1);
        setTotalCount(json.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch live classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSlot = async () => {
    if (!selectedSlot || !cancelReason.trim()) return;
    setSubmittingCancel(true);
    try {
      const res = await fetch(`/api/admin/live-classes/${selectedSlot.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL", reason: cancelReason }),
      });

      const json = await res.json();
      if (res.ok) {
        setSelectedSlot(null);
        setCancelReason("");
        fetchLiveClasses();
      } else {
        alert(json.error?.message || "Failed to cancel live class.");
      }
    } catch (err) {
      console.error("Error cancelling live class:", err);
    } finally {
      setSubmittingCancel(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="educonnects.com@gmail.com">
      <div className="space-y-6 pb-16">
        {/* Breadcrumb & Header */}
        <div>
          <AdminBreadcrumb
            items={[{ label: "Live" }, { label: "Live Classes" }]}
            className="mb-3"
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Live Operations & Classrooms
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                  {totalCount} Sessions
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">
                Monitor active, scheduled, completed, and cancelled interactive video classroom sessions.
              </p>
            </div>
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
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, subject, or educator..."
              className="w-full h-10 pl-10 pr-4 bg-slate-100 border-none rounded-2xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-[#0B4F4B]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
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
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="LIVE">LIVE NOW</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </Card>

        {/* Classes Table */}
        <Card className="p-0 border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Live Class Title</th>
                  <th className="p-4">Educator</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Enrollments</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 text-[#0B4F4B] animate-spin mx-auto mb-2" />
                      Loading live class schedule...
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                      No live classes match your filters.
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0B4F4B] flex items-center justify-center shrink-0">
                            <Video className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{cls.title}</div>
                            <div className="text-[11px] text-slate-500">{cls.subject}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{cls.teacherName}</td>
                      <td className="p-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {new Date(cls.startTime).toLocaleDateString("en-IN")}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] mt-0.5">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {new Date(cls.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {cls.bookedCount} / {cls.maxCapacity} Learners
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        {cls.price > 0 ? formatCurrency(cls.price) : "FREE"}
                      </td>
                      <td className="p-4">
                        <StatusBadge
                          status={cls.status === "LIVE" ? "ACTIVE" : cls.status === "SCHEDULED" ? "PENDING" : cls.status}
                          size="sm"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cls.status === "LIVE" && (
                            <Link href={`/classroom/${cls.id}`} target="_blank">
                              <button className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs">
                                <Radio className="h-3 w-3 animate-pulse" />
                                <span>Monitor Live</span>
                              </button>
                            </Link>
                          )}
                          {cls.status !== "CANCELLED" && cls.status !== "COMPLETED" && (
                            <button
                              onClick={() => setSelectedSlot(cls)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              <span>Cancel Slot</span>
                            </button>
                          )}
                        </div>
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
              <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount} total classes)
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

        {/* Cancellation Modal */}
        {selectedSlot && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-black text-slate-900">Cancel Live Class Slot</h3>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs space-y-2 text-slate-600">
                <p>
                  You are about to administratively cancel the session <strong>{selectedSlot.title}</strong> by educator <strong>{selectedSlot.teacherName}</strong>.
                </p>
                <p className="text-slate-500">
                  Enrolled learners will be notified and eligible for refund processing.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Provide an administrative reason (e.g., educator emergency, policy breach)..."
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0B4F4B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Keep Class
                </button>
                <button
                  disabled={submittingCancel || !cancelReason.trim()}
                  onClick={handleCancelSlot}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  {submittingCancel ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

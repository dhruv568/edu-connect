"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Video, Calendar, Clock, AlertTriangle, X } from "lucide-react";
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
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="admin@educonnect.com">
      <div className="space-y-6 pb-16">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Live Class Governance
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Monitor active, scheduled, completed, and cancelled live classes across educators.
          </p>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by class title, subject, or teacher..."
              className="w-full h-10 pl-10 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
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
              className="h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
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
        <Card className="p-0 border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Live Class Title</th>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Enrollments</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto mb-2" />
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
                    <tr key={cls.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Video className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-slate-100">{cls.title}</div>
                            <div className="text-[11px] text-slate-500">{cls.subject}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{cls.teacherName}</td>
                      <td className="p-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {new Date(cls.startTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] mt-0.5">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {cls.bookedCount} / {cls.maxCapacity}
                      </td>
                      <td className="p-4 font-extrabold text-emerald-600">
                        {cls.price > 0 ? formatCurrency(cls.price) : "FREE"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={cls.status} size="sm" />
                      </td>
                      <td className="p-4 text-right">
                        {cls.status !== "CANCELLED" && cls.status !== "COMPLETED" && (
                          <GlassButton
                            variant="secondary"
                            className="text-red-400 border-red-500/30 hover:bg-red-500/20"
                            size="sm"
                            onClick={() => setSelectedSlot(cls)}
                            leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}
                          >
                            Cancel Class
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
              Showing Page <span className="font-bold text-slate-900 dark:text-slate-100">{page}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span> ({totalCount} total classes)
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

        {/* Cancellation Modal */}
        {selectedSlot && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Cancel Live Class</h3>
                <button onClick={() => setSelectedSlot(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <p>Are you sure you want to cancel <strong>{selectedSlot.title}</strong> by {selectedSlot.teacherName}?</p>
                <p className="text-amber-600 font-semibold">This will automatically notify all enrolled students and trigger appropriate refunds.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cancellation Reason</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <GlassButton variant="secondary" size="sm" onClick={() => setSelectedSlot(null)}>
                  Back
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  className="text-red-400 border-red-500/30 hover:bg-red-500/20"
                  size="sm"
                  disabled={submittingCancel || !cancelReason.trim()}
                  onClick={handleCancelSlot}
                >
                  Confirm Cancellation
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

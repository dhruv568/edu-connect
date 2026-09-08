"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Archive,
  Eye,
  Search,
  Shield,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatCurrency } from "@/lib/currency";
import { PermissionProvider, PermissionGuard } from "@/components/shared/permission-guard";
import { BackButton } from "@/components/ui/back-button";

export default function AdminCoursesModerationPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAdminCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (data.success) {
        setCourses(data.data.courses || []);
      }
    } catch (err) {
      console.error("Failed to load admin courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminCourses();
  }, []);

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    setActionLoading((prev) => ({ ...prev, [courseId]: true }));
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const message = data.error || data.message || "Failed to update course status.";
        setErrorMsg(`Course Moderation Failed: ${message}`);
      } else {
        setSuccessMsg(`Course status updated to '${newStatus}' successfully.`);
        await fetchAdminCourses();
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setErrorMsg(err.message || "Network error while updating status.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete course "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAdminCourses();
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  const filtered = courses.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.teacherName.toLowerCase().includes(q) ||
      c.teacherEmail.toLowerCase().includes(q)
    );
  });

  return (
    <PermissionProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
        <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <BackButton
              fallbackUrl="/admin"
              label="Back to Dashboard"
              variant="dark"
              className="mb-3"
            />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-50 flex items-center gap-2">
              <Shield className="w-7 h-7 text-blue-500" /> Admin Course Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review and moderate all pre-recorded courses across the EduConnects platform.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 outline-none"
            />
          </div>
        </div>

        {/* Error / Success Feedback Banners */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-xs text-rose-400 font-bold hover:underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-400 font-bold hover:underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Courses Moderation Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 rounded-xl bg-slate-900 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
            No courses found matching criteria.
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Course</th>
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Subject & Price</th>
                    <th className="p-4">Metrics</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-850/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-100">{c.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">/courses/{c.slug}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{c.teacherName}</div>
                        <div className="text-[11px] text-slate-500">{c.teacherEmail || ""}</div>
                      </td>
                      <td className="p-4">
                        <div>{c.subject}</div>
                        <div className="font-bold text-slate-100">
                          {c.price === 0 ? "FREE" : formatCurrency(c.price)}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div>{c.sectionsCount ?? 0} Sections ({c.totalLessons ?? 0} Lessons)</div>
                        <div>{c.enrollmentCount ?? c.enrollmentsCount ?? 0} Enrollments</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                            c.status === "PUBLISHED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : c.status === "DRAFT"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/courses/${c.slug}/preview`}
                            target="_blank"
                            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                            title="Preview Course"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {c.status !== "PUBLISHED" && (
                            <PermissionGuard permission="courses.approve">
                              <button
                                onClick={() => handleStatusChange(c.id, "PUBLISHED")}
                                disabled={actionLoading[c.id]}
                                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition"
                              >
                                {actionLoading[c.id] ? "Updating..." : "Approve & Publish"}
                              </button>
                            </PermissionGuard>
                          )}

                          {c.status === "PUBLISHED" && (
                            <PermissionGuard permission="courses.reject">
                              <button
                                onClick={() => handleStatusChange(c.id, "UNPUBLISHED")}
                                disabled={actionLoading[c.id]}
                                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white transition"
                              >
                                {actionLoading[c.id] ? "Updating..." : "Unpublish"}
                              </button>
                            </PermissionGuard>
                          )}

                          {c.status !== "ARCHIVED" && (
                            <PermissionGuard permission="courses.reject">
                              <button
                                onClick={() => handleStatusChange(c.id, "ARCHIVED")}
                                disabled={actionLoading[c.id]}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 disabled:opacity-50"
                                title="Archive Course"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </PermissionGuard>
                          )}

                          <PermissionGuard permission="courses.delete">
                            <button
                              onClick={() => handleDeleteCourse(c.id, c.title)}
                              disabled={actionLoading[c.id]}
                              className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 disabled:opacity-50"
                              title="Delete Course Permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

        <Footer />
      </div>
    </PermissionProvider>
  );
}

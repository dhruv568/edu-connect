"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { GlassButton } from "@/components/glass/glass-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, ShieldCheck, Activity, Server, AlertTriangle, ArrowRight, CheckCircle2, XCircle, AlertOctagon, Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    pendingVerifications: 0,
    verifiedTeachers: 0,
    rejectedTeachers: 0,
    suspendedTeachers: 0,
  });

  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [mRes, qRes] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/verification?status=PENDING"),
      ]);

      const mJson = await mRes.json();
      const qJson = await qRes.json();

      if (mJson.data?.metrics) setMetrics(mJson.data.metrics);
      if (qJson.data?.queue) setQueue(qJson.data.queue);
    } catch (err) {
      console.error("Failed to load admin dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="admin@educonnect.com">
      <div className="space-y-8 pb-16">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Admin System Governance</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">Platform overview, user statistics, and active teacher verifications.</p>
        </div>

        {/* System Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="space-y-2 border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Platform Users</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{loading ? "..." : metrics.totalUsers}</div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span>Teachers: {metrics.totalTeachers}</span> • <span>Students: {metrics.totalStudents}</span>
            </div>
          </Card>

          <Card className="space-y-2 border-amber-200 bg-amber-50/40 shadow-xs">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-extrabold uppercase tracking-wider">Pending Verifications</span>
              <ShieldCheck className="h-4 w-4 text-amber-600 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-amber-950">{loading ? "..." : metrics.pendingVerifications}</div>
            <p className="text-[11px] text-amber-800 font-bold">Action Required by Governance</p>
          </Card>

          <Card className="space-y-2 border-emerald-200 bg-emerald-50/40 shadow-xs">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-extrabold uppercase tracking-wider">Verified Educators</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950">{loading ? "..." : metrics.verifiedTeachers}</div>
            <p className="text-[11px] text-emerald-800 font-bold">Live on Marketplace</p>
          </Card>

          <Card className="space-y-2 border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Rejected / Suspended</span>
              <AlertOctagon className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {loading ? "..." : metrics.rejectedTeachers + metrics.suspendedTeachers}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span>Rejected: {metrics.rejectedTeachers}</span> • <span>Suspended: {metrics.suspendedTeachers}</span>
            </div>
          </Card>
        </div>

        {/* Priority Pending Verification Queue Preview */}
        <Card className="space-y-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Pending Verification Queue</h3>
              <p className="text-xs text-slate-500">Oldest unreviewed teacher applications prioritized first</p>
            </div>
            <Link href="/admin/verification">
              <GlassButton variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View Full Queue ({metrics.pendingVerifications})
              </GlassButton>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            </div>
          ) : queue.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700">Verification Queue Clear</div>
              <p className="text-xs text-slate-500 mt-0.5">No pending teacher applications awaiting review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.slice(0, 4).map((item) => (
                <div
                  key={item.teacherProfileId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                        <StatusBadge status={item.verificationStatus} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.headline} • {item.subjects.join(", ")} • {item.experienceYears} Years Exp.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                      <div>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</div>
                      <div>{item.documentCount} Documents • {item.qualificationCount} Degrees</div>
                    </div>
                    <Link href={`/admin/verification/${item.teacherProfileId}`}>
                      <GlassButton variant="secondary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                        Review Application
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

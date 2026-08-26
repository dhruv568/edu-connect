"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { GlassButton } from "@/components/glass/glass-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/analytics/metric-card";
import {
  Users,
  ShieldCheck,
  Activity,
  Server,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  Loader2,
  DollarSign,
  BookOpen,
  BarChart2,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    pendingVerifications: 0,
    verifiedTeachers: 0,
    rejectedTeachers: 0,
    suspendedTeachers: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalLiveClasses: 0,
  });

  const [financials, setFinancials] = useState({
    grossRevenueRupees: 0,
    platformCommissionRupees: 0,
    teacherEarningsRupees: 0,
    refundsRupees: 0,
    netPlatformRevenueRupees: 0,
  });

  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dRes, qRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/verification?status=PENDING"),
      ]);

      const dJson = await dRes.json();
      const qJson = await qRes.json();

      if (dJson.data?.metrics) setMetrics(dJson.data.metrics);
      if (dJson.data?.financials) setFinancials(dJson.data.financials);
      if (qJson.data?.queue) setQueue(qJson.data.queue);
    } catch (err) {
      console.error("Failed to load admin dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator">
      <div className="space-y-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Admin Governance & Operations
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              Real-time platform overview, user statistics, financial ledger, and teacher verifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/analytics">
              <GlassButton variant="primary" size="sm" rightIcon={<BarChart2 className="h-4 w-4" />}>
                Platform Analytics
              </GlassButton>
            </Link>
            <Link href="/admin/system-health">
              <GlassButton variant="secondary" size="sm" rightIcon={<Server className="h-4 w-4" />}>
                System Health
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* System Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Platform Users"
            value={loading ? "..." : metrics.totalUsers}
            subtitle={`Teachers: ${metrics.totalTeachers} • Students: ${metrics.totalStudents}`}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            variant="blue"
          />

          <MetricCard
            title="Pending Verifications"
            value={loading ? "..." : metrics.pendingVerifications}
            subtitle="Action required by admin"
            icon={<ShieldCheck className="h-5 w-5 text-amber-600" />}
            variant="amber"
          />

          <MetricCard
            title="Gross Revenue"
            value={loading ? "..." : `₹${financials.grossRevenueRupees.toLocaleString()}`}
            subtitle={`Commission: ₹${financials.platformCommissionRupees.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            variant="emerald"
          />

          <MetricCard
            title="Active Published Courses"
            value={loading ? "..." : metrics.publishedCourses}
            subtitle={`Total Courses: ${metrics.totalCourses}`}
            icon={<BookOpen className="h-5 w-5 text-purple-600" />}
            variant="purple"
          />
        </div>

        {/* Priority Pending Verification Queue Preview */}
        <Card className="space-y-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Pending Verification Queue
              </h3>
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
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Verification Queue Clear</div>
              <p className="text-xs text-slate-500 mt-0.5">No pending teacher applications awaiting review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.slice(0, 4).map((item) => (
                <div
                  key={item.teacherProfileId}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{item.name}</h4>
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

        {/* Admin Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/admin/analytics">
            <Card className="p-5 hover:border-blue-500 transition cursor-pointer space-y-2">
              <BarChart2 className="h-6 w-6 text-blue-600" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Revenue & Growth Analytics</h4>
              <p className="text-xs text-slate-500">View platform trends, date filters, and top courses.</p>
            </Card>
          </Link>

          <Link href="/admin/activity">
            <Card className="p-5 hover:border-purple-500 transition cursor-pointer space-y-2">
              <Activity className="h-6 w-6 text-purple-600" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Platform Activity Logs</h4>
              <p className="text-xs text-slate-500">Audit user actions, purchases, and verifications.</p>
            </Card>
          </Link>

          <Link href="/admin/system-health">
            <Card className="p-5 hover:border-emerald-500 transition cursor-pointer space-y-2">
              <Server className="h-6 w-6 text-emerald-600" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">System Operational Health</h4>
              <p className="text-xs text-slate-500">Check DB, Razorpay, LiveKit, and Mux status.</p>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

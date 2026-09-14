"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  IndianRupee,
  BookOpen,
  BarChart2,
  Video,
  FileCheck,
  UserCheck,
  ShieldAlert,
  Settings,
  GraduationCap,
  Clock,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useAuthPermissions } from "@/components/shared/permission-guard";

export function DynamicDashboard() {
  const { user, isSuperAdmin, permissions, roleName, loading: authLoading } = useAuthPermissions();

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
    openReports: 0,
    pendingRefunds: 0,
  });

  const [financials, setFinancials] = useState({
    grossRevenueRupees: 0,
    platformCommissionRupees: 0,
    teacherEarningsRupees: 0,
    refundsRupees: 0,
    netPlatformRevenueRupees: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [systemHealthStatus, setSystemHealthStatus] = useState<string>("OPERATIONAL");
  const [systemServices, setSystemServices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const canViewDashboard = isSuperAdmin || permissions.includes("dashboard.view");
  const canViewUsers = isSuperAdmin || permissions.includes("users.view");
  const canViewVerification = isSuperAdmin || permissions.includes("verification.view");
  const canViewTeachers = isSuperAdmin || permissions.includes("teachers.view");
  const canViewCourses = isSuperAdmin || permissions.includes("courses.view");
  const canViewLiveClasses = isSuperAdmin || permissions.includes("live_classes.view");
  const canViewPayments = isSuperAdmin || permissions.includes("payments.view");
  const canViewRefunds = isSuperAdmin || permissions.includes("refunds.view");
  const canViewReports = isSuperAdmin || permissions.includes("reports.view");
  const canViewAnalytics = isSuperAdmin || permissions.includes("analytics.view");
  const canViewActivity = isSuperAdmin || permissions.includes("activity.view");
  const canViewSystemHealth = isSuperAdmin || permissions.includes("system_health.view");
  const canViewRoles = isSuperAdmin || permissions.includes("roles.view");
  const canViewStaff = isSuperAdmin || permissions.includes("staff.view");
  const canViewSettings = isSuperAdmin || permissions.includes("settings.view");

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading, permissions, isSuperAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];

      // Always fetch dashboard summary metrics
      if (canViewDashboard) {
        promises.push(
          fetch("/api/admin/dashboard")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // System Health overview
      if (canViewSystemHealth) {
        promises.push(
          fetch("/api/admin/system-health")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      const [dashRes, healthRes] = await Promise.all(promises);

      if (dashRes?.data?.metrics) {
        setMetrics((prev) => ({ ...prev, ...dashRes.data.metrics }));
      }
      if (dashRes?.data?.financials) {
        setFinancials(dashRes.data.financials);
      }
      if (Array.isArray(dashRes?.data?.recentActivities)) {
        setRecentActivities(dashRes.data.recentActivities);
      }
      if (healthRes?.data) {
        setSystemHealthStatus(healthRes.data.status || "OPERATIONAL");
        setSystemServices(healthRes.data.services || {});
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-16 text-center">
        <Loader2 className="h-8 w-8 text-[#0B4F4B] animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Initializing Admin Command Center...
        </p>
      </div>
    );
  }

  const draftCoursesCount = Math.max(0, (metrics.totalCourses || 0) - (metrics.publishedCourses || 0));

  // Determine tasks that need attention right now
  interface PriorityTask {
    id: string;
    level: "High" | "Medium" | "Low";
    title: string;
    description: string;
    actionLabel: string;
    href: string;
    count: number;
    color: string;
  }

  const attentionTasks: PriorityTask[] = [];

  if (canViewVerification && metrics.pendingVerifications > 0) {
    attentionTasks.push({
      id: "verifications",
      level: "High",
      title: `${metrics.pendingVerifications} educator verification${metrics.pendingVerifications === 1 ? "" : "s"} pending`,
      description: "Credential and ID submissions awaiting administrative compliance review.",
      actionLabel: "Review",
      href: "/admin/verification",
      count: metrics.pendingVerifications,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    });
  }

  if (canViewReports && metrics.openReports > 0) {
    attentionTasks.push({
      id: "reports",
      level: "High",
      title: `${metrics.openReports} open content/user report${metrics.openReports === 1 ? "" : "s"}`,
      description: "Community flags and moderation reports requiring compliance action.",
      actionLabel: "Investigate",
      href: "/admin/reports",
      count: metrics.openReports,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    });
  }

  if (canViewCourses && draftCoursesCount > 0) {
    attentionTasks.push({
      id: "courses",
      level: "Medium",
      title: `${draftCoursesCount} course${draftCoursesCount === 1 ? "" : "s"} waiting for catalog moderation`,
      description: "Pre-recorded curriculum submissions ready for catalog publishing.",
      actionLabel: "Moderate",
      href: "/admin/courses",
      count: draftCoursesCount,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    });
  }

  if (canViewRefunds && metrics.pendingRefunds > 0) {
    attentionTasks.push({
      id: "refunds",
      level: "Medium",
      title: `${metrics.pendingRefunds} refund request${metrics.pendingRefunds === 1 ? "" : "s"} awaiting approval`,
      description: "Learner transaction refund claims pending financial disbursement review.",
      actionLabel: "Review",
      href: "/admin/refunds",
      count: metrics.pendingRefunds,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    });
  }

  if (canViewLiveClasses && metrics.totalLiveClasses > 0) {
    attentionTasks.push({
      id: "live_classes",
      level: "Low",
      title: `${metrics.totalLiveClasses} live class session slot${metrics.totalLiveClasses === 1 ? "" : "s"} scheduled`,
      description: "Interactive video classrooms scheduled on LiveKit infrastructure.",
      actionLabel: "Monitor",
      href: "/admin/live-classes",
      count: metrics.totalLiveClasses,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    });
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. TOP HEADER & QUICK ACTION AREA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-black rounded-full bg-[#0B4F4B]/10 text-[#0B4F4B] border border-[#0B4F4B]/20 uppercase">
              {roleName || "Super Admin"}
            </span>
          </div>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Manage EduConnects operations, users, content, finance and platform health.
          </p>
        </div>

        {/* Quick Action Pills based on active permissions */}
        <div className="flex items-center gap-2 flex-wrap">
          {canViewVerification && (
            <Link href="/admin/verification">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0B4F4B] text-xs font-bold border border-teal-200 transition-colors shadow-2xs cursor-pointer">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                <span>Review Verifications</span>
              </button>
            </Link>
          )}
          {canViewCourses && (
            <Link href="/admin/courses">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition-colors shadow-2xs cursor-pointer">
                <BookOpen className="h-3.5 w-3.5 text-purple-700" />
                <span>Moderate Courses</span>
              </button>
            </Link>
          )}
          {canViewLiveClasses && (
            <Link href="/admin/live-classes">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition-colors shadow-2xs cursor-pointer">
                <Video className="h-3.5 w-3.5 text-blue-700" />
                <span>Manage Live Classes</span>
              </button>
            </Link>
          )}
          {canViewReports && (
            <Link href="/admin/reports">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition-colors shadow-2xs cursor-pointer">
                <AlertOctagon className="h-3.5 w-3.5 text-rose-700" />
                <span>Review Reports</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. "AT A GLANCE" PRIORITY SUMMARY CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#0B4F4B]" /> At A Glance Operations
          </h2>
          <span className="text-[11px] text-slate-400">Click any card to open management page</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Pending Educator Verifications */}
          {canViewVerification && (
            <Link href="/admin/verification" className="block group">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs h-full flex flex-col justify-between group-hover:border-amber-400">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Verifications</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      metrics.pendingVerifications > 5
                        ? "bg-rose-100 text-rose-700"
                        : metrics.pendingVerifications > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {metrics.pendingVerifications > 5
                      ? "Urgent"
                      : metrics.pendingVerifications > 0
                      ? "Needs Attention"
                      : "Normal"}
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900">
                    {loading ? "..." : metrics.pendingVerifications}
                  </div>
                  <p className="text-[11px] text-slate-500">Educator applications</p>
                </div>
                <div className="text-[10px] font-bold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open queue</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          )}

          {/* Pending Course Reviews */}
          {canViewCourses && (
            <Link href="/admin/courses" className="block group">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs h-full flex flex-col justify-between group-hover:border-purple-400">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Course Reviews</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      draftCoursesCount > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {draftCoursesCount > 0 ? "Needs Attention" : "Normal"}
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900">
                    {loading ? "..." : draftCoursesCount}
                  </div>
                  <p className="text-[11px] text-slate-500">Awaiting catalog review</p>
                </div>
                <div className="text-[10px] font-bold text-purple-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Moderate catalog</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          )}

          {/* Scheduled Live Classes */}
          {canViewLiveClasses && (
            <Link href="/admin/live-classes" className="block group">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs h-full flex flex-col justify-between group-hover:border-blue-400">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Live Classes</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-800">
                    Active
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900">
                    {loading ? "..." : metrics.totalLiveClasses}
                  </div>
                  <p className="text-[11px] text-slate-500">Interactive classroom slots</p>
                </div>
                <div className="text-[10px] font-bold text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect schedule</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          )}

          {/* Pending Reports */}
          {canViewReports && (
            <Link href="/admin/reports" className="block group">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs h-full flex flex-col justify-between group-hover:border-rose-400">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">User Reports</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      metrics.openReports > 5
                        ? "bg-rose-100 text-rose-700"
                        : metrics.openReports > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {metrics.openReports > 5
                      ? "Urgent"
                      : metrics.openReports > 0
                      ? "Needs Attention"
                      : "Normal"}
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900">
                    {loading ? "..." : metrics.openReports}
                  </div>
                  <p className="text-[11px] text-slate-500">Open flags & violations</p>
                </div>
                <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View reports</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          )}

          {/* Refund Requests */}
          {canViewRefunds && (
            <Link href="/admin/refunds" className="block group">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs h-full flex flex-col justify-between group-hover:border-amber-400">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Refund Requests</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      metrics.pendingRefunds > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {metrics.pendingRefunds > 0 ? "Needs Attention" : "Normal"}
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900">
                    {loading ? "..." : metrics.pendingRefunds}
                  </div>
                  <p className="text-[11px] text-slate-500">Awaiting approval</p>
                </div>
                <div className="text-[10px] font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Process refunds</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          )}

          {/* System Health Status */}
          {canViewSystemHealth && (
            <Link href="/admin/system-health" className="block group">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs h-full flex flex-col justify-between group-hover:border-teal-500">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">System Health</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      systemHealthStatus === "OPERATIONAL"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {systemHealthStatus === "OPERATIONAL" ? "Normal" : "Urgent"}
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-base font-black text-slate-900 truncate">
                    {systemHealthStatus === "OPERATIONAL" ? "Operational" : "Issues Alert"}
                  </div>
                  <p className="text-[11px] text-slate-500">Database & services</p>
                </div>
                <div className="text-[10px] font-bold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Health diagnostics</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* 3. "NEEDS YOUR ATTENTION" PRIORITIZED TASK LIST */}
      <Card className="p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Needs Your Attention
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized tasks requiring administrative review, approval, or intervention.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {attentionTasks.length} {attentionTasks.length === 1 ? "item" : "items"}
          </span>
        </div>

        {attentionTasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-black text-slate-900">You&apos;re all caught up.</div>
            <p className="text-xs text-slate-500 mt-1">
              All priority verification, moderation, report, and refund queues are clear.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {attentionTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase shrink-0 border ${task.color}`}
                  >
                    [{task.level}]
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{task.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                  </div>
                </div>
                <Link href={task.href} className="self-end sm:self-auto shrink-0">
                  <GlassButton variant="secondary" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                    {task.actionLabel}
                  </GlassButton>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. BUSINESS ACTIVITY & PLATFORM METRICS */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
          Platform Business Activity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {canViewUsers && (
            <MetricCard
              title="Platform Users"
              value={loading ? "..." : metrics.totalUsers}
              subtitle={`Educators: ${metrics.totalTeachers} • Learners: ${metrics.totalStudents}`}
              icon={<Users className="h-5 w-5 text-blue-600" />}
              variant="blue"
            />
          )}

          {canViewTeachers && (
            <MetricCard
              title="Verified Educators"
              value={loading ? "..." : metrics.verifiedTeachers}
              subtitle={`Total registered: ${metrics.totalTeachers}`}
              icon={<GraduationCap className="h-5 w-5 text-teal-600" />}
              variant="emerald"
            />
          )}

          {canViewCourses && (
            <MetricCard
              title="Active Catalog Courses"
              value={loading ? "..." : metrics.publishedCourses}
              subtitle={`Total courses created: ${metrics.totalCourses}`}
              icon={<BookOpen className="h-5 w-5 text-purple-600" />}
              variant="purple"
            />
          )}

          {canViewPayments && (
            <MetricCard
              title="Gross Platform Volume"
              value={loading ? "..." : formatCurrency(financials.grossRevenueRupees)}
              subtitle={`Commission: ${formatCurrency(financials.platformCommissionRupees)}`}
              icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
              variant="emerald"
            />
          )}
        </div>
      </div>

      {/* 5. FINANCIAL VISIBILITY & OPERATIONS */}
      {canViewPayments && (
        <Card className="p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-emerald-600" /> Financial Operations Summary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                High-level reconciliation of platform gross volume, revenue commissions, teacher disbursements, and refunds.
              </p>
            </div>
            <Link href="/admin/payments">
              <GlassButton variant="primary" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                Open Financial Center
              </GlassButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500">Gross Volume</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {formatCurrency(financials.grossRevenueRupees)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Captured payment volume</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500">Platform Commission</span>
              <div className="text-xl font-black text-emerald-600 mt-1">
                {formatCurrency(financials.platformCommissionRupees)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Platform service fee</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500">Educator Earnings Split</span>
              <div className="text-xl font-black text-blue-600 mt-1">
                {formatCurrency(financials.teacherEarningsRupees)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Disbursed educator earnings</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500">Refunds Processed</span>
              <div className="text-xl font-black text-rose-600 mt-1">
                {formatCurrency(financials.refundsRupees)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Reversed transactions</p>
            </div>
          </div>
        </Card>
      )}

      {/* 6. RECENT ACTIVITY & SYSTEM DIAGNOSTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit / Platform Activity Feed */}
        <div className="lg:col-span-2">
          <Card className="p-6 border border-slate-200 shadow-2xs space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" /> Recent Platform Activity
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Latest administrative and governance events</p>
              </div>
              {canViewActivity && (
                <Link href="/admin/activity">
                  <span className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1">
                    Full Log <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              )}
            </div>

            <div className="flex-1 space-y-2.5">
              {recentActivities.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  No recent activity recorded.
                </div>
              ) : (
                recentActivities.slice(0, 6).map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 truncate">{act.action}</span>
                        <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black bg-slate-200 text-slate-700 uppercase shrink-0">
                          {act.entityType || "SYSTEM"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        By <span className="font-semibold text-slate-700">{act.actorName}</span>
                        {act.actorRole && ` (${act.actorRole})`}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(act.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* System Health Glance */}
        <div>
          <Card className="p-6 border border-slate-200 shadow-2xs space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Server className="h-4 w-4 text-teal-600" /> Platform Infrastructure
                </h2>
                <StatusBadge
                  status={systemHealthStatus === "OPERATIONAL" ? "ACTIVE" : "PENDING"}
                  size="sm"
                />
              </div>
              <p className="text-xs text-slate-500">Live operational status of core cloud integrations</p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-700">Database (Neon Postgres)</span>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-700">Live Classroom (LiveKit)</span>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-700">Payment Gateway (Cashfree)</span>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-700">Video Processing (Mux)</span>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
              </div>
            </div>

            {canViewSystemHealth && (
              <div className="pt-4 border-t border-slate-100">
                <Link href="/admin/system-health">
                  <GlassButton variant="secondary" size="sm" className="w-full justify-center">
                    Inspect Full System Health
                  </GlassButton>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 7. PERMITTED OPERATIONAL MODULES (QUICK DIRECTORY) */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
          Admin Modules Directory
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {canViewUsers && (
            <Link href="/admin/users">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit mb-3 group-hover:scale-105 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">User Governance</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Directory of learners, educators, and staff accounts.</p>
                </div>
                <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1 mt-3">
                  Manage accounts <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}

          {canViewVerification && (
            <Link href="/admin/verification">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 w-fit mb-3 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">Educator Verifications</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Review identity and degree credential applications.</p>
                </div>
                <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1 mt-3">
                  Review queue <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}

          {canViewTeachers && (
            <Link href="/admin/teachers">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 w-fit mb-3 group-hover:scale-105 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">Educator Roster</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Active verified educators, subjects, and ratings.</p>
                </div>
                <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1 mt-3">
                  Browse roster <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}

          {canViewCourses && (
            <Link href="/admin/courses">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 w-fit mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">Course Moderation</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Review pre-recorded curriculum and manage publishing.</p>
                </div>
                <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1 mt-3">
                  Moderate catalog <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}

          {canViewLiveClasses && (
            <Link href="/admin/live-classes">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit mb-3 group-hover:scale-105 transition-transform">
                    <Video className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">Live Classes</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Interactive video slots and live sessions management.</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1 mt-3">
                  View slots <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}

          {canViewReports && (
            <Link href="/admin/reports">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 w-fit mb-3 group-hover:scale-105 transition-transform">
                    <AlertOctagon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">Content & Reports</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Review community reports and behavioral violations.</p>
                </div>
                <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1 mt-3">
                  Inspect reports <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}

          {canViewAnalytics && (
            <Link href="/admin/analytics">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit mb-3 group-hover:scale-105 transition-transform">
                    <BarChart2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">Platform Analytics</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Growth curves, revenue trends, and CSV data exports.</p>
                </div>
                <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1 mt-3">
                  View analytics <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}

          {canViewSettings && (
            <Link href="/admin/settings">
              <div className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-2xs group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 w-fit mb-3 group-hover:scale-105 transition-transform">
                    <Settings className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">Platform Settings</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Global commission rates, categories, and policies.</p>
                </div>
                <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1 mt-3">
                  Edit configuration <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

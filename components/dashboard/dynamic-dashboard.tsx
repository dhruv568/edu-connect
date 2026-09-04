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
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useAuthPermissions, PermissionGuard } from "@/components/shared/permission-guard";

export function DynamicDashboard() {
  const { user, isSuperAdmin, features, permissions, roleName, loading: authLoading } = useAuthPermissions();

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
  });

  const [financials, setFinancials] = useState({
    grossRevenueRupees: 0,
    platformCommissionRupees: 0,
    teacherEarningsRupees: 0,
    refundsRupees: 0,
    netPlatformRevenueRupees: 0,
  });

  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [coursesQueue, setCoursesQueue] = useState<any[]>([]);
  const [reportsQueue, setReportsQueue] = useState<any[]>([]);
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

      // Always fetch dashboard summary metrics if user has dashboard permission
      if (canViewDashboard) {
        promises.push(
          fetch("/api/admin/dashboard")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Verification queue
      if (canViewVerification) {
        promises.push(
          fetch("/api/admin/verification?status=PENDING")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Courses moderation preview
      if (canViewCourses) {
        promises.push(
          fetch("/api/admin/courses?status=DRAFT&limit=4")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Reports queue preview
      if (canViewReports) {
        promises.push(
          fetch("/api/admin/reports?status=OPEN&limit=4")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      const [dashRes, verifRes, coursesRes, reportsRes] = await Promise.all(promises);

      if (dashRes?.data?.metrics) {
        setMetrics((prev) => ({ ...prev, ...dashRes.data.metrics }));
      }
      if (dashRes?.data?.financials) {
        setFinancials(dashRes.data.financials);
      }
      if (verifRes?.data?.queue) {
        setVerificationQueue(verifRes.data.queue);
      }
      if (coursesRes?.data?.courses) {
        setCoursesQueue(coursesRes.data.courses);
      }
      if (reportsRes?.data?.reports) {
        setReportsQueue(reportsRes.data.reports);
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
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Initializing your portal...</p>
      </div>
    );
  }

  // Count active visible cards to determine grid layouts
  const visibleMetricCardsCount = [
    canViewUsers,
    canViewVerification,
    canViewPayments,
    canViewCourses,
    canViewLiveClasses,
  ].filter(Boolean).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {roleName || "Staff"} Operations & Governance
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase">
              {roleName}
            </span>
          </div>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">
            Tailored administrative sub-dashboard. Widgets and operations are dynamically generated according to your assigned permissions.
          </p>
        </div>

        {/* Quick Header Actions based on permissions */}
        <div className="flex items-center gap-2 flex-wrap">
          {canViewAnalytics && (
            <Link href="/admin/analytics">
              <GlassButton variant="primary" size="sm" rightIcon={<BarChart2 className="h-4 w-4" />}>
                Analytics
              </GlassButton>
            </Link>
          )}
          {canViewSystemHealth && (
            <Link href="/admin/system-health">
              <GlassButton variant="secondary" size="sm" rightIcon={<Server className="h-4 w-4" />}>
                System Health
              </GlassButton>
            </Link>
          )}
          {canViewRoles && (
            <Link href="/admin/roles">
              <GlassButton variant="secondary" size="sm" rightIcon={<ShieldAlert className="h-4 w-4" />}>
                Roles
              </GlassButton>
            </Link>
          )}
          {canViewStaff && (
            <Link href="/admin/staff">
              <GlassButton variant="secondary" size="sm" rightIcon={<UserCheck className="h-4 w-4" />}>
                Staff
              </GlassButton>
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic Metrics Cards: Rendered ONLY if the user has corresponding permissions */}
      {visibleMetricCardsCount > 0 ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(4, Math.max(1, visibleMetricCardsCount))} gap-6`}>
          {canViewUsers && (
            <MetricCard
              title="Platform Users"
              value={loading ? "..." : metrics.totalUsers}
              subtitle={`Teachers: ${metrics.totalTeachers} • Students: ${metrics.totalStudents}`}
              icon={<Users className="h-5 w-5 text-blue-600" />}
              variant="blue"
            />
          )}

          {canViewVerification && (
            <MetricCard
              title="Pending Verifications"
              value={loading ? "..." : metrics.pendingVerifications}
              subtitle="Educator applications awaiting review"
              icon={<ShieldCheck className="h-5 w-5 text-amber-600" />}
              variant="amber"
            />
          )}

          {canViewPayments && (
            <MetricCard
              title="Gross Revenue"
              value={loading ? "..." : formatCurrency(financials.grossRevenueRupees)}
              subtitle={`Commission: ${formatCurrency(financials.platformCommissionRupees)}`}
              icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
              variant="emerald"
            />
          )}

          {canViewCourses && (
            <MetricCard
              title="Active Courses"
              value={loading ? "..." : metrics.publishedCourses}
              subtitle={`Total Courses in catalog: ${metrics.totalCourses}`}
              icon={<BookOpen className="h-5 w-5 text-purple-600" />}
              variant="purple"
            />
          )}

          {canViewLiveClasses && (
            <MetricCard
              title="Scheduled Live Classes"
              value={loading ? "..." : metrics.totalLiveClasses}
              subtitle="Active interactive classroom slots"
              icon={<Video className="h-5 w-5 text-indigo-600" />}
              variant="blue"
            />
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Welcome to EduConnect. Select a feature from the sidebar to begin.
          </p>
        </div>
      )}

      {/* Dynamic Priority Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue (renders ONLY if user has verification.view) */}
        {canViewVerification && (
          <Card className="space-y-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" /> Pending Verifications
                </h3>
                <p className="text-xs text-slate-500">Unreviewed teacher credential submissions</p>
              </div>
              <Link href="/admin/verification">
                <GlassButton variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All ({metrics.pendingVerifications})
                </GlassButton>
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
              </div>
            ) : verificationQueue.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Queue is Clear</div>
                <p className="text-[11px] text-slate-500 mt-0.5">No teacher applications pending review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {verificationQueue.slice(0, 3).map((item) => (
                  <div
                    key={item.teacherProfileId}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
                        <StatusBadge status={item.verificationStatus} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.headline || "Teacher"} • {item.subjects?.join(", ")}
                      </p>
                    </div>
                    <Link href={`/admin/verification/${item.teacherProfileId}`}>
                      <GlassButton variant="secondary" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                        Review
                      </GlassButton>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Course Moderation Queue (renders ONLY if user has courses.view) */}
        {canViewCourses && (
          <Card className="space-y-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" /> Course Moderation
                </h3>
                <p className="text-xs text-slate-500">Draft courses awaiting catalog publishing</p>
              </div>
              <Link href="/admin/courses">
                <GlassButton variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Course Catalog
                </GlassButton>
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 text-purple-600 animate-spin mx-auto" />
              </div>
            ) : coursesQueue.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Catalog Up to Date</div>
                <p className="text-[11px] text-slate-500 mt-0.5">No unreviewed course submissions pending.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coursesQueue.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {c.teacherName || "Educator"} • {c.subject}
                      </p>
                    </div>
                    <Link href="/admin/courses">
                      <GlassButton variant="secondary" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                        Moderate
                      </GlassButton>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Content Moderation Reports (renders ONLY if user has reports.view) */}
        {canViewReports && (
          <Card className="space-y-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-rose-500" /> Platform Reports & Violations
                </h3>
                <p className="text-xs text-slate-500">Open learner and educator flags</p>
              </div>
              <Link href="/admin/reports">
                <GlassButton variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View Reports
                </GlassButton>
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 text-rose-600 animate-spin mx-auto" />
              </div>
            ) : reportsQueue.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Zero Open Reports</div>
                <p className="text-[11px] text-slate-500 mt-0.5">No reported content requiring review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reportsQueue.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{r.reason}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Target: {r.targetType} • Status: {r.status}
                      </p>
                    </div>
                    <Link href="/admin/reports">
                      <GlassButton variant="secondary" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                        Resolve
                      </GlassButton>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Financial Overview (renders ONLY if user has payments.view) */}
        {canViewPayments && (
          <Card className="space-y-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-emerald-500" /> Financial Operations
                </h3>
                <p className="text-xs text-slate-500">Live payment reconciliations and payouts</p>
              </div>
              <Link href="/admin/payments">
                <GlassButton variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Ledger
                </GlassButton>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Platform Commission</div>
                <div className="text-lg font-black text-emerald-600 mt-1">
                  {formatCurrency(financials.platformCommissionRupees)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Teacher Earnings Split</div>
                <div className="text-lg font-black text-blue-600 mt-1">
                  {formatCurrency(financials.teacherEarningsRupees)}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Dynamic Quick Navigation Cards: Rendered ONLY for features user is permitted to access */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Permitted Operational Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {canViewCourses && (
            <Link href="/admin/courses">
              <Card className="p-5 hover:border-purple-500 transition cursor-pointer space-y-2 group">
                <BookOpen className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Course Catalog</h4>
                <p className="text-xs text-slate-500">Manage lesson curriculum and content publishing.</p>
              </Card>
            </Link>
          )}

          {canViewVerification && (
            <Link href="/admin/verification">
              <Card className="p-5 hover:border-amber-500 transition cursor-pointer space-y-2 group">
                <ShieldCheck className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Teacher Verifications</h4>
                <p className="text-xs text-slate-500">Review educator applications and ID credentials.</p>
              </Card>
            </Link>
          )}

          {canViewTeachers && (
            <Link href="/admin/teachers">
              <Card className="p-5 hover:border-blue-500 transition cursor-pointer space-y-2 group">
                <GraduationCap className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Teacher Roster</h4>
                <p className="text-xs text-slate-500">Inspect educator profiles, subjects, and ratings.</p>
              </Card>
            </Link>
          )}

          {canViewUsers && (
            <Link href="/admin/users">
              <Card className="p-5 hover:border-blue-500 transition cursor-pointer space-y-2 group">
                <Users className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">User Governance</h4>
                <p className="text-xs text-slate-500">Accounts directory, status controls, and filters.</p>
              </Card>
            </Link>
          )}

          {canViewPayments && (
            <Link href="/admin/payments">
              <Card className="p-5 hover:border-emerald-500 transition cursor-pointer space-y-2 group">
                <IndianRupee className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Payment Ledger</h4>
                <p className="text-xs text-slate-500">Track transactions, payouts, and commission.</p>
              </Card>
            </Link>
          )}

          {canViewLiveClasses && (
            <Link href="/admin/live-classes">
              <Card className="p-5 hover:border-indigo-500 transition cursor-pointer space-y-2 group">
                <Video className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Live Class Slots</h4>
                <p className="text-xs text-slate-500">Monitor interactive video classroom sessions.</p>
              </Card>
            </Link>
          )}

          {canViewReports && (
            <Link href="/admin/reports">
              <Card className="p-5 hover:border-rose-500 transition cursor-pointer space-y-2 group">
                <AlertOctagon className="h-6 w-6 text-rose-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Report Moderation</h4>
                <p className="text-xs text-slate-500">Handle user abuse reports and moderation action.</p>
              </Card>
            </Link>
          )}

          {canViewActivity && (
            <Link href="/admin/activity">
              <Card className="p-5 hover:border-purple-500 transition cursor-pointer space-y-2 group">
                <Activity className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Platform Activity</h4>
                <p className="text-xs text-slate-500">Audit user actions, purchases, and security trail.</p>
              </Card>
            </Link>
          )}

          {canViewRoles && (
            <Link href="/admin/roles">
              <Card className="p-5 hover:border-amber-500 transition cursor-pointer space-y-2 group">
                <ShieldAlert className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Role Management</h4>
                <p className="text-xs text-slate-500">Create custom roles and control permissions.</p>
              </Card>
            </Link>
          )}

          {canViewStaff && (
            <Link href="/admin/staff">
              <Card className="p-5 hover:border-blue-500 transition cursor-pointer space-y-2 group">
                <UserCheck className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Staff Management</h4>
                <p className="text-xs text-slate-500">Invite staff and manage team permissions.</p>
              </Card>
            </Link>
          )}

          {canViewSettings && (
            <Link href="/admin/settings">
              <Card className="p-5 hover:border-slate-500 transition cursor-pointer space-y-2 group">
                <Settings className="h-6 w-6 text-slate-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Platform Settings</h4>
                <p className="text-xs text-slate-500">Adjust commission fees and configurations.</p>
              </Card>
            </Link>
          )}

          {canViewSystemHealth && (
            <Link href="/admin/system-health">
              <Card className="p-5 hover:border-emerald-500 transition cursor-pointer space-y-2 group">
                <Server className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">System Health</h4>
                <p className="text-xs text-slate-500">Inspect DB, Razorpay, LiveKit, and Mux status.</p>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

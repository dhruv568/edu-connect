"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/analytics/metric-card";
import { AnalyticsChart } from "@/components/analytics/analytics-chart";
import {
  BarChart2,
  Users,
  IndianRupee,
  BookOpen,
  Video,
  Download,
  Loader2,
  Star,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      if (json.data) setAnalytics(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const topCourses = analytics?.topCourses || [];
  const chartData = topCourses.map((c: any) => ({
    label: c.title.length > 15 ? c.title.substring(0, 12) + "..." : c.title,
    value: c.enrollmentCount,
    secondaryValue: c.priceRupees,
  }));

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Platform Analytics & Financial Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Platform-wide user registrations, revenue trends, top performing courses, and attendance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              {[
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "year", label: "This Year" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRange(tab.id)}
                  className={`px-3 py-1.5 font-bold rounded-lg transition ${
                    range === tab.id
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <a href="/api/admin/analytics/export?type=revenue" download>
              <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                Export Revenue CSV
              </Button>
            </a>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="New Student Registrations"
            value={loading ? "..." : analytics?.userStats?.newStudents || 0}
            subtitle={`Teachers joined: ${analytics?.userStats?.newTeachers || 0}`}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            variant="blue"
          />

          <MetricCard
            title="Period Gross Revenue"
            value={loading ? "..." : formatCurrency(analytics?.revenueStats?.periodGrossRevenueRupees || 0)}
            subtitle={`${analytics?.revenueStats?.transactionCount || 0} transactions captured`}
            icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
            variant="emerald"
          />

          <MetricCard
            title="Live Class Attendance"
            value={loading ? "..." : `${analytics?.attendanceStats?.periodAttendanceRate || 0}%`}
            subtitle={`${analytics?.attendanceStats?.presentTotal || 0} / ${analytics?.attendanceStats?.expectedTotal || 0} attended`}
            icon={<Video className="h-5 w-5 text-purple-600" />}
            variant="purple"
          />

          <MetricCard
            title="Top Courses Tracked"
            value={loading ? "..." : topCourses.length}
            subtitle="Sorted by enrollment count"
            icon={<BookOpen className="h-5 w-5 text-amber-500" />}
            variant="amber"
          />
        </div>

        {/* Interactive Top Course Enrollment vs Price Chart */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Top Performing Courses (Enrollments vs Price ₹)
          </h3>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            </div>
          ) : (
            <AnalyticsChart
              title="Enrollments (Blue) vs Course Price ₹ (Purple)"
              data={chartData}
              primaryLabel="Enrollment Count"
              secondaryLabel="Price ₹"
            />
          )}
        </Card>

        {/* Top Courses Table */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Top Course Performance Leaderboard
          </h3>

          {topCourses.length === 0 ? (
            <p className="text-xs text-slate-500">No published course metrics available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                    <th className="py-3 px-2">Course Title</th>
                    <th className="py-3 px-2">Educator</th>
                    <th className="py-3 px-2">Price</th>
                    <th className="py-3 px-2">Total Enrollments</th>
                    <th className="py-3 px-2">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {topCourses.map((c: any) => (
                    <tr key={c.id}>
                      <td className="py-3 px-2 font-bold text-slate-900 dark:text-slate-100">{c.title}</td>
                      <td className="py-3 px-2 text-slate-500">{c.teacherName}</td>
                      <td className="py-3 px-2 font-bold">{formatCurrency(c.priceRupees)}</td>
                      <td className="py-3 px-2 text-blue-600 font-bold">{c.enrollmentCount}</td>
                      <td className="py-3 px-2 text-amber-500 font-bold">★ {c.rating.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

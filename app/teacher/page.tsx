"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/analytics/metric-card";
import {
  Video,
  Users,
  Award,
  ShieldCheck,
  Plus,
  ArrowRight,
  FileCheck,
  Clock,
  XCircle,
  AlertOctagon,
  BookOpen,
  DollarSign,
  Calendar,
  BarChart2,
  Loader2,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    userName: string;
    verificationStatus: string;
    metrics: {
      todayClassesCount: number;
      upcomingClassesCount: number;
      activeStudentsCount: number;
      activeCoursesCount: number;
      totalEarningsRupees: number;
      monthlyEarningsRupees: number;
    };
    todaySchedule: any[];
    upcomingClasses: any[];
  }>({
    userName: "Educator",
    verificationStatus: "PENDING",
    metrics: {
      todayClassesCount: 0,
      upcomingClassesCount: 0,
      activeStudentsCount: 0,
      activeCoursesCount: 0,
      totalEarningsRupees: 0,
      monthlyEarningsRupees: 0,
    },
    todaySchedule: [],
    upcomingClasses: [],
  });

  useEffect(() => {
    fetch("/api/teacher/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Failed to load teacher dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="TEACHER" userName={data.userName}>
      <div className="space-y-8 pb-16">
        {/* Dynamic Verification Status Banner */}
        {data.verificationStatus === "VERIFIED" && (
          <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Verification Status: Verified Educator</h2>
                  <StatusBadge status="VERIFIED" />
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  Your profile is published on the EduConnect marketplace. You are eligible for demo bookings, live classes, and courses.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/teacher/analytics">
                <Button variant="secondary" size="sm" rightIcon={<BarChart2 className="h-4 w-4" />}>
                  View Teaching Analytics
                </Button>
              </Link>
            </div>
          </div>
        )}

        {data.verificationStatus === "PENDING" && (
          <div className="bg-amber-500 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Clock className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Verification Status: Application Pending</h2>
                  <StatusBadge status="PENDING" />
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  Your profile has been submitted and is currently being audited by EduConnect administration.
                </p>
              </div>
            </div>
            <Link href="/teacher/onboarding">
              <Button variant="secondary" size="sm" rightIcon={<FileCheck className="h-4 w-4" />}>
                Edit Profile Info
              </Button>
            </Link>
          </div>
        )}

        {/* Educator Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today's Classes"
            value={loading ? "..." : data.metrics.todayClassesCount}
            subtitle={`${data.metrics.upcomingClassesCount} upcoming total`}
            icon={<Video className="h-5 w-5 text-blue-600" />}
            variant="blue"
          />

          <MetricCard
            title="Active Students"
            value={loading ? "..." : data.metrics.activeStudentsCount}
            subtitle="Enrolled in your courses"
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            variant="emerald"
          />

          <MetricCard
            title="Published Courses"
            value={loading ? "..." : data.metrics.activeCoursesCount}
            subtitle="Self-paced LMS courses"
            icon={<BookOpen className="h-5 w-5 text-purple-600" />}
            variant="purple"
          />

          <MetricCard
            title="Monthly Earnings"
            value={loading ? "..." : `₹${data.metrics.monthlyEarningsRupees.toLocaleString()}`}
            subtitle={`Total: ₹${data.metrics.totalEarningsRupees.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5 text-amber-500" />}
            variant="amber"
          />
        </div>

        {/* Schedule & Upcoming Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card className="p-6 space-y-4 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Today's Schedule
                </h3>
              </div>
              <Link href="/teacher/live-classes">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Manage Slots
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
              </div>
            ) : data.todaySchedule.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80">
                <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">No live classes scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.todaySchedule.map((slot) => (
                  <div
                    key={slot.slotId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {slot.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                        {slot.bookedCount} / {slot.maxCapacity} Students
                      </p>
                    </div>

                    <Link href={`/classroom/${slot.slotId}`}>
                      <Button variant="primary" size="sm">
                        Enter Classroom
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Live Classes */}
          <Card className="p-6 space-y-4 border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Upcoming Classes
                </h3>
              </div>
              <Link href="/teacher/live-classes">
                <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  Create Slot
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
              </div>
            ) : data.upcomingClasses.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80">
                <Video className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">No upcoming live slots scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingClasses.map((slot) => (
                  <div
                    key={slot.slotId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {slot.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(slot.startTime).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {slot.bookedCount} / {slot.maxCapacity} Booked
                      </p>
                    </div>

                    <Link href={`/classroom/${slot.slotId}`}>
                      <Button variant={slot.canEnter ? "primary" : "outline"} size="sm">
                        {slot.canEnter ? "Enter Classroom" : "View Slot"}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Educator Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/teacher/live-classes">
            <Card className="p-5 hover:border-blue-500 transition cursor-pointer space-y-2">
              <Video className="h-6 w-6 text-blue-600" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Create Live Class</h4>
              <p className="text-xs text-slate-500">Schedule 1-on-1 or group live sessions.</p>
            </Card>
          </Link>

          <Link href="/teacher/courses">
            <Card className="p-5 hover:border-emerald-500 transition cursor-pointer space-y-2">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Create Course</h4>
              <p className="text-xs text-slate-500">Upload video lessons & study materials.</p>
            </Card>
          </Link>

          <Link href="/teacher/analytics">
            <Card className="p-5 hover:border-purple-500 transition cursor-pointer space-y-2">
              <BarChart2 className="h-6 w-6 text-purple-600" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">View Analytics</h4>
              <p className="text-xs text-slate-500">Course completion & class attendance stats.</p>
            </Card>
          </Link>

          <Link href="/teacher/earnings">
            <Card className="p-5 hover:border-amber-500 transition cursor-pointer space-y-2">
              <DollarSign className="h-6 w-6 text-amber-500" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">View Earnings</h4>
              <p className="text-xs text-slate-500">Financial ledger entries & Razorpay payouts.</p>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

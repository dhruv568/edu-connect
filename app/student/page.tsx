"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/analytics/metric-card";
import {
  BookOpen,
  Video,
  CalendarCheck,
  Flame,
  Search,
  Clock,
  Play,
  CheckCircle2,
  CreditCard,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    userName: string;
    gradeLevel?: string | null;
    continueLearning?: any;
    upcomingClasses: any[];
    stats: {
      enrolledCount: number;
      completedCoursesCount: number;
      upcomingClassesCount: number;
      completedClassesCount: number;
      courseHours: number;
      liveClassHours: number;
      totalHours: number;
    };
    recentPayments: any[];
  }>({
    userName: "Learner",
    upcomingClasses: [],
    stats: {
      enrolledCount: 0,
      completedCoursesCount: 0,
      upcomingClassesCount: 0,
      completedClassesCount: 0,
      courseHours: 0,
      liveClassHours: 0,
      totalHours: 0,
    },
    recentPayments: [],
  });

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Failed to load student dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="STUDENT" userName={data.userName}>
      <div className="space-y-8 pb-16">
        {/* Welcome Header Banner */}
        <div className="bg-emerald-600 text-white rounded-3xl p-6 lg:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
              Good evening, {data.userName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Ready to continue your learning journey on EduConnect?
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-700/70 px-4 py-2.5 rounded-2xl border border-emerald-500/40">
            <Flame className="h-5 w-5 text-amber-300 animate-pulse" />
            <span className="text-xs font-bold">Active Learning Track</span>
          </div>
        </div>

        {/* Statistics Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Courses Enrolled"
            value={loading ? "..." : data.stats.enrolledCount}
            subtitle={`${data.stats.completedCoursesCount} courses completed`}
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            variant="blue"
          />

          <MetricCard
            title="Upcoming Live Classes"
            value={loading ? "..." : data.stats.upcomingClassesCount}
            subtitle={`${data.stats.completedClassesCount} classes attended`}
            icon={<CalendarCheck className="h-5 w-5 text-emerald-600" />}
            variant="emerald"
          />

          <MetricCard
            title="Course Learning Time"
            value={loading ? "..." : `${data.stats.courseHours} hrs`}
            subtitle="Video lessons completed"
            icon={<Clock className="h-5 w-5 text-purple-600" />}
            variant="purple"
          />

          <MetricCard
            title="Live Classroom Time"
            value={loading ? "..." : `${data.stats.liveClassHours} hrs`}
            subtitle={`Total: ${data.stats.totalHours} hours`}
            icon={<Video className="h-5 w-5 text-amber-500" />}
            variant="amber"
          />
        </div>

        {/* Continue Learning & Upcoming Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Continue Learning Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Continue Learning
              </h3>
              <Link href="/courses" className="text-xs font-bold text-blue-600 hover:underline">
                Browse Marketplace →
              </Link>
            </div>

            {loading ? (
              <Card className="p-8 text-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
              </Card>
            ) : !data.continueLearning ? (
              <Card className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-900/40 border-dashed">
                <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No active course progress yet
                </div>
                <p className="text-xs text-slate-500">
                  Enroll in self-paced video courses to track lesson progress.
                </p>
                <Link href="/courses" className="inline-block pt-2">
                  <Button variant="primary" size="sm">
                    Explore Courses
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card className="p-6 space-y-5 border-l-4 border-l-blue-600 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase text-blue-600 tracking-wider">
                      Active Course
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                      {data.continueLearning.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Educator: {data.continueLearning.teacherName}
                    </p>
                  </div>
                  <Badge variant="student" className="w-fit">
                    {data.continueLearning.progressPercent}% Complete
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>
                      {data.continueLearning.completedLessons} of {data.continueLearning.totalLessons} Lessons
                    </span>
                    <span>{data.continueLearning.progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${data.continueLearning.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Last Lesson Details */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-slate-400">NEXT LESSON</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {data.continueLearning.lastLessonTitle}
                    </div>
                  </div>

                  <Link href={`/learn/${data.continueLearning.courseSlug}`}>
                    <Button variant="student" size="sm" leftIcon={<Play className="h-4 w-4" />}>
                      Resume Lesson
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          {/* Upcoming Live Classes List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Upcoming Live Classes
              </h3>
              <Link href="/find-teachers" className="text-xs font-bold text-blue-600 hover:underline">
                Find Tutors →
              </Link>
            </div>

            <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800">
              {loading ? (
                <div className="p-6 text-center">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
                </div>
              ) : data.upcomingClasses.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <CalendarCheck className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">
                    No scheduled live classes coming up.
                  </p>
                  <Link href="/find-teachers" className="inline-block pt-1">
                    <Button variant="outline" size="sm">
                      Book Live Session
                    </Button>
                  </Link>
                </div>
              ) : (
                data.upcomingClasses.map((item) => (
                  <div
                    key={item.bookingId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.teacherName} • {item.subject}
                        </p>
                      </div>
                      <Badge variant={item.canJoin ? "success" : "outline"} size="sm">
                        {item.canJoin ? "Live Join Ready" : "Scheduled"}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      🕒{" "}
                      {new Date(item.startTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {item.canJoin ? (
                      <Link href={`/classroom/${item.slotId}`}>
                        <Button variant="primary" size="sm" className="w-full">
                          Join Live Classroom
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="w-full">
                        Opens 15m before start
                      </Button>
                    )}
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>

        {/* Quick Actions & Recent Payments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Explore Marketplace</span>
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Browse Educators</h3>
            <p className="text-xs text-slate-500">Search verified STEM, Humanities, and Language teachers.</p>
            <Link href="/find-teachers" className="block pt-1">
              <Button variant="secondary" size="sm" className="w-full">
                Browse Teachers
              </Button>
            </Link>
          </Card>

          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">All Courses</span>
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Enrolled Library</h3>
            <p className="text-xs text-slate-500">View all your active and completed video courses.</p>
            <Link href="/student/courses" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full">
                View My Courses
              </Button>
            </Link>
          </Card>

          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Payment Receipts</span>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Billing History</h3>
            <p className="text-xs text-slate-500">Review all course purchases and live class transactions.</p>
            <Link href="/student/payments" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full">
                View Billing History
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

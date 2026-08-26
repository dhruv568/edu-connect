"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  User,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function StudentCoursesDashboardPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [continueLearning, setContinueLearning] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/courses");
      const data = await res.json();
      if (data.success) {
        setEnrolledCourses(data.data.enrolledCourses || []);
        setContinueLearning(data.data.continueLearning || null);
      }
    } catch (err) {
      console.error("Failed to fetch student enrolled courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-10">
        {/* Top Header */}
        <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-50 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-500" /> My Learning Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Access your enrolled self-paced courses, track video progress, and resume learning.
            </p>
          </div>

          <Link
            href="/courses"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition"
          >
            Explore More Courses
          </Link>
        </div>

        {/* Continue Learning Featured Hero Card */}
        {continueLearning && (
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 shadow-2xl shadow-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Continue Learning
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-50">
                {continueLearning.course.title}
              </h2>

              {continueLearning.currentLesson && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <PlayCircle className="w-4 h-4 text-blue-400" />
                  <span>Current: {continueLearning.currentLesson.title}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>{continueLearning.completedLessons} of {continueLearning.totalLessons} lessons complete</span>
                  <span className="text-blue-400">{continueLearning.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${continueLearning.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              href={`/learn/${continueLearning.course.slug}`}
              className="shrink-0 px-8 py-4 text-sm font-extrabold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 hover:scale-105 transition flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" /> Resume Course
            </Link>
          </div>
        )}

        {/* Enrolled Courses Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-100">Enrolled Courses</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Enrolled Courses Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't enrolled in any pre-recorded courses yet. Discover our verified teacher courses and start learning today.
              </p>
              <Link
                href="/courses"
                className="mt-2 inline-block px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20"
              >
                Browse Course Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((item) => (
                <div
                  key={item.enrollmentId}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                      <img
                        src={item.course.thumbnailUrl}
                        alt={item.course.title}
                        className="w-full h-full object-cover"
                      />
                      {item.status === "COMPLETED" && (
                        <div className="absolute top-2 right-2 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500 text-white shadow">
                          🎓 Completed
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-100 line-clamp-1">
                      {item.course.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Instructor: {item.course.teacherName}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span>{item.completedLessons} / {item.totalLessons} lessons</span>
                        <span className="text-blue-400 font-bold">{item.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/learn/${item.course.slug}`}
                    className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4" /> Go to Classroom
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Edit,
  BookOpen,
  Users,
  Star,
  BarChart2,
  Settings,
  Eye,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";

export default function TeacherCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Educator");
  const [userEmail, setUserEmail] = useState("");
  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "CURRICULUM" | "STUDENTS" | "ANALYTICS" | "SETTINGS">("OVERVIEW");

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const profileRes = await fetch("/api/teacher/onboarding");
      const profileJson = await profileRes.json();
      if (profileJson.data) {
        setUserName(`${profileJson.data.profile.firstName} ${profileJson.data.profile.lastName}`.trim() || profileJson.data.user.email);
        setUserEmail(profileJson.data.user.email);
      }

      const res = await fetch(`/api/teacher/courses/${courseId}`);
      const json = await res.json();
      if (json.success && json.data.course) {
        setCourse(json.data.course);
      }

      // Fetch enrolled students
      const studRes = await fetch(`/api/teacher/courses/${courseId}/students`);
      const studJson = await studRes.json();
      if (studJson.success && studJson.data.students) {
        setStudents(studJson.data.students);
      }
    } catch (err) {
      console.error("Failed to load course details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchCourseDetails();
  }, [courseId]);

  return (
    <DashboardLayout role="TEACHER" userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/teacher/courses">
              <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-700">
                  {course?.subject || "Subject"}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                  ● {course?.status || "DRAFT"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">{course?.title || "Loading Course..."}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/courses/${course?.slug || ""}`} target="_blank">
              <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                Preview Public Page
              </Button>
            </Link>
            <Link href={`/teacher/courses/${courseId}/edit`}>
              <Button variant="primary" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
                Open Course Builder
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        ) : !course ? (
          <Card className="p-12 text-center">Course not found.</Card>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              {(["OVERVIEW", "CURRICULUM", "STUDENTS", "ANALYTICS", "SETTINGS"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "OVERVIEW" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Description</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {course.description || "No description provided."}
                    </p>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Metrics</h3>
                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Enrolled:</span>
                        <span className="font-bold">{students.length} Students</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Price:</span>
                        <span className="font-bold">${course.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level:</span>
                        <span className="font-bold">{course.level}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === "STUDENTS" && (
              <Card className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">Enrolled Students ({students.length})</h3>
                {students.length === 0 ? (
                  <p className="text-xs text-slate-500">No students are currently enrolled in this course.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {students.map((st: any) => (
                      <div key={st.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                            {st.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-[10px] text-slate-500">
                              Enrolled: {new Date(st.enrolledAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-slate-900">{st.progressPercentage}% Completed</div>
                            <div className="text-[10px] text-slate-500">
                              {st.completedLessonsCount} / {st.totalLessons} Lessons
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* CURRICULUM TAB */}
            {activeTab === "CURRICULUM" && (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Curriculum Sections</h3>
                  <Link href={`/teacher/courses/${courseId}/edit`}>
                    <Button variant="primary" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>
                      Edit Curriculum
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-slate-500">
                  Open the course builder to reorder sections, add lessons, upload video assets, or manage resources.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

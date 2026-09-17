"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import MuxPlayer from "@mux/mux-player-react";
import {
  GraduationCap,
  Sparkles,
  Video,
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  Award,
  ArrowUp,
  ArrowDown,
  Edit3,
  Eye,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Search,
  Check,
  AlertTriangle,
  UploadCloud,
  FileText,
  ExternalLink,
  ShieldCheck,
  Loader2,
  X,
} from "lucide-react";

export default function AdminTrainingPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"days" | "quizzes" | "enrollments">("days");
  const [loading, setLoading] = useState(true);

  // Program and stats state
  const [program, setProgram] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalEnrollments: 0,
    completedEnrollments: 0,
    certificateEligibleCount: 0,
    totalDays: 15,
  });

  // Selected day for editing or quiz
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activeDayData, setActiveDayData] = useState<any>(null);
  const [savingDay, setSavingDay] = useState(false);

  // Mux video upload in modal
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Quiz Studio state
  const [quizDayId, setQuizDayId] = useState<string>("");
  const [quizData, setQuizData] = useState<any>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Enrolled educators state
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [searchEnrollment, setSearchEnrollment] = useState("");
  const [filterEnrollmentStatus, setFilterEnrollmentStatus] = useState("ALL");

  // Load Program Overview
  const loadProgramData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/training");
      const json = await res.json();
      if (json.success && json.data) {
        setProgram(json.data.program);
        setStats(json.data.stats);
        if (json.data.program.days.length > 0 && !quizDayId) {
          setQuizDayId(json.data.program.days[0].id);
        }
      }
    } catch (err) {
      showToast("Failed to load training program data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgramData();
  }, []);

  // Load Quiz Data when selected day changes in Quiz Studio
  useEffect(() => {
    if (!quizDayId) return;
    const fetchQuiz = async () => {
      setLoadingQuiz(true);
      try {
        const res = await fetch(`/api/admin/training/days/${quizDayId}/quiz`);
        const json = await res.json();
        if (json.success && json.data) {
          setQuizData(json.data);
        } else {
          setQuizData({
            title: "Daily Assessment",
            description: "Verify your understanding",
            passingScore: 70,
            questionCount: 5,
            maxAttempts: 3,
            isPublished: true,
            questions: [],
          });
        }
      } catch {
        showToast("Error loading quiz", "error");
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, [quizDayId]);

  // Load Enrollments
  const loadEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const query = new URLSearchParams();
      if (searchEnrollment) query.set("search", searchEnrollment);
      if (filterEnrollmentStatus !== "ALL") query.set("status", filterEnrollmentStatus);

      const res = await fetch(`/api/admin/training/enrollments?${query.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.enrollments) {
        setEnrollments(json.data.enrollments);
      }
    } catch {
      showToast("Failed to load enrolled educators", "error");
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    if (activeTab === "enrollments") {
      loadEnrollments();
    }
  }, [activeTab, searchEnrollment, filterEnrollmentStatus]);

  // Open Edit Modal for a Day
  const handleEditDay = (day: any) => {
    setActiveDayData({
      id: day.id,
      dayNumber: day.dayNumber,
      title: day.title || "",
      description: day.description || "",
      instructions: day.instructions || "",
      learningObjectives: day.learningObjectives
        ? typeof day.learningObjectives === "string"
          ? JSON.parse(day.learningObjectives)
          : day.learningObjectives
        : [],
      videoPlaybackId: day.videoPlaybackId || "",
      videoDuration: day.videoDuration || 0,
      resources: day.resources
        ? typeof day.resources === "string"
          ? JSON.parse(day.resources)
          : day.resources
        : [],
      isPublished: Boolean(day.isPublished),
    });
    setEditModalOpen(true);
  };

  // Open Preview Modal for a Day
  const handlePreviewDay = (day: any) => {
    setActiveDayData(day);
    setPreviewModalOpen(true);
  };

  // Save Day Changes
  const handleSaveDay = async () => {
    if (!activeDayData) return;
    setSavingDay(true);
    try {
      const res = await fetch(`/api/admin/training/days/${activeDayData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeDayData),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Day ${activeDayData.dayNumber} updated successfully`, "success");
        setEditModalOpen(false);
        loadProgramData();
      } else {
        showToast(json.error || "Failed to update day", "error");
      }
    } catch {
      showToast("Network error saving day", "error");
    } finally {
      setSavingDay(false);
    }
  };

  // Handle Video Upload via Mux Direct Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDayData) return;

    setUploadingVideo(true);
    setUploadProgress(10);

    try {
      // 1. Request direct upload URL from backend
      const res = await fetch(`/api/admin/training/days/${activeDayData.id}/video`, {
        method: "POST",
      });
      const json = await res.json();

      if (!json.success || !json.data.uploadUrl) {
        throw new Error(json.error || "Failed to initiate Mux upload");
      }

      setUploadProgress(30);

      // 2. Upload video binary directly to Mux upload URL
      const uploadRes = await fetch(json.data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "video/mp4",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Mux direct upload failed to accept file");
      }

      setUploadProgress(75);

      // 3. Sync status with Mux backend
      const syncRes = await fetch(`/api/admin/training/days/${activeDayData.id}/video`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: json.data.uploadId }),
      });

      const syncJson = await syncRes.json();
      if (syncJson.success) {
        setActiveDayData((prev: any) => ({
          ...prev,
          videoPlaybackId: syncJson.data.playbackId || prev.videoPlaybackId,
        }));
        showToast("Video uploaded and connected to Mux successfully", "success");
      }

      setUploadProgress(100);
    } catch (err: any) {
      showToast(err.message || "Video upload failed", "error");
    } finally {
      setUploadingVideo(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Move Day Up/Down
  const handleMoveDay = async (index: number, direction: "up" | "down") => {
    if (!program?.days) return;
    const days = [...program.days];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= days.length) return;

    const temp = days[index];
    days[index] = days[targetIndex];
    days[targetIndex] = temp;

    const items = days.map((d, idx) => ({ id: d.id, orderIndex: idx }));

    try {
      const res = await fetch("/api/admin/training/days/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        showToast("Days reordered successfully", "success");
        loadProgramData();
      }
    } catch {
      showToast("Failed to reorder days", "error");
    }
  };

  // Toggle Publish Day
  const handleTogglePublish = async (day: any) => {
    try {
      const res = await fetch(`/api/admin/training/days/${day.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !day.isPublished }),
      });
      if (res.ok) {
        showToast(`Day ${day.dayNumber} ${day.isPublished ? "unpublished" : "published"}`, "success");
        loadProgramData();
      }
    } catch {
      showToast("Error updating publish status", "error");
    }
  };

  // AI Quiz Generation
  const handleGenerateAiQuiz = async () => {
    if (!quizDayId) return;
    setGeneratingAi(true);
    try {
      const res = await fetch(`/api/admin/training/days/${quizDayId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: quizData?.questionCount || 5 }),
      });
      const json = await res.json();
      if (json.success && json.data?.questions) {
        setQuizData((prev: any) => ({
          ...prev,
          questions: json.data.questions,
          questionCount: json.data.questions.length,
        }));
        showToast("AI questions generated! Review and click 'Save Quiz' to publish.", "success");
      } else {
        showToast(json.error || "AI generation failed", "error");
      }
    } catch {
      showToast("Failed to generate AI questions", "error");
    } finally {
      setGeneratingAi(false);
    }
  };

  // Save Quiz
  const handleSaveQuiz = async () => {
    if (!quizDayId || !quizData) return;
    setSavingQuiz(true);
    try {
      const res = await fetch(`/api/admin/training/days/${quizDayId}/quiz`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Quiz updated and published successfully", "success");
        loadProgramData();
      } else {
        showToast(json.error || "Failed to save quiz", "error");
      }
    } catch {
      showToast("Error saving quiz", "error");
    } finally {
      setSavingQuiz(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8 pb-16">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0D5C41] via-[#16805B] to-[#0D5C41] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-200 text-xs font-extrabold uppercase tracking-wider">
                <GraduationCap className="h-4 w-4 text-[#35A979]" />
                <span>Educator Academy Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                15-Day Educator Training &amp; Certification System
              </h1>
              <p className="text-sm text-emerald-100 max-w-2xl font-medium">
                Manage all 15 curriculum days, upload training videos via Mux, generate &amp; edit AI concept quizzes, and track enrolled educators toward official certification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={loadProgramData}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-bold"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Refresh Program
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-emerald-100 bg-white shadow-xs">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Enrolled</span>
              <Users className="h-4 w-4 text-[#16805B]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalEnrollments}</div>
            <p className="text-xs text-slate-650 mt-1">Educators in training pipeline</p>
          </Card>

          <Card className="p-5 border-emerald-100 bg-white shadow-xs">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Certificate Eligible</span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.certificateEligibleCount}</div>
            <p className="text-xs text-slate-650 mt-1">Completed all 15 days &amp; quizzes</p>
          </Card>

          <Card className="p-5 border-emerald-100 bg-white shadow-xs">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Certified Educators</span>
              <ShieldCheck className="h-4 w-4 text-[#16805B]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.completedEnrollments}</div>
            <p className="text-xs text-slate-650 mt-1">Official certificates issued</p>
          </Card>

          <Card className="p-5 border-emerald-100 bg-white shadow-xs">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Program Days</span>
              <BookOpen className="h-4 w-4 text-[#35A979]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">15 / 15</div>
            <p className="text-xs text-slate-650 mt-1">Sequential Progression Enforced</p>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab("days")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "days"
                ? "border-[#16805B] text-[#0D5C41]"
                : "border-transparent text-slate-650 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4" /> 15 Training Days Manager
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "quizzes"
                ? "border-[#16805B] text-[#0D5C41]"
                : "border-transparent text-slate-650 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-4 w-4 text-emerald-600" /> AI Quiz Studio
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "enrollments"
                ? "border-[#16805B] text-[#0D5C41]"
                : "border-transparent text-slate-650 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4" /> Enrolled Educators &amp; Progress
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: 15 TRAINING DAYS MANAGER */}
        {/* ========================================================================= */}
        {activeTab === "days" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">15 Training Days Curriculum</h2>
              <span className="text-xs text-slate-650 font-medium">
                Educators complete these days sequentially. Video completion &amp; quiz pass required to unlock next day.
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-650 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#16805B]" /> Loading training curriculum...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {program?.days?.map((day: any, idx: number) => {
                  const objectives = day.learningObjectives
                    ? typeof day.learningObjectives === "string"
                      ? JSON.parse(day.learningObjectives)
                      : day.learningObjectives
                    : [];
                  const hasVideo = Boolean(day.videoPlaybackId);
                  const hasQuiz = Boolean(day.quiz);

                  return (
                    <Card
                      key={day.id}
                      className="p-5 border-slate-200 hover:border-emerald-300 transition-shadow shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-800 font-mono font-black shrink-0">
                          <span className="text-[10px] uppercase font-bold text-[#16805B]">DAY</span>
                          <span className="text-base leading-none">{day.dayNumber}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="text-base font-bold text-slate-900">{day.title}</h3>
                            <Badge
                              className={`text-[10px] font-bold ${
                                day.isPublished
                                  ? "bg-emerald-100 text-[#0D5C41] border border-emerald-200"
                                  : "bg-slate-100 text-slate-650 border border-slate-200"
                              }`}
                            >
                              {day.isPublished ? "PUBLISHED" : "DRAFT"}
                            </Badge>

                            {hasVideo ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <Video className="h-3 w-3" /> Mux Video
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <AlertTriangle className="h-3 w-3" /> No Video
                              </span>
                            )}

                            {hasQuiz ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                <Sparkles className="h-3 w-3" /> AI Quiz Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-650 bg-slate-100 px-2 py-0.5 rounded-md">
                                No Quiz
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-650 line-clamp-2">{day.description}</p>

                          <div className="text-[11px] text-slate-650 flex items-center gap-3 pt-0.5">
                            <span>{objectives.length} Objectives</span>
                            <span>•</span>
                            <span>{day.videoDuration ? `${Math.round(day.videoDuration / 60)} mins` : "Duration N/A"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {/* Reorder Buttons */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden mr-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveDay(idx, "up")}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5 text-slate-650" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (program?.days?.length || 1) - 1}
                            onClick={() => handleMoveDay(idx, "down")}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 transition-colors border-l border-slate-200"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5 text-slate-650" />
                          </button>
                        </div>

                        {/* Preview Content Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewDay(day)}
                          className="h-8 text-xs font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                        </Button>

                        {/* Edit Day Content Button */}
                        <Button
                          size="sm"
                          onClick={() => handleEditDay(day)}
                          className="h-8 bg-[#16805B] hover:bg-[#0D5C41] text-white text-xs font-semibold"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Day
                        </Button>

                        {/* Toggle Publish */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePublish(day)}
                          className={`h-8 text-xs font-semibold ${
                            day.isPublished
                              ? "text-rose-700 hover:bg-rose-50 border-rose-200"
                              : "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          }`}
                        >
                          {day.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI QUIZ STUDIO */}
        {/* ========================================================================= */}
        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#16805B]" /> AI Concept Quiz Studio
                </h3>
                <p className="text-xs text-slate-650">
                  Select a training day to generate multiple-choice questions automatically with AI, review, and customize passing scores.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={quizDayId}
                  onChange={(e) => setQuizDayId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl p-2.5 outline-none focus:border-[#16805B]"
                >
                  {program?.days?.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      Day {d.dayNumber}: {d.title}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={handleGenerateAiQuiz}
                  disabled={generatingAi}
                  className="bg-gradient-to-r from-[#16805B] to-[#0D5C41] hover:from-[#137150] text-white text-xs font-bold flex items-center gap-2 shadow-xs"
                >
                  {generatingAi ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating AI Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-emerald-300" /> Regenerate with AI
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSaveQuiz}
                  disabled={savingQuiz}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" /> Save Quiz
                </Button>
              </div>
            </div>

            {loadingQuiz ? (
              <div className="p-12 text-center text-slate-650 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#16805B]" /> Loading quiz questions...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quiz Configuration Settings */}
                <Card className="p-5 border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quiz Scoring &amp; Rules</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Passing Score Threshold (%)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={quizData?.passingScore || 70}
                        onChange={(e) =>
                          setQuizData({ ...quizData, passingScore: Number(e.target.value) })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:border-[#16805B] outline-none"
                      />
                      <span className="text-[11px] text-slate-650">Educators must score this percentage to unlock next day.</span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Max Allowed Attempts
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={quizData?.maxAttempts || 3}
                        onChange={(e) =>
                          setQuizData({ ...quizData, maxAttempts: Number(e.target.value) })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:border-[#16805B] outline-none"
                      />
                      <span className="text-[11px] text-slate-650">Number of retries before intervention.</span>
                    </div>

                    <div className="flex items-center gap-3 pt-5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(quizData?.isPublished)}
                          onChange={(e) =>
                            setQuizData({ ...quizData, isPublished: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16805B]"></div>
                        <span className="ml-3 text-xs font-bold text-slate-700">Publish Quiz</span>
                      </label>
                    </div>
                  </div>
                </Card>

                {/* Questions Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      Questions ({quizData?.questions?.length || 0})
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newQ = {
                          id: `q-custom-${Date.now()}`,
                          questionNumber: (quizData?.questions?.length || 0) + 1,
                          question: "New question text?",
                          options: [
                            { key: "A", text: "Option A" },
                            { key: "B", text: "Option B" },
                            { key: "C", text: "Option C" },
                            { key: "D", text: "Option D" },
                          ],
                          correctAnswer: "A",
                          explanation: "Explanation why A is correct.",
                        };
                        setQuizData({
                          ...quizData,
                          questions: [...(quizData?.questions || []), newQ],
                          questionCount: (quizData?.questions?.length || 0) + 1,
                        });
                      }}
                      className="text-xs font-bold"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Question Manually
                    </Button>
                  </div>

                  {quizData?.questions?.map((q: any, qIdx: number) => (
                    <Card key={q.id || qIdx} className="p-5 border-slate-200 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0D5C41] font-bold text-xs flex items-center justify-center">
                            Q{qIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-650 uppercase">Multiple Choice</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = quizData.questions.filter((_: any, i: number) => i !== qIdx);
                            setQuizData({ ...quizData, questions: updated, questionCount: updated.length });
                          }}
                          className="text-rose-600 hover:text-rose-800 p-1 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>

                      {/* Question Text */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Question Prompt</label>
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => {
                            const updated = [...quizData.questions];
                            updated[qIdx].question = e.target.value;
                            setQuizData({ ...quizData, questions: updated });
                          }}
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-[#16805B]"
                        />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options?.map((opt: any, optIdx: number) => (
                          <div
                            key={opt.key}
                            className={`p-3 rounded-xl border flex items-center gap-3 ${
                              q.correctAnswer === opt.key
                                ? "border-emerald-500 bg-emerald-50/50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-${q.id || qIdx}`}
                              checked={q.correctAnswer === opt.key}
                              onChange={() => {
                                const updated = [...quizData.questions];
                                updated[qIdx].correctAnswer = opt.key;
                                setQuizData({ ...quizData, questions: updated });
                              }}
                              className="accent-[#16805B] h-4 w-4 cursor-pointer"
                              title="Set as correct answer"
                            />
                            <span className="font-bold text-xs text-slate-700 w-5">{opt.key}.</span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const updated = [...quizData.questions];
                                updated[qIdx].options[optIdx].text = e.target.value;
                                setQuizData({ ...quizData, questions: updated });
                              }}
                              className="flex-1 text-xs font-medium bg-transparent border-b border-transparent focus:border-slate-400 outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Correct Answer Explanation (Shown to educator after answering)
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ""}
                          onChange={(e) => {
                            const updated = [...quizData.questions];
                            updated[qIdx].explanation = e.target.value;
                            setQuizData({ ...quizData, questions: updated });
                          }}
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#16805B]"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ENROLLED EDUCATORS & PROGRESS */}
        {/* ========================================================================= */}
        {activeTab === "enrollments" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search educator by name or email..."
                  value={searchEnrollment}
                  onChange={(e) => setSearchEnrollment(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-[#16805B]"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-semibold text-slate-650">Filter:</span>
                <select
                  value={filterEnrollmentStatus}
                  onChange={(e) => setFilterEnrollmentStatus(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl text-xs font-bold p-2 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ENROLLED">Enrolled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CERTIFICATE_ELIGIBLE">Certificate Eligible</option>
                  <option value="CERTIFIED">Certified</option>
                </select>
              </div>
            </div>

            {loadingEnrollments ? (
              <div className="p-12 text-center text-slate-650 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#16805B]" /> Loading enrolled educators...
              </div>
            ) : enrollments.length === 0 ? (
              <Card className="p-12 text-center text-slate-650">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">No enrolled educators found matching criteria.</p>
              </Card>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">Educator</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5">Days Completed</th>
                      <th className="p-3.5">Overall Progress</th>
                      <th className="p-3.5">Training Status</th>
                      <th className="p-3.5">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollments.map((en) => (
                      <tr key={en.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{en.userName}</div>
                          <div className="text-[11px] text-slate-650 font-mono">{en.userEmail}</div>
                        </td>
                        <td className="p-3.5">
                          <Badge
                            className={`text-[10px] font-bold ${
                              en.teacherStatus === "VERIFIED"
                                ? "bg-emerald-100 text-[#0D5C41]"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {en.teacherStatus}
                          </Badge>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {en.completedDaysCount} / 15 Days
                        </td>
                        <td className="p-3.5">
                          <div className="w-36 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-650">
                              <span>{en.completionPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#16805B] h-full rounded-full transition-all duration-300"
                                style={{ width: `${en.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <Badge
                            className={`text-[10px] font-bold ${
                              en.status === "CERTIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : en.status === "CERTIFICATE_ELIGIBLE"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {en.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          {en.certificate ? (
                            <span className="font-mono text-[11px] font-bold text-[#16805B]">
                              {en.certificate.certificateNumber}
                            </span>
                          ) : en.status === "CERTIFICATE_ELIGIBLE" ? (
                            <span className="text-[11px] font-bold text-amber-600">Verification Pending</span>
                          ) : (
                            <span className="text-slate-400">Not Eligible</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EDIT DAY MODAL */}
      {/* ========================================================================= */}
      {editModalOpen && activeDayData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#16805B]">Curriculum Editor</span>
                <h3 className="text-xl font-black text-slate-900">
                  Edit Day {activeDayData.dayNumber}: {activeDayData.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Day Title</label>
                <input
                  type="text"
                  value={activeDayData.title}
                  onChange={(e) => setActiveDayData({ ...activeDayData, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-[#16805B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={activeDayData.description}
                  onChange={(e) => setActiveDayData({ ...activeDayData, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#16805B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Learning Objectives (Comma or line separated)
                </label>
                <textarea
                  rows={3}
                  value={
                    Array.isArray(activeDayData.learningObjectives)
                      ? activeDayData.learningObjectives.join("\n")
                      : activeDayData.learningObjectives
                  }
                  onChange={(e) =>
                    setActiveDayData({
                      ...activeDayData,
                      learningObjectives: e.target.value.split("\n").filter((s) => s.trim().length > 0),
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#16805B]"
                  placeholder="One objective per line..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Instructions</label>
                <textarea
                  rows={2}
                  value={activeDayData.instructions}
                  onChange={(e) => setActiveDayData({ ...activeDayData, instructions: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#16805B]"
                />
              </div>

              {/* Mux Video Integration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-[#16805B]" /> Training Video (Mux Infrastructure)
                  </label>
                  {activeDayData.videoPlaybackId && (
                    <span className="text-[11px] font-mono font-bold text-[#16805B] bg-emerald-100 px-2 py-0.5 rounded">
                      ID: {activeDayData.videoPlaybackId}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Mux Playback ID (e.g. 5xX... or demo_playback_day_1)"
                    value={activeDayData.videoPlaybackId}
                    onChange={(e) => setActiveDayData({ ...activeDayData, videoPlaybackId: e.target.value })}
                    className="flex-1 p-2 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                  />

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700">
                    <UploadCloud className="h-4 w-4 text-[#16805B]" />
                    <span>{uploadingVideo ? `Uploading ${uploadProgress}%` : "Upload Video to Mux"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveDay}
                disabled={savingDay}
                className="bg-[#16805B] hover:bg-[#0D5C41] text-white font-bold"
              >
                {savingDay ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW DAY MODAL */}
      {/* ========================================================================= */}
      {previewModalOpen && activeDayData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#16805B]">Day Preview</span>
                <h3 className="text-xl font-black text-slate-900">
                  Day {activeDayData.dayNumber}: {activeDayData.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Video Player Preview */}
              <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center relative">
                {activeDayData.videoPlaybackId ? (
                  <MuxPlayer
                    streamType="on-demand"
                    playbackId={activeDayData.videoPlaybackId}
                    autoPlay={false}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 p-6 space-y-2">
                    <Video className="h-10 w-10 mx-auto text-slate-600" />
                    <p className="text-xs font-medium">No Mux video uploaded yet for this day.</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Module Overview</h4>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">{activeDayData.description}</p>
              </div>

              {/* Objectives */}
              <div className="space-y-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D5C41]">Learning Objectives</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(Array.isArray(activeDayData.learningObjectives)
                    ? activeDayData.learningObjectives
                    : activeDayData.learningObjectives
                    ? JSON.parse(activeDayData.learningObjectives)
                    : []
                  ).map((obj: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16805B] shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              {activeDayData.instructions && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Instructions</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{activeDayData.instructions}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t">
              <Button onClick={() => setPreviewModalOpen(false)} className="bg-slate-900 text-white text-xs font-bold">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

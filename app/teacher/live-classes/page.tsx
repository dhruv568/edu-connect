"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Video,
  Plus,
  Calendar as CalendarIcon,
  List as ListIcon,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Settings,
  Sparkles,
  Edit,
  Trash2,
  Play,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
} from "lucide-react";

export default function TeacherLiveClassesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Educator");
  const [userEmail, setUserEmail] = useState("");
  const [viewMode, setViewMode] = useState<"CALENDAR" | "LIST">("LIST");
  const [calendarMode, setCalendarMode] = useState<"DAY" | "WEEK" | "MONTH">("WEEK");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    today: 0,
    completed: 0,
    cancelled: 0,
  });

  const [slots, setSlots] = useState<any[]>([]);

  // Create Modal Multi-Step State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("ALL_LEVELS");
  const [language, setLanguage] = useState("English");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("18:00");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [classType, setClassType] = useState("GROUP");
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [minimumStudents, setMinimumStudents] = useState(1);
  const [price, setPrice] = useState(0);

  // Classroom settings
  const [cameraRequired, setCameraRequired] = useState(true);
  const [micRequired, setMicRequired] = useState(true);
  const [screenSharingAllowed, setScreenSharingAllowed] = useState(true);
  const [whiteboardAllowed, setWhiteboardAllowed] = useState(true);
  const [chatAllowed, setChatAllowed] = useState(true);
  const [fileSharingAllowed, setFileSharingAllowed] = useState(true);

  // Cancel Modal
  const [cancellingSlot, setCancellingSlot] = useState<any>(null);

  const fetchLiveClassesData = async () => {
    setLoading(true);
    try {
      // Fetch onboarding for user info
      const profileRes = await fetch("/api/teacher/onboarding");
      const profileJson = await profileRes.json();
      if (profileJson.data) {
        setUserName(`${profileJson.data.profile.firstName} ${profileJson.data.profile.lastName}`.trim() || profileJson.data.user.email);
        setUserEmail(profileJson.data.user.email);
      }

      // Fetch live class slots & stats
      const res = await fetch(`/api/teacher/live-classes?status=${filterStatus}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data.stats || { total: 0, upcoming: 0, today: 0, completed: 0, cancelled: 0 });
        setSlots(json.data.slots || []);
      }
    } catch (err) {
      console.error("Failed to load live classes:", err);
      showToast("Error", "Could not fetch live class schedule.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClassesData();
  }, [filterStatus]);

  const handleCreateSubmit = async (publishImmediate: boolean = true) => {
    if (!title.trim() || !date || !startTime || !endTime) {
      showToast("Validation Error", "Title, date, start time, and end time are required.", "error");
      return;
    }

    const startDateTimeStr = `${date}T${startTime}:00`;
    const endDateTimeStr = `${date}T${endTime}:00`;

    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          description,
          level,
          language,
          startTime: startDateTimeStr,
          endTime: endDateTimeStr,
          timezone,
          classType,
          maxCapacity: Number(maxCapacity),
          minimumStudents: Number(minimumStudents),
          price: Number(price),
          status: publishImmediate ? "SCHEDULED" : "DRAFT",
          cameraRequired,
          micRequired,
          screenSharingAllowed,
          whiteboardAllowed,
          chatAllowed,
          fileSharingAllowed,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast("Success", publishImmediate ? "Live Class published to schedule!" : "Live Class saved as draft.", "success");
        setShowCreateModal(false);
        resetForm();
        fetchLiveClassesData();
      } else {
        showToast("Schedule Error", json.error?.message || "Failed to create class slot.", "error");
      }
    } catch (err: any) {
      showToast("Server Error", "An error occurred while creating live class.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("17:00");
    setEndTime("18:00");
    setMaxCapacity(10);
  };

  const handleStartClassroom = async (slotId: string) => {
    try {
      const res = await fetch(`/api/teacher/live-classes/${slotId}/start-session`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success && json.data.sessionId) {
        showToast("Launching Classroom", "Connecting to live virtual classroom...", "info");
        router.push(`/classroom/${json.data.sessionId}`);
      } else {
        showToast("Error", json.error?.message || "Could not launch classroom.", "error");
      }
    } catch (err) {
      showToast("Error", "Failed to launch classroom session.", "error");
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancellingSlot) return;
    try {
      const res = await fetch(`/api/teacher/live-classes/${cancellingSlot.id}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        showToast("Cancelled", "Class slot has been cancelled.", "info");
        setCancellingSlot(null);
        fetchLiveClassesData();
      }
    } catch (err) {
      showToast("Error", "Failed to cancel class slot.", "error");
    }
  };

  return (
    <DashboardLayout role="TEACHER" userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <Video className="h-7 w-7 text-blue-600" /> Live Class Slots
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create and manage your interactive teaching schedule.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/teacher/live-classes/availability">
              <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
                Availability Settings
              </Button>
            </Link>

            <Button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              + Create Live Class
            </Button>
          </div>
        </div>

        {/* Real Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="space-y-1 border-l-4 border-l-blue-600">
            <div className="text-xs font-semibold text-slate-500 uppercase">Upcoming Classes</div>
            <div className="text-2xl font-black text-slate-900">{stats.upcoming}</div>
            <p className="text-[10px] text-blue-600 font-medium">Scheduled & Bookable</p>
          </Card>

          <Card className="space-y-1 border-l-4 border-l-amber-500">
            <div className="text-xs font-semibold text-slate-500 uppercase">Today's Classes</div>
            <div className="text-2xl font-black text-slate-900">{stats.today}</div>
            <p className="text-[10px] text-amber-600 font-medium">Scheduled Today</p>
          </Card>

          <Card className="space-y-1 border-l-4 border-l-emerald-600">
            <div className="text-xs font-semibold text-slate-500 uppercase">Completed Classes</div>
            <div className="text-2xl font-black text-slate-900">{stats.completed}</div>
            <p className="text-[10px] text-emerald-600 font-medium">Successfully Taught</p>
          </Card>

          <Card className="space-y-1 border-l-4 border-l-rose-500">
            <div className="text-xs font-semibold text-slate-500 uppercase">Cancelled Classes</div>
            <div className="text-2xl font-black text-slate-900">{stats.cancelled}</div>
            <p className="text-[10px] text-rose-500 font-medium">Cancelled Sessions</p>
          </Card>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("LIST")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === "LIST" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ListIcon className="h-4 w-4" /> List View
            </button>
            <button
              onClick={() => setViewMode("CALENDAR")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === "CALENDAR" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarIcon className="h-4 w-4" /> Calendar View
            </button>
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "SCHEDULED", "OPEN", "LIVE", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                  filterStatus === st
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-slate-200/70 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : viewMode === "LIST" ? (
          /* List View */
          slots.length === 0 ? (
            <Card className="p-12 text-center space-y-4 border-dashed border-2">
              <Video className="h-12 w-12 text-slate-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-800">No Live Classes Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You haven't scheduled any live classes matching this filter.
                </p>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Your First Live Class
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.map((slot) => {
                const isLive = slot.status === "LIVE";
                const isCompleted = slot.status === "COMPLETED";
                const isCancelled = slot.status === "CANCELLED";

                return (
                  <Card
                    key={slot.id}
                    className={`space-y-4 transition hover:shadow-md flex flex-col justify-between ${
                      isLive ? "border-2 border-emerald-500 bg-emerald-50/20" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-700">
                          {slot.subject}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                            isLive
                              ? "bg-rose-500 text-white animate-pulse"
                              : isCompleted
                              ? "bg-slate-100 text-slate-600"
                              : isCancelled
                              ? "bg-rose-100 text-rose-700"
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                          }`}
                        >
                          ● {slot.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 line-clamp-2">{slot.title}</h3>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>
                            {new Date(slot.startTime).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            ({new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span>
                            {slot.studentCount} / {slot.maxCapacity} Students Enrolled ({slot.classType})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link href={`/teacher/live-classes/${slot.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                        </Button>
                      </Link>

                      {!isCompleted && !isCancelled && (
                        <Button
                          onClick={() => handleStartClassroom(slot.id)}
                          variant="primary"
                          size="sm"
                          leftIcon={<Play className="h-3.5 w-3.5" />}
                        >
                          Enter Classroom
                        </Button>
                      )}

                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => setCancellingSlot(slot)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                          title="Cancel Class"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          /* Calendar View */
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">Calendar View</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(["DAY", "WEEK", "MONTH"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setCalendarMode(m)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      calendarMode === m ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    {m} View
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Grid Representation */}
            <div className="grid grid-cols-7 gap-2 text-center border-b border-slate-100 pb-2 text-xs font-bold text-slate-500 uppercase">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2 min-h-[300px]">
              {Array.from({ length: 7 }).map((_, colIdx) => {
                const daySlots = slots.filter((s) => new Date(s.startTime).getDay() === colIdx);
                return (
                  <div key={colIdx} className="bg-slate-50 rounded-xl p-2 space-y-2 border border-slate-100">
                    {daySlots.length === 0 ? (
                      <div className="text-[10px] text-slate-400 text-center pt-4">No slots</div>
                    ) : (
                      daySlots.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => router.push(`/teacher/live-classes/${s.id}`)}
                          className="p-2 rounded-lg bg-blue-600 text-white text-[11px] font-bold cursor-pointer hover:bg-blue-700 transition shadow-xs text-left"
                        >
                          <div className="truncate">{s.title}</div>
                          <div className="text-[9px] opacity-90">
                            {new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* 5-Step Create Live Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" /> Create Live Class
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Step {step} of 5</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Progress Steps Header */}
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                {[
                  "1. Basic Info",
                  "2. Schedule",
                  "3. Booking",
                  "4. Classroom",
                  "5. Review",
                ].map((stTitle, idx) => (
                  <div
                    key={idx}
                    className={`py-1.5 rounded-lg transition ${
                      step === idx + 1
                        ? "bg-blue-600 text-white"
                        : step > idx + 1
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {stTitle}
                  </div>
                ))}
              </div>

              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Class Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Algebra Fundamentals & Practice"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Subject *</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                      >
                        {["Mathematics", "Science", "Physics", "Chemistry", "Biology", "Computer Science", "English"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Target Level</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                      >
                        <option value="ALL_LEVELS">All Levels</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Class Description</label>
                    <textarea
                      rows={3}
                      placeholder="Detail topics covered, prerequisites, and learning outcomes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Schedule */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Class Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Start Time *</label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">End Time *</label>
                      <input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Timezone</label>
                    <input
                      type="text"
                      disabled
                      value={timezone}
                      className="w-full px-4 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Capacity & Booking */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Class Type</label>
                      <select
                        value={classType}
                        onChange={(e) => {
                          setClassType(e.target.value);
                          if (e.target.value === "ONE_TO_ONE") setMaxCapacity(1);
                        }}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                      >
                        <option value="GROUP">Group Class (Multi-Student)</option>
                        <option value="ONE_TO_ONE">One-to-One Private</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Maximum Capacity</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(Number(e.target.value))}
                        disabled={classType === "ONE_TO_ONE"}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Class Fee ($ - set 0 for Free)</label>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Classroom Controls */}
              {step === 4 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">Classroom Permissions & Controls</label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cameraRequired}
                        onChange={(e) => setCameraRequired(e.target.checked)}
                        className="rounded-md"
                      />
                      <span>Require Student Camera</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={micRequired}
                        onChange={(e) => setMicRequired(e.target.checked)}
                        className="rounded-md"
                      />
                      <span>Require Student Mic</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whiteboardAllowed}
                        onChange={(e) => setWhiteboardAllowed(e.target.checked)}
                        className="rounded-md"
                      />
                      <span>Allow Interactive Whiteboard</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={screenSharingAllowed}
                        onChange={(e) => setScreenSharingAllowed(e.target.checked)}
                        className="rounded-md"
                      />
                      <span>Allow Screen Sharing</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Review Slot Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="font-bold">Title:</span> {title}
                    </div>
                    <div>
                      <span className="font-bold">Subject:</span> {subject}
                    </div>
                    <div>
                      <span className="font-bold">Date:</span> {date}
                    </div>
                    <div>
                      <span className="font-bold">Time:</span> {startTime} - {endTime}
                    </div>
                    <div>
                      <span className="font-bold">Type:</span> {classType} (Max {maxCapacity})
                    </div>
                    <div>
                      <span className="font-bold">Price:</span> ${price}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {step > 1 ? (
                  <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  {step < 5 ? (
                    <Button variant="primary" size="sm" onClick={() => setStep(step + 1)}>
                      Next Step
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleCreateSubmit(false)}
                      >
                        Save Draft
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleCreateSubmit(true)}
                      >
                        {submitting ? "Publishing..." : "Publish Live Class"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancellingSlot && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Cancel Live Class</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel <span className="font-bold">"{cancellingSlot.title}"</span>? Booked
                students will be notified.
              </p>
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setCancellingSlot(null)}>
                  Keep Class
                </Button>
                <Button variant="outline" size="sm" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30" onClick={handleCancelConfirm}>
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

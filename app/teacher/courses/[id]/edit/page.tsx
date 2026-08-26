"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  PlayCircle,
  FileText,
  Paperclip,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  Eye,
  Check,
  X,
  Layers,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function TeacherCourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [savingStatus, setSavingStatus] = useState<"IDLE" | "SAVING" | "SAVED">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1 Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [level, setLevel] = useState("BEGINNER");
  const [price, setPrice] = useState("0");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Step 2 Outcomes & Reqs state
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState("");
  const [reqs, setReqs] = useState<string[]>([]);
  const [newReq, setNewReq] = useState("");

  // Modals state for Curriculum
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("VIDEO");
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [lessonContent, setLessonContent] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadedVideoAssetId, setUploadedVideoAssetId] = useState("");
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(300);
  const [userName, setUserName] = useState("Educator");
  const [userEmail, setUserEmail] = useState("");

  const fetchEditorData = async () => {
    setLoading(true);
    try {
      const profileRes = await fetch("/api/teacher/onboarding");
      const profileJson = await profileRes.json();
      if (profileJson.data) {
        setUserName(`${profileJson.data.profile.firstName} ${profileJson.data.profile.lastName}`.trim() || profileJson.data.user.email);
        setUserEmail(profileJson.data.user.email);
      }

      const res = await fetch(`/api/teacher/courses/${courseId}`);
      const data = await res.json();
      if (data.success && data.data.course) {
        const c = data.data.course;
        setCourse(c);
        setTitle(c.title || "");
        setSubtitle(c.subtitle || "");
        setDescription(c.description || "");
        setSubject(c.subject || "Mathematics");
        setCategory(c.category || "General");
        setLevel(c.level || "BEGINNER");
        setPrice(c.price !== undefined ? c.price.toString() : "0");
        setThumbnailUrl(c.thumbnailUrl || "");
        setOutcomes(c.learningOutcomes || []);
        setReqs(c.requirements || []);
      }
    } catch (err) {
      console.error("Failed to fetch editor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchEditorData();
  }, [courseId]);

  const handleSaveBasicInfo = async () => {
    setSavingStatus("SAVING");
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          subject,
          category,
          level,
          price: Number(price) || 0,
          thumbnailUrl,
          learningOutcomes: outcomes,
          requirements: reqs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavingStatus("SAVED");
        fetchEditorData();
        setTimeout(() => setSavingStatus("IDLE"), 2000);
      }
    } catch (err) {
      console.error("Failed to save course info:", err);
      setSavingStatus("IDLE");
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/teacher/upload-thumbnail", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data.thumbnailUrl) {
        setThumbnailUrl(data.data.thumbnailUrl);
        handleSaveBasicInfo();
      }
    } catch (err) {
      console.error("Failed to upload thumbnail:", err);
    } finally {
      setUploadingThumb(false);
    }
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoStatus, setVideoStatus] = useState<"IDLE" | "UPLOADING" | "UPLOADED" | "PROCESSING" | "READY" | "FAILED">("IDLE");

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setVideoStatus("UPLOADING");
    setUploadProgress(0);

    try {
      const res = await fetch("/api/teacher/videos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId: selectedSectionId || courseId }),
      });
      const data = await res.json();
      if (data.success && data.data.uploadUrl) {
        const { uploadUrl, assetId } = data.data;

        // Perform XHR upload to Mux for exact percentage tracking
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const percent = Math.round((evt.loaded / evt.total) * 100);
              setUploadProgress(percent);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response);
            } else {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error during video upload"));
          xhr.send(file);
        });

        setVideoStatus("READY");
        setUploadedVideoAssetId(assetId);
      } else if (data.data?.assetId) {
        setUploadedVideoAssetId(data.data.assetId);
        setVideoStatus("READY");
      }
    } catch (err) {
      console.error("Failed to upload video to Mux:", err);
      setVideoStatus("FAILED");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sectionTitle }),
      });
      if (res.ok) {
        setSectionTitle("");
        setShowSectionModal(false);
        fetchEditorData();
      }
    } catch (err) {
      console.error("Failed to add section:", err);
    }
  };

  const handleDeleteSection = async (secId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      await fetch(`/api/teacher/sections/${secId}`, { method: "DELETE" });
      fetchEditorData();
    } catch (err) {
      console.error("Failed to delete section:", err);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !selectedSectionId) return;
    try {
      const res = await fetch(`/api/teacher/sections/${selectedSectionId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonTitle,
          type: lessonType,
          videoAssetId: uploadedVideoAssetId || undefined,
          durationSeconds: videoDurationSeconds,
          isPreview: lessonIsPreview,
          content: lessonContent || undefined,
        }),
      });
      if (res.ok) {
        setLessonTitle("");
        setUploadedVideoAssetId("");
        setLessonContent("");
        setShowLessonModal(false);
        fetchEditorData();
      }
    } catch (err) {
      console.error("Failed to add lesson:", err);
    }
  };

  const handleDeleteLesson = async (lesId: string) => {
    try {
      await fetch(`/api/teacher/lessons/${lesId}`, { method: "DELETE" });
      fetchEditorData();
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    }
  };

  const handlePublish = async () => {
    setErrorMsg("");

    // Verify video processing status across sections
    const isProcessing = course?.sections?.some((s: any) =>
      s.lessons?.some((l: any) => l.status === "PROCESSING" || l.status === "UPLOADING")
    );
    if (isProcessing) {
      setErrorMsg("Your video is still processing. Please wait until video processing is completed.");
      return;
    }

    const hasFailed = course?.sections?.some((s: any) =>
      s.lessons?.some((l: any) => l.status === "FAILED")
    );
    if (hasFailed) {
      setErrorMsg("Video processing failed. Upload another video.");
      return;
    }

    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        fetchEditorData();
      } else {
        setErrorMsg(data.error || "Failed to publish course.");
      }
    } catch (err: any) {
      setErrorMsg("Publish request failed.");
    }
  };

  const handleUnpublish = async () => {
    try {
      await fetch(`/api/teacher/courses/${courseId}/unpublish`, { method: "POST" });
      fetchEditorData();
    } catch (err) {
      console.error("Failed to unpublish:", err);
    }
  };

  if (loading || !course) {
    return (
      <DashboardLayout role="TEACHER" userName={userName} userEmail={userEmail}>
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="TEACHER" userName={userName} userEmail={userEmail}>
      <div className="space-y-8">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/teacher/courses" className="text-xs text-blue-400 font-semibold hover:underline">
                ← Back to Courses
              </Link>
              <span className="text-slate-600">•</span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  course.status === "PUBLISHED"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {course.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-50 mt-1">{course.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {savingStatus === "SAVING" && (
              <span className="text-xs text-amber-400 font-semibold animate-pulse">Saving...</span>
            )}
            {savingStatus === "SAVED" && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved ✓
              </span>
            )}

            <button
              onClick={handleSaveBasicInfo}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              <Save className="w-3.5 h-3.5" /> Save Progress
            </button>

            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              <Eye className="w-3.5 h-3.5" /> Student Preview
            </Link>
          </div>
        </div>

        {/* Builder Step Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {[
            { step: 1, label: "1. Basic Info" },
            { step: 2, label: "2. Outcomes & Reqs" },
            { step: 3, label: "3. Curriculum Builder" },
            { step: 4, label: "4. Pricing & Publish" },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                activeStep === s.step
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* STEP 1: BASIC INFO */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">Course Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Course Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Description *</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Subject *</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none"
                    >
                      {["Mathematics", "Science", "Physics", "Chemistry", "Biology", "Computer Science", "English"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Difficulty Level *</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Upload Sidebar */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100">Course Thumbnail</h3>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4 text-slate-500 text-xs">No thumbnail uploaded</div>
                )}
              </div>

              <label className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-center block cursor-pointer hover:bg-blue-600/30">
                {uploadingThumb ? "Uploading Thumbnail..." : "Upload New Thumbnail"}
                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: OUTCOMES & REQS */}
        {activeStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Learning Outcomes */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" /> What Students Will Learn
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Master quadratic equations"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none"
                />
                <button
                  onClick={() => {
                    if (newOutcome.trim()) {
                      setOutcomes([...outcomes, newOutcome.trim()]);
                      setNewOutcome("");
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {outcomes.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>✓ {item}</span>
                    <button onClick={() => setOutcomes(outcomes.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-100">Prerequisites & Requirements</h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Basic algebra knowledge"
                  value={newReq}
                  onChange={(e) => setNewReq(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none"
                />
                <button
                  onClick={() => {
                    if (newReq.trim()) {
                      setReqs([...reqs, newReq.trim()]);
                      setNewReq("");
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {reqs.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>• {item}</span>
                    <button onClick={() => setReqs(reqs.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CURRICULUM BUILDER */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Curriculum Sections & Lessons</h3>
              <button
                onClick={() => setShowSectionModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>

            {course.sections?.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                No sections created yet. Click "+ Add Section" to start building your course curriculum.
              </div>
            ) : (
              <div className="space-y-6">
                {course.sections.map((sec: any, secIdx: number) => (
                  <div key={sec.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="font-bold text-sm text-slate-200">
                        Section {secIdx + 1}: {sec.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSectionId(sec.id);
                            setShowLessonModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        >
                          + Add Lesson
                        </button>
                        <button onClick={() => handleDeleteSection(sec.id)} className="text-slate-500 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {sec.lessons.length === 0 ? (
                        <div className="text-xs text-slate-500 italic p-3">No lessons in this section yet.</div>
                      ) : (
                        sec.lessons.map((les: any, lesIdx: number) => (
                          <div key={les.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {les.type === "VIDEO" ? (
                                <PlayCircle className="w-4 h-4 text-blue-400 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                              )}
                              <div>
                                <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                                  <span>{lesIdx + 1}. {les.title}</span>
                                  {les.isPreview && (
                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-500/20 text-blue-400">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                {les.videoAssetId && (
                                  <div className="text-[10px] text-emerald-400 font-mono">Video Uploaded ✓</div>
                                )}
                              </div>
                            </div>

                            <button onClick={() => handleDeleteLesson(les.id)} className="text-slate-500 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: PRICING & PUBLISH */}
        {activeStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-slate-100">Course Pricing & Access</h3>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Course Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">Set to 0 to make this course completely free for students.</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-100">Publishing Status</div>
                  <div className="text-xs text-slate-400">Current status: {course.status}</div>
                </div>

                {course.status === "PUBLISHED" ? (
                  <button
                    onClick={handleUnpublish}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  >
                    Unpublish Course
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="px-6 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105 transition"
                  >
                    Publish Course Now
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Checklist Drawer */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100">Publish Requirement Checklist</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span>Course Title</span>
                  {course.checklist?.hasTitle ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex items-center justify-between">
                  <span>Course Description</span>
                  {course.checklist?.hasDescription ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex items-center justify-between">
                  <span>Course Thumbnail</span>
                  {course.checklist?.hasThumbnail ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex items-center justify-between">
                  <span>Subject Category</span>
                  {course.checklist?.hasSubject ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex items-center justify-between">
                  <span>Curriculum Sections</span>
                  {course.checklist?.hasSections ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex items-center justify-between">
                  <span>Course Lessons</span>
                  {course.checklist?.hasLessons ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Section Modal */}
        {showSectionModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-100">Add New Section</h3>
              <form onSubmit={handleAddSection} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Introduction to Calculus"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowSectionModal(false)} className="text-xs text-slate-400">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white">
                    Add Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Lesson Modal */}
        {showLessonModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-100">Add New Lesson</h3>
              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Lesson Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lesson 1: Derivatives Concept"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Lesson Video Upload</label>
                  <label className="w-full py-3 px-4 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 border-dashed text-slate-300 flex items-center justify-center gap-2 cursor-pointer hover:border-blue-500">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>{uploadingVideo ? "Uploading Video..." : uploadedVideoAssetId ? "Video Selected ✓" : "Upload Video Lesson File"}</span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="preview"
                    checked={lessonIsPreview}
                    onChange={(e) => setLessonIsPreview(e.target.checked)}
                    className="text-blue-600 rounded"
                  />
                  <label htmlFor="preview" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Mark as Free Preview Lesson
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowLessonModal(false)} className="text-xs text-slate-400">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white">
                    Save Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

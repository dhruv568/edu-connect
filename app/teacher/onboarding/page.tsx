"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassButton } from "@/components/glass/glass-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { DocumentViewerModal } from "@/components/shared/document-viewer-modal";
import { QualificationItem, CertificateItem, DocumentItem, VerificationStatus } from "@/types/auth";
import { formatCurrency } from "@/lib/currency";
import {
  CheckCircle2,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Upload,
  Eye,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Lock,
} from "lucide-react";

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // User state
  const [userInfo, setUserInfo] = useState({
    id: "",
    email: "",
    emailVerified: false,
    role: "TEACHER",
  });

  // Personal & Professional Form State
  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    avatarUrl: "",
    phone: "",
    bio: "",
    location: "",
  });

  const [professional, setProfessional] = useState({
    headline: "",
    subjects: ["Mathematics", "Physics"],
    experienceYears: 5,
    hourlyRate: 45,
    languages: ["English"],
    teachingMode: "ONLINE",
    verificationStatus: "PENDING" as VerificationStatus,
  });

  // Lists State
  const [qualifications, setQualifications] = useState<QualificationItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [readiness, setReadiness] = useState({ isReady: false, completionPercentage: 0, missingItems: [] as string[] });

  // Modal / Form States
  const [viewDoc, setViewDoc] = useState<DocumentItem | null>(null);

  // Add Qualification Form Modal
  const [showQualModal, setShowQualModal] = useState(false);
  const [newQual, setNewQual] = useState({ degree: "", institution: "", specialization: "", year: new Date().getFullYear(), description: "" });

  // Add Certificate Form Modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCert, setNewCert] = useState({ name: "", issuer: "", issueDate: "", expiryDate: "", description: "" });

  // Document Upload Form
  const [showDocModal, setShowDocModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("IDENTITY");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Subject options
  const AVAILABLE_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Programming", "English", "Economics", "Statistics"];
  const AVAILABLE_LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Mandarin"];

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/onboarding");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load onboarding status");

      setUserInfo(json.data.user);
      setPersonal(json.data.profile);
      setProfessional(json.data.teacherProfile);
      setQualifications(json.data.qualifications || []);
      setCertificates(json.data.certificates || []);
      setDocuments(json.data.documents || []);
      setReadiness(json.data.readiness || { isReady: false, completionPercentage: 0, missingItems: [] });
    } catch (err: any) {
      showToast("Error Loading Onboarding", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // STEP VALIDATION LOGIC
  const isStepValid = (stepNum: number): { valid: boolean; reason?: string } => {
    if (stepNum === 1) {
      if (!userInfo.emailVerified) {
        return { valid: false, reason: "Email address must be verified via OTP to unlock profile setup." };
      }
      return { valid: true };
    }

    if (stepNum === 2) {
      if (!personal.firstName?.trim()) return { valid: false, reason: "First Name is required." };
      if (!personal.lastName?.trim()) return { valid: false, reason: "Last Name is required." };
      if (!personal.bio?.trim() || personal.bio.trim().length < 10) {
        return { valid: false, reason: "Biography is required (minimum 10 characters)." };
      }
      return { valid: true };
    }

    if (stepNum === 3) {
      if (!professional.headline?.trim()) return { valid: false, reason: "Professional Headline is required." };
      if (!professional.subjects || professional.subjects.length === 0) {
        return { valid: false, reason: "At least one teaching subject must be selected." };
      }
      if (professional.experienceYears === undefined || professional.experienceYears < 0) {
        return { valid: false, reason: "Years of experience is required." };
      }
      if (!professional.hourlyRate || professional.hourlyRate <= 0) {
        return { valid: false, reason: "Hourly rate must be greater than ₹0." };
      }
      return { valid: true };
    }

    if (stepNum === 4) {
      if (!qualifications || qualifications.length === 0) {
        return { valid: false, reason: "At least one Educational Qualification must be added." };
      }
      return { valid: true };
    }

    if (stepNum === 5) {
      return { valid: true };
    }

    if (stepNum === 6) {
      const hasIdentityDoc = documents.some((d) => d.category === "IDENTITY");
      if (!hasIdentityDoc) {
        return { valid: false, reason: "At least one Identity Document (Passport / National ID / Driving License) must be uploaded." };
      }
      return { valid: true };
    }

    if (stepNum === 7) {
      return { valid: readiness.isReady };
    }

    return { valid: true };
  };

  const canAccessStep = (targetStep: number): boolean => {
    if (professional.verificationStatus === "VERIFIED" || readiness.isReady) return true;
    if (targetStep <= 1) return true;
    for (let i = 1; i < targetStep; i++) {
      if (!isStepValid(i).valid) return false;
    }
    return true;
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === activeStep) return;

    if (professional.verificationStatus === "VERIFIED" || readiness.isReady || targetStep < activeStep) {
      setActiveStep(targetStep);
      return;
    }

    for (let i = 1; i < targetStep; i++) {
      const check = isStepValid(i);
      if (!check.valid) {
        showToast("Step Locked 🔒", `Complete Step 0${i} first: ${check.reason}`, "error");
        setActiveStep(i);
        return;
      }
    }

    setActiveStep(targetStep);
  };

  // Handlers for profile updates
  const handleSaveProfile = async (quiet = false) => {
    setSaving(true);
    try {
      const res = await fetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personal,
          ...professional,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save profile details");

      await fetchOnboardingData();
      if (!quiet) showToast("Profile Saved", "Personal and professional details updated successfully.", "success");
      return true;
    } catch (err: any) {
      showToast("Save Error", err.message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNextStep = async () => {
    const currentValidation = isStepValid(activeStep);
    if (!currentValidation.valid) {
      showToast("Step Locked 🔒", currentValidation.reason || "Please complete all required fields.", "error");
      return;
    }

    if (activeStep === 2 || activeStep === 3) {
      const saved = await handleSaveProfile(true);
      if (!saved) return;
    }

    if (activeStep < 7) {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Qualification CRUD
  const handleAddQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teacher/qualifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQual),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add qualification");

      showToast("Qualification Added", "Educational degree added.", "success");
      setShowQualModal(false);
      setNewQual({ degree: "", institution: "", specialization: "", year: new Date().getFullYear(), description: "" });
      fetchOnboardingData();
    } catch (err: any) {
      showToast("Qualification Error", err.message, "error");
    }
  };

  const handleDeleteQualification = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/qualifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete qualification");
      showToast("Qualification Removed", "", "info");
      fetchOnboardingData();
    } catch (err: any) {
      showToast("Error", err.message, "error");
    }
  };

  // Certificate CRUD
  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teacher/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCert),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add certificate");

      showToast("Certificate Added", "Certification record saved.", "success");
      setShowCertModal(false);
      setNewCert({ name: "", issuer: "", issueDate: "", expiryDate: "", description: "" });
      fetchOnboardingData();
    } catch (err: any) {
      showToast("Certificate Error", err.message, "error");
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/certificates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete certificate");
      showToast("Certificate Removed", "", "info");
      fetchOnboardingData();
    } catch (err: any) {
      showToast("Error", err.message, "error");
    }
  };

  // Document Upload
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast("File Required", "Please select a file to upload.", "error");
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("category", uploadCategory);

      const res = await fetch("/api/teacher/documents", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Document upload failed");

      showToast("Document Uploaded", `${uploadFile.name} uploaded securely.`, "success");
      setShowDocModal(false);
      setUploadFile(null);
      fetchOnboardingData();
    } catch (err: any) {
      showToast("Upload Error", err.message, "error");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
      showToast("Document Deleted", "", "info");
      fetchOnboardingData();
    } catch (err: any) {
      showToast("Error", err.message, "error");
    }
  };

  // Submit Application
  const handleSubmitVerification = async () => {
    setSubmitting(true);
    try {
      await handleSaveProfile(true);

      const res = await fetch("/api/teacher/verification/submit", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit verification application");

      showToast("Application Submitted! 🎓", "Your application is now PENDING REVIEW by EduConnect Admin.", "success");
      router.push("/teacher/verification");
    } catch (err: any) {
      showToast("Submission Failed", err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Account", icon: User },
    { number: 2, title: "Personal", icon: User },
    { number: 3, title: "Professional", icon: Briefcase },
    { number: 4, title: "Qualifications", icon: GraduationCap },
    { number: 5, title: "Certificates", icon: Award },
    { number: 6, title: "Documents", icon: FileText },
    { number: 7, title: "Review & Submit", icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <DashboardLayout role="TEACHER" userName={personal.firstName || "Teacher"} userEmail={userInfo.email}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading EduConnect Teacher Portal...</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStepValidation = isStepValid(activeStep);

  return (
    <DashboardLayout role="TEACHER" userName={personal.firstName || "Teacher"} userEmail={userInfo.email}>
      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Teacher Verification & Profile Setup
              </h1>
              <StatusBadge status={professional.verificationStatus} />
            </div>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              Complete each required section to unlock verification submission.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-700">Verification Readiness</div>
              <div className="text-sm font-black text-blue-600">{readiness.completionPercentage}% Complete</div>
            </div>
            <div className="w-24 bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${readiness.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Navigation Indicator with Strict Lock Icons */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[640px] px-2">
            {steps.map((step) => {
              const accessible = canAccessStep(step.number);
              const isCompleted = activeStep > step.number || (step.number === 7 && readiness.isReady);
              const isCurrent = activeStep === step.number;
              const stepValidation = isStepValid(step.number);

              return (
                <button
                  key={step.number}
                  onClick={() => handleStepClick(step.number)}
                  disabled={!accessible}
                  className={`flex flex-col items-center gap-1.5 transition-all group ${
                    isCurrent
                      ? "text-blue-600 font-extrabold"
                      : isCompleted
                      ? "text-emerald-600 font-bold"
                      : accessible
                      ? "text-slate-600 hover:text-blue-600 font-medium"
                      : "text-slate-300 cursor-not-allowed opacity-60 font-normal"
                  }`}
                  title={!accessible ? `Locked: Complete Step 0${step.number - 1} first` : step.title}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-105"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : accessible
                        ? "bg-slate-100 text-slate-700 border border-slate-300"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {!accessible ? (
                      <Lock className="h-4 w-4 text-slate-400" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="text-[11px] whitespace-nowrap flex items-center gap-1">
                    {step.title}
                    {!accessible && <Lock className="h-3 w-3 text-slate-400" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <GlassCard className="p-6 md:p-8 space-y-6 border border-slate-200 bg-white">
          {/* Validation Warning Alert for current step if invalid */}
          {!currentStepValidation.valid && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Step 0{activeStep} Incomplete 🔒</strong>
                <span>{currentStepValidation.reason} Complete this step to unlock the next step.</span>
              </div>
            </div>
          )}

          {/* STEP 1: ACCOUNT STATUS */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">01. Account & Security Verification</h2>
                  <p className="text-xs text-slate-500">Verify account ownership & basic role status</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Email</span>
                  <div className="text-base font-extrabold text-slate-900">{userInfo.email}</div>
                  <div className="pt-2">
                    <StatusBadge status={userInfo.emailVerified ? "EMAIL_VERIFIED" : "EMAIL_UNVERIFIED"} />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Governance Role</span>
                  <div className="text-base font-extrabold text-slate-900">EDUCATOR / TUTOR (TEACHER)</div>
                  <p className="text-xs text-slate-500">Authorized for profile verification & marketplace listing.</p>
                </div>
              </div>

              {!userInfo.emailVerified ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Email Verification Mandatory:</strong> Your registered email must be verified before proceeding to personal profile setup. Please verify via the OTP link sent to your inbox.
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span><strong>Account Verified:</strong> Your email address is confirmed. You may proceed to Step 02.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PERSONAL INFORMATION */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">02. Personal Profile Information</h2>
                  <p className="text-xs text-slate-500">Tell students and administration about yourself</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  value={personal.firstName}
                  onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                  placeholder="e.g. Sarah"
                  required
                />
                <Input
                  label="Last Name *"
                  value={personal.lastName}
                  onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                  placeholder="e.g. Jenkins"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone Number"
                  value={personal.phone || ""}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                />
                <Input
                  label="City / Location"
                  value={personal.location || ""}
                  onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                  placeholder="e.g. New York, USA or Online"
                />
              </div>

              <Input
                label="Profile Avatar URL (Optional Image Link)"
                value={personal.avatarUrl || ""}
                onChange={(e) => setPersonal({ ...personal, avatarUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Professional Biography * (Min 10 characters)</label>
                <textarea
                  value={personal.bio}
                  onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Provide an overview of your teaching methodology, passion, and academic background..."
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3: PROFESSIONAL INFORMATION */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">03. Professional & Teaching Details</h2>
                  <p className="text-xs text-slate-500">Specify subjects, experience, pricing, and mode</p>
                </div>
              </div>

              <Input
                label="Professional Headline *"
                value={professional.headline}
                onChange={(e) => setProfessional({ ...professional, headline: e.target.value })}
                placeholder="e.g. Senior STEM Educator & Olympiad Coach"
                required
              />

              {/* Subjects Multi-select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Teaching Subjects (Select at least 1) *</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SUBJECTS.map((subj) => {
                    const isSelected = professional.subjects.includes(subj);
                    return (
                      <button
                        type="button"
                        key={subj}
                        onClick={() => {
                          const updated = isSelected
                            ? professional.subjects.filter((s) => s !== subj)
                            : [...professional.subjects, subj];
                          setProfessional({ ...professional, subjects: updated });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {subj} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Years of Experience *"
                  type="number"
                  min={0}
                  value={professional.experienceYears}
                  onChange={(e) => setProfessional({ ...professional, experienceYears: Number(e.target.value) })}
                  required
                />

                <Input
                  label="Hourly Rate (₹ INR) *"
                  type="number"
                  min={10}
                  value={professional.hourlyRate}
                  onChange={(e) => setProfessional({ ...professional, hourlyRate: Number(e.target.value) })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Preferred Teaching Mode *</label>
                  <select
                    value={professional.teachingMode}
                    onChange={(e) => setProfessional({ ...professional, teachingMode: e.target.value as any })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold outline-none"
                  >
                    <option value="ONLINE">ONLINE ONLY</option>
                    <option value="OFFLINE">OFFLINE ONLY</option>
                    <option value="BOTH">BOTH (ONLINE & OFFLINE)</option>
                  </select>
                </div>
              </div>

              {/* Languages Multi-select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = professional.languages.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => {
                          const updated = isSelected
                            ? professional.languages.filter((l) => l !== lang)
                            : [...professional.languages, lang];
                          setProfessional({ ...professional, languages: updated });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {lang} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: QUALIFICATIONS */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">04. Educational Qualifications</h2>
                    <p className="text-xs text-slate-500">Degrees, diplomas, and academic background (At least 1 required)</p>
                  </div>
                </div>

                <GlassButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowQualModal(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Qualification
                </GlassButton>
              </div>

              {qualifications.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-amber-300 rounded-3xl space-y-3 bg-amber-50/40">
                  <GraduationCap className="h-12 w-12 text-amber-500 mx-auto animate-bounce" />
                  <div className="text-sm font-extrabold text-amber-900">Qualification Required 🔒</div>
                  <p className="text-xs text-amber-800 max-w-sm mx-auto">
                    You must add at least one degree or diploma qualification before you can proceed to subsequent steps.
                  </p>
                  <button
                    onClick={() => setShowQualModal(true)}
                    className="mt-2 text-xs font-extrabold text-blue-600 hover:underline bg-white px-4 py-2 rounded-xl shadow-2xs border border-slate-200"
                  >
                    + Add Qualification Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {qualifications.map((q) => (
                    <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative group">
                      <button
                        onClick={() => handleDeleteQualification(q.id)}
                        className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Qualification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                        {q.year}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">{q.degree}</h4>
                      <p className="text-xs font-bold text-slate-600">{q.institution}</p>
                      {q.specialization && <p className="text-xs text-slate-500">Specialization: {q.specialization}</p>}
                      {q.description && <p className="text-xs text-slate-500 italic mt-1">"{q.description}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: CERTIFICATES */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">05. Certifications & Badges</h2>
                    <p className="text-xs text-slate-500">Teaching licenses, Google/Microsoft certifications, etc. (Optional)</p>
                  </div>
                </div>

                <GlassButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCertModal(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Certificate
                </GlassButton>
              </div>

              {certificates.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3 bg-slate-50/50">
                  <Award className="h-12 w-12 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-700">No Certificates Added</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Certificates build high trust with parents & students. Add any relevant teaching credentials or click Next to proceed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((c) => (
                    <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                      <button
                        onClick={() => handleDeleteCertificate(c.id)}
                        className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <h4 className="text-base font-extrabold text-slate-900">{c.name}</h4>
                      <p className="text-xs font-bold text-slate-600">Issued by: {c.issuer}</p>
                      <p className="text-[11px] text-slate-500">
                        Issued: {new Date(c.issueDate).toLocaleDateString()}
                        {c.expiryDate && ` • Expires: ${new Date(c.expiryDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: SECURE DOCUMENT UPLOAD */}
          {activeStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">06. Verification Documents</h2>
                    <p className="text-xs text-slate-500">Identity document (Passport / National ID / Driving License) required</p>
                  </div>
                </div>

                <GlassButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowDocModal(true)}
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  Upload Document
                </GlassButton>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Document Protection:</strong> All uploaded files are stored in private secure cloud storage.
                    Direct access is strictly restricted to EduConnect verification admins.
                  </span>
                </div>
              </div>

              {documents.length === 0 || !documents.some((d) => d.category === "IDENTITY") ? (
                <div className="p-12 text-center border-2 border-dashed border-amber-300 rounded-3xl space-y-3 bg-amber-50/40">
                  <Upload className="h-12 w-12 text-amber-500 mx-auto animate-bounce" />
                  <div className="text-sm font-extrabold text-amber-900">Identity Document Required 🔒</div>
                  <p className="text-xs text-amber-800 max-w-sm mx-auto">
                    At least one Identity Document (Passport / Driving License / National ID) is mandatory to unlock final submission.
                  </p>
                  <button
                    onClick={() => {
                      setUploadCategory("IDENTITY");
                      setShowDocModal(true);
                    }}
                    className="mt-2 text-xs font-extrabold text-blue-600 hover:underline bg-white px-4 py-2 rounded-xl shadow-2xs border border-slate-200"
                  >
                    + Upload Identity Document Now
                  </button>
                </div>
              ) : null}

              {documents.length > 0 && (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900">{doc.fileName}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-200 text-slate-700 uppercase">
                              {doc.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {doc.fileType} • {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewDoc(doc)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-600" /> Preview
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 7: REVIEW & SUBMIT */}
          {activeStep === 7 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">07. Review Application & Submit</h2>
                  <p className="text-xs text-slate-500">Double check all details before sending to administration</p>
                </div>
              </div>

              {/* Verification Readiness Banner */}
              <div
                className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                  readiness.isReady
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-black">
                      Verification Readiness Score: {readiness.completionPercentage}%
                    </h3>
                  </div>
                  {readiness.isReady ? (
                    <p className="text-xs text-emerald-700">
                      Your profile satisfies all required verification criteria. Ready for administrative review!
                    </p>
                  ) : (
                    <div className="text-xs text-amber-800 space-y-1">
                      <p className="font-bold">The following required items are missing:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {readiness.missingItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <GlassButton
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={!readiness.isReady || submitting}
                    isLoading={submitting}
                    onClick={handleSubmitVerification}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                    rightIcon={<ShieldCheck className="h-5 w-5" />}
                  >
                    Submit for Verification
                  </GlassButton>
                </div>
              </div>

              {/* Review Sections */}
              <div className="space-y-4 pt-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900">Personal & Professional Summary</h4>
                    <button onClick={() => setActiveStep(2)} className="text-xs font-bold text-blue-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold block">Full Name</span>
                      <span className="font-bold text-slate-900">{personal.firstName} {personal.lastName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Headline</span>
                      <span className="font-bold text-slate-900">{professional.headline || "Educator"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Experience</span>
                      <span className="font-bold text-slate-900">{professional.experienceYears} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Hourly Rate</span>
                      <span className="font-bold text-slate-900">{formatCurrency(professional.hourlyRate)} / hr</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900">Qualifications ({qualifications.length})</h4>
                    <button onClick={() => setActiveStep(4)} className="text-xs font-bold text-blue-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-xs space-y-1">
                    {qualifications.map((q) => (
                      <div key={q.id} className="font-semibold text-slate-800">
                        • {q.degree} from {q.institution} ({q.year})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900">Uploaded Documents ({documents.length})</h4>
                    <button onClick={() => setActiveStep(6)} className="text-xs font-bold text-blue-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-xs space-y-1">
                    {documents.map((d) => (
                      <div key={d.id} className="font-semibold text-slate-800">
                        • [{d.category}] {d.fileName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                activeStep === 1
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-700 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              <ArrowLeft className="h-4 w-4" /> Previous Step
            </button>

            <div className="flex items-center gap-3">
              {activeStep >= 2 && (
                <GlassButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={saving}
                  onClick={() => handleSaveProfile(false)}
                >
                  Save Profile Changes
                </GlassButton>
              )}

              {activeStep < 7 && (
                <GlassButton
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!currentStepValidation.valid}
                  onClick={handleNextStep}
                  rightIcon={currentStepValidation.valid ? <ArrowRight className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                >
                  Next Step {currentStepValidation.valid ? "" : "🔒"}
                </GlassButton>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* MODAL: ADD QUALIFICATION */}
      {showQualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900">Add Educational Qualification</h3>
            <form onSubmit={handleAddQualification} className="space-y-4">
              <Input
                label="Degree / Diploma Title *"
                value={newQual.degree}
                onChange={(e) => setNewQual({ ...newQual, degree: e.target.value })}
                placeholder="e.g. B.Tech Computer Science"
                required
              />
              <Input
                label="Institution / University *"
                value={newQual.institution}
                onChange={(e) => setNewQual({ ...newQual, institution: e.target.value })}
                placeholder="e.g. Stanford University"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Specialization"
                  value={newQual.specialization}
                  onChange={(e) => setNewQual({ ...newQual, specialization: e.target.value })}
                  placeholder="e.g. Artificial Intelligence"
                />
                <Input
                  label="Year Completed *"
                  type="number"
                  value={newQual.year}
                  onChange={(e) => setNewQual({ ...newQual, year: Number(e.target.value) })}
                  required
                />
              </div>
              <Input
                label="Optional Description"
                value={newQual.description}
                onChange={(e) => setNewQual({ ...newQual, description: e.target.value })}
                placeholder="e.g. Graduated with Honors"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQualModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <GlassButton type="submit" variant="primary" size="sm">
                  Save Qualification
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CERTIFICATE */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900">Add Professional Certificate</h3>
            <form onSubmit={handleAddCertificate} className="space-y-4">
              <Input
                label="Certificate Name *"
                value={newCert.name}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                placeholder="e.g. Google Certified Educator"
                required
              />
              <Input
                label="Issuing Organization *"
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                placeholder="e.g. Google for Education"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Issue Date *"
                  type="date"
                  value={newCert.issueDate}
                  onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                  required
                />
                <Input
                  label="Expiry Date (Optional)"
                  type="date"
                  value={newCert.expiryDate}
                  onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <GlassButton type="submit" variant="primary" size="sm">
                  Save Certificate
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT UPLOAD */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900">Upload Verification Document</h3>
            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Document Category *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="IDENTITY">IDENTITY (Passport, Driving License, National ID)</option>
                  <option value="QUALIFICATION">QUALIFICATION (Degree Certificate, Marksheets)</option>
                  <option value="CERTIFICATE">CERTIFICATE (Teaching License, Awards)</option>
                  <option value="EXPERIENCE">EXPERIENCE (Relieving Letter, Experience Proof)</option>
                  <option value="OTHER">OTHER SUPPORTING DOCUMENT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Select File (PDF, PNG, JPG max 10MB) *</label>
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/jpg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <GlassButton type="submit" variant="primary" size="sm" isLoading={uploadingDoc}>
                  Upload File
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURE DOCUMENT PREVIEW MODAL */}
      <DocumentViewerModal document={viewDoc} isOpen={!!viewDoc} onClose={() => setViewDoc(null)} />
    </DashboardLayout>
  );
}

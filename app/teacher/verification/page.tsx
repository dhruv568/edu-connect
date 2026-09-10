"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { BackButton } from "@/components/ui/back-button";
import { useToast } from "@/components/ui/toast";
import { VerificationStatus, VerificationHistoryItem } from "@/types/auth";
import {
  ShieldCheck,
  Clock,
  XCircle,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Mail,
  History,
  FileEdit,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export default function TeacherVerificationStatusPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [statusData, setStatusData] = useState<{
    emailVerified: boolean;
    verificationStatus: VerificationStatus;
    submittedAt: string | null;
    verifiedAt: string | null;
    rejectedAt: string | null;
    suspendedAt: string | null;
    rejectionReason: string | null;
    suspensionReason: string | null;
    history: VerificationHistoryItem[];
  }>({
    emailVerified: false,
    verificationStatus: "PENDING",
    submittedAt: null,
    verifiedAt: null,
    rejectedAt: null,
    suspendedAt: null,
    rejectionReason: null,
    suspensionReason: null,
    history: [],
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/teacher/verification/status");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch verification status");
      setStatusData(json.data);
    } catch (err: any) {
      showToast("Error", err.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper to format reasons cleanly (removes raw quotes if backend sends quoted string)
  const formatReason = (reasonStr?: string | null) => {
    if (!reasonStr) return "";
    return reasonStr.replace(/^["']|["']$/g, "").trim();
  };

  if (loading) {
    return (
      <DashboardLayout role="TEACHER">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 text-[#0B4F4B] animate-spin" />
          <p className="text-sm font-semibold text-[#5D7373]">Loading Verification Status...</p>
        </div>
      </DashboardLayout>
    );
  }

  const { verificationStatus, submittedAt, verifiedAt, rejectionReason, suspensionReason, history } = statusData;
  const cleanRejectionReason = formatReason(rejectionReason);
  const cleanSuspensionReason = formatReason(suspensionReason);

  return (
    <DashboardLayout role="TEACHER">
      <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#DCE5E4] shadow-xs">
          <div>
            <BackButton
              fallbackUrl="/teacher/dashboard"
              label="Back to Dashboard"
              variant="default"
              className="mb-2 text-xs"
            />
            <h1 className="text-2xl lg:text-3xl font-black text-[#102A2A] tracking-tight">
              Teacher Verification Dashboard
            </h1>
            <p className="text-xs lg:text-sm text-[#5D7373] mt-0.5 font-medium">
              EduConnects Administrative Credential & Verification Status
            </p>
          </div>

          <button
            onClick={fetchStatus}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F5F7F8] border border-[#DCE5E4] text-[#102A2A] hover:bg-[#DCE5E4] transition-colors text-xs font-bold shrink-0 self-start sm:self-center"
            title="Refresh Verification Status"
          >
            <RefreshCw className={`h-4 w-4 text-[#0B4F4B] ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* STATUS CARDS BASED ON STATE */}

        {/* 1. VERIFIED STATE */}
        {verificationStatus === "VERIFIED" && (
          <div className="p-7 rounded-2xl bg-white border border-emerald-200 shadow-md space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-sm shrink-0">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#102A2A]">
                    Congratulations! You are a Verified Educator
                  </h2>
                  <StatusBadge status="VERIFIED" />
                </div>
                <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
                  Your identity documents, educational qualifications, and teacher credentials have been thoroughly reviewed and approved by EduConnects Platform Governance.
                </p>
                {verifiedAt && (
                  <p className="text-xs font-bold text-emerald-700">
                    Verified Date: {new Date(verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-emerald-950">
                  Your profile is published on the Public Teacher Directory!
                </span>
              </div>
              <Link href="/teacher/dashboard">
                <button className="px-4 py-2 rounded-xl bg-[#0B4F4B] hover:bg-[#073F3C] text-white text-xs font-extrabold transition-colors">
                  Go to Teacher Dashboard
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* 2. PENDING STATE */}
        {verificationStatus === "PENDING" && (
          <div className="p-7 rounded-2xl bg-white border border-amber-200 shadow-md space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-amber-500 text-white rounded-2xl shadow-sm shrink-0">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#102A2A]">
                    Application Under Review
                  </h2>
                  <StatusBadge status="PENDING" />
                </div>
                <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
                  Your teacher verification application has been submitted and is currently being audited by EduConnects Quality Assurance Administrators.
                </p>
                {submittedAt && (
                  <p className="text-xs font-bold text-amber-700">
                    Submitted Date: {new Date(submittedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-amber-950">
                Need to update your details or add missing documents?
              </span>
              <Link href="/teacher/onboarding">
                <button className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold transition-colors flex items-center gap-1.5">
                  <FileEdit className="h-4 w-4" />
                  <span>Edit Application Details</span>
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* 3. REJECTED STATE */}
        {verificationStatus === "REJECTED" && (
          <div className="p-7 rounded-2xl bg-white border border-rose-200 shadow-md space-y-6">
            {/* Header row */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-sm shrink-0">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#102A2A]">
                    Application Requires Changes
                  </h2>
                  <StatusBadge status="REJECTED" />
                </div>
                <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
                  Your recent application was reviewed by our verification team and requires corrections or additional information before approval.
                </p>
              </div>
            </div>

            {/* Rejection Reason Callout */}
            {cleanRejectionReason && (
              <div className="p-5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-black text-rose-700 uppercase tracking-wider text-[11px]">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Administrator Rejection Reason</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-rose-200/80 text-rose-950 font-medium text-xs leading-relaxed shadow-2xs">
                  "{cleanRejectionReason}"
                </div>
              </div>
            )}

            {/* Resubmit CTA Footer */}
            <div className="p-4 rounded-xl bg-[#F5F7F8] border border-[#DCE5E4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#102A2A]">
                You can correct your documents and resubmit your application immediately.
              </span>
              <Link href="/teacher/onboarding">
                <button className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors flex items-center gap-2 shadow-sm shrink-0">
                  <span>Update Profile & Resubmit</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* 4. SUSPENDED STATE */}
        {verificationStatus === "SUSPENDED" && (
          <div className="p-7 rounded-2xl bg-[#073F3C] text-white border border-[#1B6863] shadow-md space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-sm shrink-0">
                <AlertOctagon className="h-8 w-8" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Account Temporarily Suspended
                  </h2>
                  <StatusBadge status="SUSPENDED" />
                </div>
                <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
                  Your teacher account on EduConnects has been temporarily suspended by system administrators. Platform visibility and live class hosting are currently restricted.
                </p>
              </div>
            </div>

            {cleanSuspensionReason && (
              <div className="p-5 rounded-xl bg-[#0B4F4B] border border-[#1B6863] space-y-2 text-xs">
                <div className="flex items-center gap-2 font-black text-rose-300 uppercase tracking-wider text-[11px]">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Administrative Reason</span>
                </div>
                <div className="p-3 bg-[#073F3C] rounded-lg border border-[#1B6863] text-teal-50 font-medium text-xs leading-relaxed">
                  "{cleanSuspensionReason}"
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#0B4F4B]/80 border border-[#1B6863] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-teal-100/90 font-medium">
                <strong className="text-white">Account Data Preserved:</strong> Your course data, qualifications, and history remain intact.
              </div>
              <Link href="/contact">
                <button className="px-4 py-2 rounded-xl bg-[#1B6863] hover:bg-[#0B4F4B] text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 shrink-0">
                  <Mail className="h-4 w-4" />
                  <span>Contact Platform Support</span>
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* AUDIT HISTORY TIMELINE */}
        <div className="p-6 rounded-2xl bg-white border border-[#DCE5E4] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#DCE5E4] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#E6F0EF] text-[#0B4F4B]">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#102A2A]">Verification History & Audit Log</h3>
                <p className="text-[11px] text-[#5D7373]">Detailed timeline of application status transitions</p>
              </div>
            </div>
            {history.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#F5F7F8] text-[#5D7373] border border-[#DCE5E4]">
                {history.length} {history.length === 1 ? "entry" : "entries"}
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-[#5D7373] italic py-2">No verification status changes recorded yet.</p>
          ) : (
            <div className="space-y-4 pt-1">
              {history.map((item, idx) => {
                const itemReason = formatReason(item.reason);
                return (
                  <div key={item.id || idx} className="relative pl-6 pb-4 border-l-2 border-[#DCE5E4] last:border-l-0 last:pb-0">
                    {/* Timeline Node */}
                    <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-[#0B4F4B] ring-4 ring-white" />

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-xs font-bold text-[#102A2A] flex items-center gap-2">
                          <span>Status Changed:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#F5F7F8] text-[#5D7373] border border-[#DCE5E4] uppercase">
                            {item.previousStatus}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-[#5D7373]" />
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#E6F0EF] text-[#0B4F4B] border border-[#0B4F4B]/20 uppercase">
                            {item.newStatus}
                          </span>
                        </div>

                        <span className="text-[11px] font-semibold text-[#5D7373]">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {itemReason && (
                        <div className="p-2.5 rounded-lg bg-[#F5F7F8] border border-[#DCE5E4] text-xs text-[#5D7373] italic">
                          "{itemReason}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

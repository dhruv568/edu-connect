"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassButton } from "@/components/glass/glass-button";
import { StatusBadge } from "@/components/ui/status-badge";
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
} from "lucide-react";

export default function TeacherVerificationStatusPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/verification/status");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch verification status");
      setStatusData(json.data);
    } catch (err: any) {
      showToast("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="TEACHER">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading Verification Status...</p>
        </div>
      </DashboardLayout>
    );
  }

  const { verificationStatus, submittedAt, verifiedAt, rejectionReason, suspensionReason, history } = statusData;

  return (
    <DashboardLayout role="TEACHER">
      <div className="space-y-8 max-w-4xl mx-auto pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Teacher Verification Dashboard
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              EduConnect Administrative Credential & Verification Status
            </p>
          </div>
          <button
            onClick={fetchStatus}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh Status"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* STATUS CARDS BASED ON STATE */}

        {/* 1. VERIFIED STATE */}
        {verificationStatus === "VERIFIED" && (
          <GlassCard className="p-8 border border-emerald-200 bg-emerald-50/50 space-y-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-emerald-500 text-white rounded-3xl shadow-lg">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-emerald-950">Congratulations! You are a Verified Educator</h2>
                  <StatusBadge status="VERIFIED" />
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your identity documents, educational qualifications, and teacher credentials have been thoroughly reviewed and approved by EduConnect Platform Governance.
                </p>
                {verifiedAt && (
                  <p className="text-[11px] font-bold text-emerald-700">
                    Verified Date: {new Date(verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-emerald-900">
                  Your profile is published on the Public Teacher Marketplace catalog!
                </span>
              </div>
              <Link href="/teacher">
                <GlassButton variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Go to Teacher Dashboard
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* 2. PENDING STATE */}
        {verificationStatus === "PENDING" && (
          <GlassCard className="p-8 border border-amber-200 bg-amber-50/50 space-y-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-amber-500 text-white rounded-3xl shadow-lg">
                <Clock className="h-10 w-10 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-amber-950">Application Under Review</h2>
                  <StatusBadge status="PENDING" />
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your teacher verification application has been submitted and is currently being audited by EduConnect Quality Assurance Administrators.
                </p>
                {submittedAt && (
                  <p className="text-[11px] font-bold text-amber-700">
                    Submitted Date: {new Date(submittedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-amber-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">
                Need to update your details or add missing documents?
              </span>
              <Link href="/teacher/onboarding">
                <GlassButton variant="secondary" size="sm" rightIcon={<FileEdit className="h-4 w-4" />}>
                  Edit Application Details
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* 3. REJECTED STATE */}
        {verificationStatus === "REJECTED" && (
          <GlassCard className="p-8 border border-rose-200 bg-rose-50/50 space-y-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-rose-600 text-white rounded-3xl shadow-lg">
                <XCircle className="h-10 w-10" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-rose-950">Application Requires Changes</h2>
                  <StatusBadge status="REJECTED" />
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Your recent application was reviewed by our verification team and requires corrections or additional information before approval.
                </p>
              </div>
            </div>

            {rejectionReason && (
              <div className="p-5 rounded-2xl bg-white border-l-4 border-rose-600 text-xs text-slate-800 space-y-1 shadow-2xs">
                <span className="font-extrabold text-rose-700 uppercase tracking-wider block">Administrator Rejection Reason:</span>
                <p className="italic font-medium text-slate-700">"{rejectionReason}"</p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/80 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-rose-950">
                You can correct your documents and resubmit your application immediately.
              </span>
              <Link href="/teacher/onboarding">
                <GlassButton variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Update Profile & Resubmit
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* 4. SUSPENDED STATE */}
        {verificationStatus === "SUSPENDED" && (
          <GlassCard className="p-8 border border-slate-800 bg-slate-900 text-white space-y-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-rose-600 text-white rounded-3xl shadow-lg">
                <AlertOctagon className="h-10 w-10" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-white">Account Temporarily Suspended</h2>
                  <StatusBadge status="SUSPENDED" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your teacher account on EduConnect has been temporarily suspended by system administrators. Marketplace visibility and live class hosting are currently restricted.
                </p>
              </div>
            </div>

            {suspensionReason && (
              <div className="p-5 rounded-2xl bg-slate-800 border-l-4 border-rose-500 text-xs text-slate-200 space-y-1">
                <span className="font-extrabold text-rose-400 uppercase tracking-wider block">Administrative Reason:</span>
                <p className="italic font-medium text-slate-300">"{suspensionReason}"</p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                <strong>Account Data Preserved:</strong> Your course data, qualifications, and history remain intact.
              </div>
              <Link href="/contact">
                <GlassButton variant="secondary" size="sm" className="bg-slate-700 text-white border-slate-600" leftIcon={<Mail className="h-4 w-4" />}>
                  Contact Platform Support
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* AUDIT HISTORY TIMELINE */}
        <GlassCard className="p-6 border border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <History className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900">Verification History & Audit Log</h3>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No verification status changes recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div key={item.id || idx} className="flex items-start gap-4 text-xs border-b border-slate-100 last:border-none pb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">
                        Status Changed: <span className="text-blue-600 uppercase">{item.previousStatus}</span> → <span className="text-indigo-600 uppercase">{item.newStatus}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {item.reason && <p className="text-slate-600 italic">"{item.reason}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}

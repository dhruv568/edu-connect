"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { GlassButton } from "@/components/glass/glass-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ShieldCheck, Clock, FileText, ArrowRight, Loader2, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminVerificationQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");

  useEffect(() => {
    fetchQueue();
  }, [selectedStatus]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verification?status=${selectedStatus}`);
      const json = await res.json();
      if (json.data?.queue) {
        setQueue(json.data.queue);
      }
    } catch (err) {
      console.error("Failed to fetch verification queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusTabs = [
    { label: "Pending Queue", value: "PENDING", badge: "Priority" },
    { label: "Verified Teachers", value: "VERIFIED" },
    { label: "Rejected Applications", value: "REJECTED" },
    { label: "Suspended Teachers", value: "SUSPENDED" },
    { label: "All Submissions", value: "ALL" },
  ];

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="admin@educonnect.com">
      <div className="space-y-6 pb-16 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Teacher Verification Workspace
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                ADMIN GOVERNANCE
              </span>
            </div>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              Review credential documents, verify teacher identity, and make approval decisions.
            </p>
          </div>

          <button
            onClick={fetchQueue}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
            title="Refresh Queue"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* QUEUE APPLICANT CARDS */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">Fetching verification applications...</p>
          </div>
        ) : queue.length === 0 ? (
          <Card className="p-12 text-center border-slate-200 bg-slate-50/50">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-slate-800">No Applications in Selected Queue</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              There are currently no teacher verification applications with status [{selectedStatus}].
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queue.map((app) => (
              <Card
                key={app.teacherProfileId}
                className="p-6 border border-slate-200 hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between space-y-4 bg-white"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">{app.name}</h3>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={app.verificationStatus} size="sm" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="font-extrabold text-slate-800">{app.headline}</div>
                    <div className="text-slate-600">
                      <strong>Subjects:</strong> {app.subjects.join(", ") || "General"}
                    </div>
                    <div className="text-slate-600">
                      <strong>Experience:</strong> {app.experienceYears} Years • <strong>Mode:</strong> {app.teachingMode}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">{app.documentCount}</span> Documents •{" "}
                    <span className="font-bold text-slate-700">{app.qualificationCount}</span> Qualifications
                    {app.submittedAt && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <Link href={`/admin/verification/${app.teacherProfileId}`}>
                    <GlassButton variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Review Application
                    </GlassButton>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

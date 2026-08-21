"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerificationStatus } from "@/types/auth";
import { Video, Users, Award, ShieldCheck, Plus, ArrowRight, FileCheck, Clock, XCircle, AlertOctagon } from "lucide-react";

export default function TeacherDashboardPage() {
  const [data, setData] = useState<{
    userName: string;
    userEmail: string;
    verificationStatus: VerificationStatus;
    readiness: { isReady: boolean; completionPercentage: number; missingItems: string[] };
    hourlyRate: number;
    experienceYears: number;
  }>({
    userName: "Educator",
    userEmail: "",
    verificationStatus: "PENDING",
    readiness: { isReady: false, completionPercentage: 0, missingItems: [] },
    hourlyRate: 40,
    experienceYears: 0,
  });

  useEffect(() => {
    fetch("/api/teacher/onboarding")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setData({
            userName: `${json.data.profile.firstName} ${json.data.profile.lastName}`.trim() || json.data.user.email,
            userEmail: json.data.user.email,
            verificationStatus: json.data.teacherProfile.verificationStatus,
            readiness: json.data.readiness,
            hourlyRate: json.data.teacherProfile.hourlyRate || 40,
            experienceYears: json.data.teacherProfile.experienceYears || 0,
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <DashboardLayout role="TEACHER" userName={data.userName} userEmail={data.userEmail}>
      <div className="space-y-6">
        {/* Dynamic Verification Status Banner */}
        {data.verificationStatus === "VERIFIED" && (
          <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Verification Status: Verified Educator</h2>
                  <StatusBadge status="VERIFIED" />
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  Your profile is published on the EduConnect marketplace. You are eligible for demo bookings, live classes, and courses.
                </p>
              </div>
            </div>
            <Link href="/teacher/verification">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View Credentials
              </Button>
            </Link>
          </div>
        )}

        {data.verificationStatus === "PENDING" && (
          <div className="bg-amber-500 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Clock className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Verification Status: Application Pending</h2>
                  <StatusBadge status="PENDING" />
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  Your profile has been submitted and is currently being audited by EduConnect administration.
                </p>
              </div>
            </div>
            <Link href="/teacher/onboarding">
              <Button variant="secondary" size="sm" rightIcon={<FileCheck className="h-4 w-4" />}>
                {data.readiness.isReady ? "Review Profile" : "Complete Onboarding"}
              </Button>
            </Link>
          </div>
        )}

        {data.verificationStatus === "REJECTED" && (
          <div className="bg-rose-600 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Verification Action Required</h2>
                  <StatusBadge status="REJECTED" />
                </div>
                <p className="text-xs text-rose-100 mt-1">
                  Your application requires revisions before it can be approved. Please review feedback and resubmit.
                </p>
              </div>
            </div>
            <Link href="/teacher/onboarding">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Update Profile & Resubmit
              </Button>
            </Link>
          </div>
        )}

        {data.verificationStatus === "SUSPENDED" && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
                <AlertOctagon className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Account Temporarily Suspended</h2>
                  <StatusBadge status="SUSPENDED" />
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Marketplace features are restricted. Contact platform support for assistance.
                </p>
              </div>
            </div>
            <Link href="/teacher/verification">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View Notice
              </Button>
            </Link>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">Total Students Taught</span>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-xs text-emerald-600 font-medium">New Verified Educator</p>
          </Card>

          <Card className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">Teaching Experience</span>
              <Award className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.experienceYears} Years</div>
            <p className="text-xs text-blue-600 font-medium">Verified Credentials</p>
          </Card>

          <Card className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">Hourly Rate</span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">${data.hourlyRate}.00 / hr</div>
            <p className="text-xs text-slate-500 font-medium">Configured Rate</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

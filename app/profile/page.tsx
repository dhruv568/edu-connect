"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, Edit, CheckCircle2, Award } from "lucide-react";
import { ProfileSkeleton } from "@/components/shared/loading-skeleton";

export default function UserProfilePage() {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUserData(data.data.user);
        else router.push("/login");
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout role="STUDENT" userName="Loading..." userEmail="...">
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  if (!userData) return null;

  return (
    <DashboardLayout
      role={userData.role}
      userName={`${userData.firstName} ${userData.lastName}`.trim() || userData.email}
      userEmail={userData.email}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">User Profile</h1>
            <p className="text-xs text-slate-500">Manage your EduConnect account settings and preferences</p>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-3xl shadow-md">
              {userData.firstName ? userData.firstName.charAt(0) : "U"}
            </div>
            <div className="space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-xl font-bold text-slate-900">{userData.firstName} {userData.lastName}</h2>
                <Badge variant={userData.emailVerified ? "success" : "warning"}>
                  {userData.emailVerified ? "Verified Account" : "Unverified Email"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">{userData.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge variant="primary">{userData.role} ROLE</Badge>
              </div>
            </div>
          </div>

          {/* Profile Completion Meter */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Profile Completion</span>
              <span className="text-blue-600">{userData.completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${userData.completionPercentage}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Role Specific Info */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Account Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Bio</span>
              <p className="text-slate-800 font-bold mt-0.5">{userData.bio || "No bio added yet."}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Contact Phone</span>
              <p className="text-slate-800 font-bold mt-0.5">{userData.phone || "Not specified."}</p>
            </div>

            {userData.role === "TEACHER" && userData.teacherProfile && (
              <>
                <div>
                  <span className="text-slate-500 font-medium">Headline</span>
                  <p className="text-slate-800 font-bold mt-0.5">{userData.teacherProfile.headline}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Teaching Subjects</span>
                  <p className="text-slate-800 font-bold mt-0.5">{userData.teacherProfile.subjects}</p>
                </div>
              </>
            )}

            {userData.role === "STUDENT" && userData.studentProfile && (
              <>
                <div>
                  <span className="text-slate-500 font-medium">Grade Level</span>
                  <p className="text-slate-800 font-bold mt-0.5">{userData.studentProfile.gradeLevel}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Interests</span>
                  <p className="text-slate-800 font-bold mt-0.5">{userData.studentProfile.interests || "General STEM"}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

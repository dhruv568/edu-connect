"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Save, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import {
  LearnerAcademicFields,
  AcademicFieldsState,
} from "@/components/learner/learner-academic-fields";
import Link from "next/link";

export default function ProfileEditPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");

  const [headline, setHeadline] = useState("");
  const [subjects, setSubjects] = useState("");
  const [academicState, setAcademicState] = useState<AcademicFieldsState>({
    educationType: "SCHOOL",
    gradeLevel: "Grade 10",
    stream: "",
    competitiveExam: "",
    diplomaBranch: "",
  });
  const [emergencyContact, setEmergencyContact] = useState("");

  const [userRole, setUserRole] = useState("STUDENT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const u = data.data.user;
          setUserRole(u.role);
          setFirstName(u.firstName);
          setLastName(u.lastName);
          setAvatarUrl(u.avatarUrl || null);
          setBio(u.bio || "");
          setPhone(u.phone || "");

          if (u.teacherProfile) {
            setHeadline(u.teacherProfile.headline || "");
            setSubjects(u.teacherProfile.subjects || "");
          }
          if (u.studentProfile) {
            setAcademicState({
              educationType: u.studentProfile.educationType || "SCHOOL",
              gradeLevel: u.studentProfile.gradeLevel || "Grade 10",
              stream: u.studentProfile.stream || "",
              competitiveExam: u.studentProfile.competitiveExam || "",
              diplomaBranch: u.studentProfile.diplomaBranch || "",
            });
          }
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          avatarUrl,
          bio,
          phone,
          headline,
          subjects,
          educationType: academicState.educationType,
          gradeLevel: academicState.gradeLevel,
          stream: academicState.stream,
          competitiveExam: academicState.competitiveExam,
          diplomaBranch: academicState.diplomaBranch,
          emergencyContact,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      showToast("Profile Updated!", "Your profile information has been saved.", "success");
      router.push("/profile");
    } catch (err: any) {
      showToast("Update Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="STUDENT" userName="Loading..." userEmail="...">
        <div className="h-64 bg-white rounded-3xl animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userRole as any} userName={firstName || "User"} userEmail="...">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <BackButton
            fallbackUrl="/profile"
            label="Cancel & Return"
            variant="default"
          />
          <h1 className="text-xl font-bold text-slate-900">Edit Profile</h1>
        </div>

        {/* Profile Photo Uploader */}
        <ProfilePhotoUploader
          initialAvatarUrl={avatarUrl}
          userName={`${firstName} ${lastName}`.trim() || "User"}
          role={userRole}
          onAvatarUpdated={(newUrl) => setAvatarUrl(newUrl)}
        />

        <Card className="p-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>

            <Input label="Phone Number" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Bio / Personal Description</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium"
              />
            </div>

            {userRole === "TEACHER" && (
              <>
                <Input label="Professional Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                <Input label="Teaching Subjects" value={subjects} onChange={(e) => setSubjects(e.target.value)} helperText="Comma-separated" />
              </>
            )}

            {userRole === "STUDENT" && (
              <div className="pt-2 border-t border-slate-100">
                <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-3">
                  Learner Academic Profile
                </h2>
                <LearnerAcademicFields
                  value={academicState}
                  onChange={setAcademicState}
                />
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full mt-4" isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
              Save Profile Changes
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

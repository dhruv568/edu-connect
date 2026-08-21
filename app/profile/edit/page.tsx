"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfileEditPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");

  const [headline, setHeadline] = useState("");
  const [subjects, setSubjects] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
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
          setBio(u.bio || "");
          setPhone(u.phone || "");

          if (u.teacherProfile) {
            setHeadline(u.teacherProfile.headline || "");
            setSubjects(u.teacherProfile.subjects || "");
          }
          if (u.studentProfile) {
            setGradeLevel(u.studentProfile.gradeLevel || "");
          }
          if (u.parentProfile) {
            setEmergencyContact(u.parentProfile.emergencyContact || "");
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
          bio,
          phone,
          headline,
          subjects,
          gradeLevel,
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
          <Link href="/profile" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Cancel & Return
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Edit Profile</h1>
        </div>

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
              <Input label="Grade Level" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} />
            )}

            {userRole === "PARENT" && (
              <Input label="Emergency Contact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
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

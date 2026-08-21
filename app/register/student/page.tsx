"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

export default function StudentRegistrationPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState("Grade 10");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(["Mathematics"]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  const preferenceOptions = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science & Python",
    "English & SAT Prep",
    "Homework Help",
  ];

  const togglePreference = (pref: string) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role: "STUDENT",
          gradeLevel,
          interests: selectedPreferences.join(", "),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Student registration failed.");

      showToast("Account Created!", "6-digit verification code sent to your email.", "success", true);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      showToast("Registration Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="emerald">STUDENT REGISTRATION</GlassBadge>
          <h1 className="text-3xl font-black text-slate-900">Create Student Account</h1>
          <p className="text-xs text-slate-500">Find top tutors and join live class slots</p>
        </div>

        <GlassCard glowColor="rgba(16, 185, 129, 0.15)" className="p-8 border border-white/90 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" placeholder="Alex" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input label="Last Name" placeholder="Morgan" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>

            <Input label="Email Address" type="email" placeholder="alex@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required helperText="At least 8 characters, 1 uppercase, 1 number" />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Current Grade Level</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium">
                {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "College Prep"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Learning Preferences</label>
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.map((pref) => {
                  const isSelected = selectedPreferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreference(pref)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            <GlassButton type="submit" variant="primary" className="w-full mt-4" isLoading={loading} rightIcon={<CheckCircle2 className="h-4 w-4" />}>
              Create Student Account
            </GlassButton>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs">
            <span className="text-slate-500">Already have an account? </span>
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">
              Sign In to EduConnect
            </Link>
          </div>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

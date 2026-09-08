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
import { BookOpen, CheckCircle2, ArrowRight, Video, Sparkles, Award } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function StudentRegisterPage() {
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
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      <FloatingNavbar variant="student" />

      <main className="flex-1 pt-28 sm:pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 w-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Student Perks */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Start Learning Today</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Join 15,000+ <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Smart Learners
                </span>
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect with top-rated tutors, book interactive 1-on-1 demo sessions, join live virtual classes, and access recorded courses anytime.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Video className="h-4 w-4" />
                </div>
                <span>Free 1-on-1 trial demo slots with zero commitment</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Interactive LiveKit classrooms with real-time tools</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Award className="h-4 w-4" />
                </div>
                <span>Transparent pricing — pay only for what you attend</span>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 max-w-xl mx-auto w-full space-y-4">
            <BackButton
              fallbackUrl="/student/login"
              label="Back to Sign In"
              variant="default"
            />

            <div className="text-center lg:text-left space-y-1">
              <GlassBadge variant="emerald">STUDENT ONBOARDING</GlassBadge>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Create Student Account
              </h2>
              <p className="text-xs text-slate-500">
                Start discovering top tutors and learning without limits
              </p>
            </div>

            <GlassCard
              glowColor="rgba(16, 185, 129, 0.15)"
              className="p-7 sm:p-8 border border-white/90 shadow-xl space-y-5"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Morgan"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  helperText="At least 8 characters, 1 uppercase, 1 number"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Current Grade Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "College Prep"].map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Learning Preferences & Subjects
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {preferenceOptions.map((pref) => {
                      const isSelected = selectedPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePreference(pref)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 border-emerald-500 shadow-emerald-600/20"
                  isLoading={loading}
                  rightIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Create Student Account
                </GlassButton>
              </form>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Already have an account? </span>
                  <Link href="/student/login" className="font-bold text-emerald-600 hover:underline">
                    Sign In
                  </Link>
                </div>
                <div>
                  <Link href="/teacher/register" className="text-indigo-600 hover:underline font-bold">
                    Join as Educator →
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

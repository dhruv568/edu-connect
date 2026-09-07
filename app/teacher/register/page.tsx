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
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Video,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function TeacherRegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [headline, setHeadline] = useState("");
  const [subjects, setSubjects] = useState("Mathematics");
  const [experienceYears, setExperienceYears] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(500);
  const [teachingMode, setTeachingMode] = useState("ONLINE");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        showToast("Missing Fields", "Please complete all account fields.", "error");
        return;
      }
      setStep(2);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
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
          role: "TEACHER",
          headline,
          subjects,
          experienceYears: Number(experienceYears),
          hourlyRate: Number(hourlyRate),
          teachingMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Teacher registration failed.");

      showToast("Registration Complete!", "6-digit OTP code sent to your email.", "success", true);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      showToast("Registration Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      <FloatingNavbar variant="teacher" />

      <main className="flex-1 pt-28 sm:pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 w-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Teacher Perks */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Teach Without Boundaries</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Build a Thriving <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Teaching Career
                </span>
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Reach motivated students globally, set your own pricing, host automated HD live classes, and publish recorded courses with zero setup costs.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span>Keep 85% of your earnings with direct bank transfers</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Video className="h-4 w-4" />
                </div>
                <span>Built-in interactive classrooms with real-time whiteboards</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>Automated student reminders, bookings & attendance tracking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 max-w-xl mx-auto w-full space-y-6">
            <div className="text-center lg:text-left space-y-1">
              <div className="flex items-center justify-between">
                <GlassBadge variant="indigo">STEP {step} OF 2 • EDUCATOR PORTAL</GlassBadge>
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 rounded-full w-12 transition-all ${step >= 1 ? "bg-indigo-600" : "bg-slate-200"}`} />
                  <div className={`h-2 rounded-full w-12 transition-all ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`} />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Create Educator Account
              </h2>
              <p className="text-xs text-slate-500">
                {step === 1 ? "Step 1: Set up your login credentials" : "Step 2: Tell us about your teaching experience"}
              </p>
            </div>

            <GlassCard
              glowColor="rgba(99, 102, 241, 0.15)"
              className="p-7 sm:p-8 border border-white/90 shadow-xl space-y-5"
            >
              {step === 1 ? (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First Name"
                      placeholder="Sarah"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <Input
                      label="Last Name"
                      placeholder="Jenkins"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="sarah@example.com"
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

                  <GlassButton
                    type="submit"
                    variant="primary"
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-500 shadow-indigo-600/20"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Continue to Professional Details
                  </GlassButton>
                </form>
              ) : (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Step 2: Professional Profile
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      ← Back to Step 1
                    </button>
                  </div>

                  <Input
                    label="Professional Headline"
                    placeholder="Senior STEM Educator & Olympiad Coach"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    required
                  />
                  <Input
                    label="Teaching Subjects"
                    placeholder="Mathematics, Physics, Calculus"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    required
                    helperText="Comma-separated subjects"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Years Experience"
                      type="number"
                      min={0}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Hourly Rate (₹)"
                      type="number"
                      min={10}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Teaching Mode
                    </label>
                    <select
                      value={teachingMode}
                      onChange={(e) => setTeachingMode(e.target.value)}
                      className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="ONLINE">Online Virtual Classroom</option>
                      <option value="OFFLINE">In-Person Offline Sessions</option>
                      <option value="BOTH">Both Online & Offline</option>
                    </select>
                  </div>

                  <GlassButton
                    type="submit"
                    variant="primary"
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-500 shadow-indigo-600/20"
                    isLoading={loading}
                    rightIcon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Complete Educator Registration
                  </GlassButton>
                </form>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Already have an account? </span>
                  <Link href="/teacher/login" className="font-bold text-indigo-600 hover:underline">
                    Sign In
                  </Link>
                </div>
                <div>
                  <Link href="/student/register" className="text-emerald-600 hover:underline font-bold">
                    Join as Student →
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

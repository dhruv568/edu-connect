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
import { GraduationCap, ArrowRight, ArrowLeft, Mail, Lock, User, CheckCircle2 } from "lucide-react";

export default function TeacherRegistrationPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [headline, setHeadline] = useState("");
  const [subjects, setSubjects] = useState("Mathematics");
  const [experienceYears, setExperienceYears] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(45);
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-2xl mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="indigo">STEP {step} OF 2 • TEACHER PORTAL</GlassBadge>
          <h1 className="text-3xl font-black text-slate-900">Create Educator Account</h1>
          <p className="text-xs text-slate-500">Join EduConnect as a verified teacher</p>

          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`h-2 rounded-full w-24 transition-all ${step >= 1 ? "bg-indigo-600" : "bg-slate-200"}`} />
            <div className={`h-2 rounded-full w-24 transition-all ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`} />
          </div>
        </div>

        <GlassCard glowColor="rgba(99, 102, 241, 0.15)" className="p-8 border border-white/90 shadow-xl">
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Step 1: Account Credentials</h3>

              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" placeholder="Sarah" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <Input label="Last Name" placeholder="Jenkins" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>

              <Input label="Email Address" type="email" placeholder="sarah@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required helperText="At least 8 characters, 1 uppercase, 1 number" />

              <GlassButton type="submit" variant="primary" className="w-full mt-2" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue to Professional Details
              </GlassButton>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Step 2: Professional Profile</h3>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-indigo-600 hover:underline">
                  ← Back to Step 1
                </button>
              </div>

              <Input label="Professional Headline" placeholder="Senior STEM Educator & Olympiad Coach" value={headline} onChange={(e) => setHeadline(e.target.value)} required />
              <Input label="Teaching Subjects" placeholder="Mathematics, Physics, Calculus" value={subjects} onChange={(e) => setSubjects(e.target.value)} required helperText="Comma-separated subjects" />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Years Experience" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} required />
                <Input label="Hourly Rate ($)" type="number" min={10} value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} required />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Teaching Mode</label>
                <select value={teachingMode} onChange={(e) => setTeachingMode(e.target.value)} className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium">
                  <option value="ONLINE">Online Virtual Classroom</option>
                  <option value="OFFLINE">In-Person Offline Sessions</option>
                  <option value="BOTH">Both Online & Offline</option>
                </select>
              </div>

              <GlassButton type="submit" variant="primary" className="w-full mt-2" isLoading={loading} rightIcon={<CheckCircle2 className="h-4 w-4" />}>
                Complete Teacher Registration
              </GlassButton>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 text-center text-xs">
            <span className="text-slate-500">Already have an account? </span>
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Sign In to EduConnect
            </Link>
          </div>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

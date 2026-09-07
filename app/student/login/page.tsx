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
  Mail,
  Lock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Video,
  Award,
} from "lucide-react";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Student login failed.");

      if (data.data?.requiresVerification || data.data?.requiresOtp) {
        showToast(
          "Verification Code Sent ✉️",
          "Please enter the 6-digit OTP code sent to your email to complete login.",
          "info"
        );
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        showToast("Welcome Back!", `Signed in as ${data.data.user.firstName}`, "success");
        // Direct students straight to their dashboard
        router.push(data.data.redirectPath || "/student/dashboard");
      }
    } catch (err: any) {
      showToast("Authentication Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      {/* Role-Specific Student Navbar */}
      <FloatingNavbar variant="student" />

      <main className="flex-1 pt-28 sm:pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 w-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Student Highlights & Social Proof */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              <span>Student Learning Portal</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Resume Your <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Learning Journey
                </span>
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your enrolled live classes, 1-on-1 demo sessions, self-paced video curricula, and earned certificates.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Video className="h-4 w-4" />
                </div>
                <span>Live interactive classrooms with whiteboard & live code sandbox</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Direct 1-on-1 messaging & trial bookings with top verified tutors</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Award className="h-4 w-4" />
                </div>
                <span>Automated certificates and verifiable skill credentials upon completion</span>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Student"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Ananya Verma</div>
                  <div className="text-[10px] text-slate-500">Grade 11 CBSE • Physics & Math</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic">
                &ldquo;EduConnects made it so easy to try out 2 different math mentors before enrolling. The live whiteboard is incredible!&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Student Login Form */}
          <div className="lg:col-span-6 max-w-md mx-auto w-full space-y-6">
            <div className="text-center lg:text-left space-y-1">
              <GlassBadge variant="emerald" className="lg:hidden">
                STUDENT AUTHENTICATION
              </GlassBadge>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Student Sign In
              </h2>
              <p className="text-xs text-slate-500">
                Enter your student credentials to access your dashboard
              </p>
            </div>

            <GlassCard
              glowColor="rgba(16, 185, 129, 0.15)"
              className="p-7 sm:p-8 border border-white/90 shadow-xl space-y-6"
            >
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Student Email Address"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={<Mail className="h-4 w-4 text-emerald-600" />}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftIcon={<Lock className="h-4 w-4 text-emerald-600" />}
                />

                <div className="flex items-center justify-between text-xs font-semibold">
                  <Link href="/forgot-password" className="text-emerald-600 hover:underline">
                    Forgot password?
                  </Link>
                  <Link href="/student/register" className="text-slate-600 hover:text-emerald-700">
                    Need an account?
                  </Link>
                </div>

                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-500 shadow-emerald-600/20"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Sign In as Student
                </GlassButton>
              </form>

              {/* Quick Student Demo Account */}
              <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Quick Student Demo:
                </span>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("student@educonnects.com");
                      setPassword("Password123!");
                    }}
                    className="w-full px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors text-xs flex items-center justify-between"
                  >
                    <span>Use Demo Student Account</span>
                    <span className="text-[10px] text-emerald-600">student@educonnects.com</span>
                  </button>
                </div>
              </div>

              {/* Cross Role Links */}
              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                Are you an educator?{" "}
                <Link href="/teacher/login" className="text-indigo-600 hover:underline font-bold">
                  Sign in as Teacher →
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

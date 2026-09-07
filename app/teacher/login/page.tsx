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
  GraduationCap,
  Sparkles,
  TrendingUp,
  Video,
  ShieldCheck,
} from "lucide-react";

export default function TeacherLoginPage() {
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
      if (!res.ok) throw new Error(data.error || "Educator login failed.");

      if (data.data?.requiresVerification || data.data?.requiresOtp) {
        showToast(
          "Verification Code Sent ✉️",
          "Please enter the 6-digit OTP code sent to your email to complete login.",
          "info"
        );
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        showToast("Welcome Back!", `Signed in as ${data.data.user.firstName}`, "success");
        // Direct teachers straight to their dashboard
        router.push(data.data.redirectPath || "/teacher/dashboard");
      }
    } catch (err: any) {
      showToast("Authentication Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      {/* Role-Specific Teacher Navbar */}
      <FloatingNavbar variant="teacher" />

      <main className="flex-1 pt-28 sm:pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 w-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Teacher Highlights & Analytics */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
              <span>Educator Teaching Portal</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Manage Your <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Teaching Business
                </span>
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your schedule, launch HD live classrooms, publish new LMS courses, and monitor your bank payouts.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span>Keep 85% of every rupee earned with automated direct bank transfers</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Video className="h-4 w-4" />
                </div>
                <span>One-click LiveKit interactive room with screen sharing & attendance logs</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>Verified educator trust badge to stand out in marketplace searches</span>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt="Teacher"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Prof. Vikram Malhotra</div>
                  <div className="text-[10px] text-slate-500">Advanced Mathematics • ₹1.2L+/month</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic">
                &ldquo;EduConnects eliminated all scheduling and payment hassles. I now teach 180+ students monthly with zero admin overhead.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Teacher Login Form */}
          <div className="lg:col-span-6 max-w-md mx-auto w-full space-y-6">
            <div className="text-center lg:text-left space-y-1">
              <GlassBadge variant="indigo" className="lg:hidden">
                TEACHER AUTHENTICATION
              </GlassBadge>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Educator Sign In
              </h2>
              <p className="text-xs text-slate-500">
                Enter your teacher credentials to access your portal
              </p>
            </div>

            <GlassCard
              glowColor="rgba(99, 102, 241, 0.15)"
              className="p-7 sm:p-8 border border-white/90 shadow-xl space-y-6"
            >
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Educator Email Address"
                  type="email"
                  placeholder="teacher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={<Mail className="h-4 w-4 text-indigo-600" />}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftIcon={<Lock className="h-4 w-4 text-indigo-600" />}
                />

                <div className="flex items-center justify-between text-xs font-semibold">
                  <Link href="/forgot-password" className="text-indigo-600 hover:underline">
                    Forgot password?
                  </Link>
                  <Link href="/teacher/register" className="text-slate-600 hover:text-indigo-700">
                    Need an account?
                  </Link>
                </div>

                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-500 shadow-indigo-600/20"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Sign In as Teacher
                </GlassButton>
              </form>

              {/* Quick Teacher Demo Account */}
              <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Quick Teacher Demo:
                </span>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("teacher@educonnects.com");
                      setPassword("Password123!");
                    }}
                    className="w-full px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors text-xs flex items-center justify-between"
                  >
                    <span>Use Demo Teacher Account</span>
                    <span className="text-[10px] text-indigo-600">teacher@educonnects.com</span>
                  </button>
                </div>
              </div>

              {/* Cross Role Links */}
              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                Are you a student?{" "}
                <Link href="/student/login" className="text-emerald-600 hover:underline font-bold">
                  Sign in as Student →
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

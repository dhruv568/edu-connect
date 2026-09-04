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
import { LogIn, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
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
      if (!res.ok) throw new Error(data.error || "Login failed.");

      if (data.data?.requiresVerification || data.data?.requiresOtp) {
        showToast("Verification Code Sent ✉️", "Please enter the 6-digit OTP code sent to your email to complete login.", "info");
      } else {
        showToast("Welcome Back!", `Signed in as ${data.data.user.firstName}`, "success");
      }
      router.push(data.data.redirectPath || `/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      showToast("Authentication Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 w-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Social Proof & Feature Highlights */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Welcome Back to EduConnect</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Continue Your <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Learning Momentum
                </span>
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your personalized dashboard, live class schedule, 1-on-1 demo sessions, and recorded course library.
              </p>
            </div>

            {/* Testimonial Quote Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Student"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Priya Sharma</div>
                  <div className="text-[11px] text-slate-500">NEET Physics Aspirant (Score 170/180)</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;Booking 1-on-1 trial demos first gave me total confidence in my tutor before any commitment. My physics score skyrocketed.&rdquo;
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1 text-blue-600">
                ★ 4.95 Rating
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                15,000+ Students
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-600">
                850+ Verified Tutors
              </span>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-6 max-w-md mx-auto w-full space-y-6">
            <div className="text-center lg:text-left space-y-1">
              <GlassBadge variant="blue" className="lg:hidden">EDUCONNECT AUTHENTICATION</GlassBadge>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sign In to EduConnect</h2>
              <p className="text-xs text-slate-500">Access your Teacher or Student Dashboard</p>
            </div>

            <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-7 sm:p-8 border border-white/90 shadow-xl space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={<Mail className="h-4 w-4" />}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftIcon={<Lock className="h-4 w-4" />}
                />

                <div className="flex items-center justify-between text-xs font-semibold">
                  <Link href="/forgot-password" className="text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                  <Link href="/register" className="text-slate-500 hover:text-slate-900">
                    Need an account?
                  </Link>
                </div>

                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Sign In
                </GlassButton>
              </form>

              {/* Quick Demo Credentials Assistant */}
              <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Quick Dev Logins (Password: Password123!):
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("teacher@educonnect.com");
                      setPassword("Password123!");
                    }}
                    className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors"
                  >
                    Teacher Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("student@educonnect.com");
                      setPassword("Password123!");
                    }}
                    className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                  >
                    Student Demo
                  </button>
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

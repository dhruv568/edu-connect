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
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-md mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="blue">EDUCONNECT AUTHENTICATION</GlassBadge>
          <h1 className="text-3xl font-black text-slate-900">Sign In to EduConnect</h1>
          <p className="text-xs text-slate-500">Access your Teacher or Student Dashboard</p>
        </div>

        <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-8 border border-white/90 shadow-xl space-y-6">
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

            <GlassButton type="submit" variant="primary" className="w-full mt-2" isLoading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Sign In
            </GlassButton>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Quick Dev Logins (Password: Password123!):</span>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <button onClick={() => { setEmail("teacher@educonnect.com"); setPassword("Password123!"); }} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-100">
                Teacher Demo
              </button>
              <button onClick={() => { setEmail("student@educonnect.com"); setPassword("Password123!"); }} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100">
                Student Demo
              </button>
            </div>
          </div>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

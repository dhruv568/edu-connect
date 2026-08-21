"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Lock, CheckCircle2, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("Password Mismatch", "Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password.");

      setResetComplete(true);
      showToast("Password Reset Complete!", data.message, "success");
    } catch (err: any) {
      showToast("Reset Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-md mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="emerald">SECURE PASSWORD RESET</GlassBadge>
          <h1 className="text-3xl font-black text-slate-900">Set New Password</h1>
          <p className="text-xs text-slate-500">Create a new secure password for your account</p>
        </div>

        <GlassCard glowColor="rgba(16, 185, 129, 0.15)" className="p-8 border border-white/90 shadow-xl space-y-6">
          {resetComplete ? (
            <div className="space-y-4 text-center py-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Password Updated!</h3>
              <p className="text-xs text-slate-600">Your password has been successfully updated. You can now sign in.</p>
              <GlassButton variant="primary" className="w-full mt-4" onClick={() => router.push("/login")}>
                Go to Sign In
              </GlassButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-4 w-4" />}
                helperText="At least 8 characters, 1 uppercase, 1 number"
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <GlassButton type="submit" variant="primary" className="w-full mt-2" isLoading={loading} rightIcon={<ShieldCheck className="h-4 w-4" />}>
                Reset Password
              </GlassButton>
            </form>
          )}
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

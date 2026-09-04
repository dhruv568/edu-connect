"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  Loader2,
  Building,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Authentication failed.");
      }

      showToast(
        "Credentials Verified",
        "A 6-digit verification code has been dispatched to your email address.",
        "info"
      );
      setStep("otp");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in.");
      showToast("Access Denied", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          otp: otp.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Verification failed.");
      }

      showToast("Login Successful", "Welcome back to EduConnect Operations.", "success");
      const redirectPath =
        json.data?.user?.role === "ADMIN"
          ? "/admin"
          : json.data?.redirectPath || "/staff/dashboard";

      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed.");
      showToast("Verification Failed", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Building className="h-3.5 w-3.5" /> EduConnect Staff Portal
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
          Staff & Operations Sign In
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Dedicated administrative access point for authorized staff, moderators, and operations personnel.
        </p>
      </div>

      <div className="max-w-md w-full">
        <Card className="p-6 md:p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-white/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {step === "credentials" ? "Staff Authentication" : "Security Verification"}
              </h2>
              <p className="text-xs text-slate-500">
                {step === "credentials"
                  ? "Enter your staff email and password"
                  : `Enter the code dispatched to ${email}`}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <Input
                label="Staff Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@company.com"
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={loading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In to Staff Portal
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                A 6-digit two-factor verification code was sent to <span className="font-bold">{email}</span>.
              </div>

              <Input
                label="6-Digit Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                leftIcon={<KeyRound className="h-4 w-4" />}
                className="text-center font-mono tracking-widest text-lg"
                autoFocus
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleCredentialsSubmit}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Resend Code
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={loading}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Verify & Open Dashboard
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            <span>Are you a learner or educator? </span>
            <Link href="/" className="text-blue-600 hover:underline font-semibold">
              Return to EduConnect Portal
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

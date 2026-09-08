"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StaffRegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  // Step 1: Request OTP for invited email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/staff/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "No staff invitation found for this email address.");
      }

      setRoleName(json.data?.roleName || "Staff Member");
      if (json.data?.fullName) setFullName(json.data.fullName);
      setStep(2);
      setSuccessMsg(`Verification code dispatched to ${email.trim().toLowerCase()}`);
    } catch (err: any) {
      setError(err.message || "Failed to process invitation request.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Activate Account
  const handleVerifyAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !password) {
      setError("Please fill in both verification code and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/staff/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Verification failed.");
      }

      setSuccessMsg("Staff account activated successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push(json.data?.redirectPath || "/staff/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to activate staff account.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim() || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to resend code.");
      setSuccessMsg("A fresh 6-digit verification code has been sent.");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
            <ShieldCheck className="h-4 w-4" /> EduConnects Staff Portal
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Staff Account Activation</h1>
          <p className="text-xs text-slate-400">
            {step === 1
              ? "Enter your invited corporate email address to begin onboarding"
              : "Verify your email and configure your staff password"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Enter Email */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <Input
                label="Invited Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                leftIcon={<Mail className="h-4 w-4" />}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue to Verification
              </Button>
            </form>
          ) : (
            /* STEP 2: Enter OTP & Password */
            <form onSubmit={handleVerifyAndActivate} className="space-y-4">
              {/* Assigned Role Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Email</div>
                  <div className="font-semibold text-slate-200">{email}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">Assigned Role</div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 text-[11px]">
                    {roleName}
                  </span>
                </div>
              </div>

              <Input
                label="6-Digit Verification Code (OTP)"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                leftIcon={<KeyRound className="h-4 w-4" />}
                maxLength={6}
                required
                disabled={loading}
              />

              <Input
                label="Set Staff Password (Min 8 characters)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                required
                disabled={loading}
              />

              <Input
                label="Confirm Staff Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                required
                disabled={loading}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-slate-200 transition underline underline-offset-4"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition flex items-center gap-1"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} /> Resend OTP
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
                rightIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Activate Staff Account
              </Button>
            </form>
          )}

          <div className="border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
            Already activated your staff account?{" "}
            <Link href="/staff/login" className="text-blue-400 font-semibold hover:underline">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

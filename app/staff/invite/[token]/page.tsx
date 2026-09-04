"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Loader2,
  Sparkles,
  Building,
} from "lucide-react";

export default function StaffInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<{
    email: string;
    fullName: string | null;
    roleName: string;
    roleDescription: string | null;
    expiresAt: string;
  } | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/invite/${token}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Invalid or expired invitation link.");
      }

      setInvitation(json.data.invitation);
      if (json.data.invitation.fullName) {
        const parts = json.data.invitation.fullName.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    } catch (err: any) {
      setError(err.message || "Failed to validate invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      showToast("Password Weak", "Password must be at least 8 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Mismatch", "Passwords do not match.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/invite/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to initiate verification.");
      }

      showToast(
        "Verification Dispatched",
        "A 6-digit verification code has been dispatched to your email address.",
        "info"
      );
      setStep("otp");
    } catch (err: any) {
      showToast("Error", err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.trim().length !== 6) {
      showToast("Invalid Code", "Please enter the 6-digit verification code.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/invite/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
          otp: otp.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Account activation failed.");
      }

      showToast("Account Activated", "Welcome to EduConnect! Redirecting to your dashboard...", "success");
      setTimeout(() => {
        router.push(json.data?.redirectPath || "/staff/dashboard");
      }, 1000);
    } catch (err: any) {
      showToast("Activation Failed", err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4">
      {/* Branding Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Building className="h-3.5 w-3.5" /> EduConnect Staff Portal
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
          Team Onboarding
        </h1>
      </div>

      <div className="max-w-md w-full">
        {loading ? (
          <Card className="p-8 text-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-white/20">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Validating invitation credentials...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-white/20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Invitation Unavailable
            </h2>
            <p className="text-xs text-slate-500">{error}</p>
            <div className="pt-2">
              <Link href="/staff/login">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Go to Staff Login
                </Button>
              </Link>
            </div>
          </Card>
        ) : invitation ? (
          <Card className="p-6 md:p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-white/20 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-extrabold rounded-md bg-blue-100 text-blue-800">
                  {invitation.roleName}
                </span>
                <span className="text-xs text-slate-500 font-medium">Platform Role</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
                Set Up Your Staff Account
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You have been invited to join the platform team. Configure your security password to gain access.
              </p>
            </div>

            {/* Email Locked Pill */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Authorized Email:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {invitation.email}
              </span>
            </div>

            {step === "details" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>

                <Input
                  label="Create Password *"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  leftIcon={<Lock className="h-4 w-4" />}
                  required
                />

                <Input
                  label="Confirm Password *"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  isLoading={submitting}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue to Email Verification
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndAccept} className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  A 6-digit confirmation code was sent to <span className="font-bold">{invitation.email}</span>. Please enter it below to finish onboarding.
                </div>

                <Input
                  label="6-Digit Verification Code *"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  className="text-center font-mono tracking-widest text-lg"
                  required
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
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
                  isLoading={submitting}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Verify & Activate Account
                </Button>
              </form>
            )}

            <div className="text-center pt-2">
              <Link
                href="/staff/login"
                className="text-xs text-slate-500 hover:text-blue-600 transition"
              >
                Already have an active account? Sign in here
              </Link>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

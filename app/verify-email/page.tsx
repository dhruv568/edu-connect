"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { maskEmail } from "@/lib/auth/tokens";
import { BackButton } from "@/components/ui/back-button";
import { Logo } from "@/components/brand/logo";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const queryEmail = searchParams.get("email") || "user@example.com";
  const queryToken = searchParams.get("token");
  const redirectTo = searchParams.get("redirectTo");

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [verified, setVerified] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatic token link verification handler
  useEffect(() => {
    if (queryToken && queryEmail) {
      setVerifyingToken(true);
      fetch(`/api/auth/verify-email?token=${encodeURIComponent(queryToken)}&email=${encodeURIComponent(queryEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const target = data.data?.redirectPath || redirectTo || "/student/dashboard";
            setRedirectTarget(target);
            setVerified(true);
            showToast("Email Verified!", "Welcome to EduConnects 🎓", "success", true);
            setTimeout(() => {
              router.push(target);
            }, 1200);
          } else {
            const msg = data.error || "Invalid verification link.";
            setErrorMessage(msg);
            showToast("Verification Error", msg, "error");
          }
        })
        .catch((err) => {
          setErrorMessage(err.message || "Failed to verify link.");
          showToast("Error", err.message, "error");
        })
        .finally(() => {
          setVerifyingToken(false);
        });
    }
  }, [queryToken, queryEmail, redirectTo, router, showToast]);

  // Auto-focus first input on load when not verifying a query token link
  useEffect(() => {
    if (!verifyingToken && !verified) {
      inputRefs.current[0]?.focus();
    }
  }, [verifyingToken, verified]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Distribute digits into OTP boxes starting from a given index (or 0 if 6+ digits)
  const fillOtp = (text: string, startIndex = 0) => {
    const digits = text.replace(/\D/g, "");
    if (!digits) return;

    setErrorMessage(null);

    // If 6 or more digits (complete OTP), distribute across all 6 slots starting at index 0
    if (digits.length >= 6) {
      const full = digits.slice(0, 6).split("");
      setOtp(full);
      inputRefs.current[5]?.focus();
      return;
    }

    // Distribute partial digits starting from startIndex
    const newOtp = [...otp];
    let lastFilled = startIndex;
    for (let i = 0; i < digits.length && startIndex + i < 6; i++) {
      newOtp[startIndex + i] = digits[i];
      lastFilled = startIndex + i;
    }
    setOtp(newOtp);
    const nextTarget = Math.min(lastFilled + 1, 5);
    inputRefs.current[nextTarget]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    setErrorMessage(null);

    // Cleared
    if (!digits) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Normal single-digit typing
    if (digits.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = digits;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    // If user typed into an already filled box (e.g. existing '4' with new key '7' -> '47')
    if (digits.length === 2 && otp[index]) {
      const typedChar = digits[0] === otp[index] ? digits[1] : digits[0];
      const newOtp = [...otp];
      newOtp[index] = typedChar;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    // Multi-digit entry from autofill, mobile SMS autofill bar, or virtual keyboard
    fillOtp(digits, index);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear current box if it has a digit
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // If current box is empty, jump back to previous box, clear it and focus it
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Delete") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    fillOtp(pasted, index);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      showToast("Invalid Input", "Please enter all 6 digits of the OTP code.", "error");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: queryEmail, otp: code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect verification code. Please check your email and try again.");
      }

      const target = data.data?.redirectPath || redirectTo || "/student/dashboard";
      setRedirectTarget(target);
      setVerified(true);
      showToast("Verification Successful!", "Identity confirmed. Redirecting...", "success", true);
      setTimeout(() => {
        window.location.replace(target);
      }, 800);
    } catch (err: any) {
      const msg = err.message || "Verification failed.";
      setErrorMessage(msg);
      showToast("Verification Failed", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: queryEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code.");

      setResendCooldown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      showToast("Code Resent ✉️", "A new 6-digit verification code was sent to your email inbox.", "info");
    } catch (err: any) {
      setErrorMessage(err.message || "Resend failed.");
      showToast("Resend Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 text-center relative z-10 space-y-6"
      >
        <div className="flex justify-center">
          <Logo variant="compact" size="lg" href="/" priority />
        </div>
        {verified ? (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Verification Complete!</h2>
            <p className="text-sm text-slate-600">
              Identity confirmed. Redirecting to your dashboard...
            </p>
            <Button
              variant="gradient"
              className="w-full mt-4 h-12 text-base font-bold"
              onClick={() => router.push(redirectTarget || "/student/dashboard")}
            >
              Continue to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Mail className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Check your inbox ✉️</h2>
              <p className="text-sm text-slate-500 mt-1">
                We&apos;ve sent a 6-digit verification code to
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1.5 bg-slate-100 py-1 px-4 rounded-full inline-block">
                {maskEmail(queryEmail)}
              </p>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 flex items-center gap-2 text-left"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {verifyingToken ? (
              <div className="py-6 space-y-2 text-slate-500 text-sm">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                <p>Verifying email link...</p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      name={`otp-${idx}`}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? "one-time-code" : "off"}
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={(e) => handlePaste(e, idx)}
                      onFocus={(e) => e.target.select()}
                      className="w-11 sm:w-12 h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
                      aria-label={`Digit ${idx + 1} of 6-digit verification code`}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-12 text-base font-bold"
                  isLoading={loading}
                >
                  {redirectTo === "/admin"
                    ? "Verify Admin OTP & Sign In"
                    : redirectTo?.includes("/teacher")
                    ? "Verify Educator OTP & Sign In"
                    : redirectTo?.includes("/student")
                    ? "Verify Learner OTP & Sign In"
                    : "Verify OTP & Continue"}
                </Button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              {redirectTo === "/admin" ? (
                <a
                  href="/admin/login?restart=true"
                  className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  ← Admin Login
                </a>
              ) : redirectTo?.includes("/teacher") ? (
                <a
                  href="/teacher/login?restart=true"
                  className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  ← Educator Login
                </a>
              ) : redirectTo?.includes("/student") ? (
                <a
                  href="/student/login?restart=true"
                  className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  ← Learner Login
                </a>
              ) : (
                <BackButton
                  fallbackUrl="/login?restart=true"
                  label="Back to Login"
                  variant="ghost"
                />
              )}

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-blue-600 hover:text-blue-700 font-bold disabled:text-slate-400 flex items-center gap-1 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading verification page...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

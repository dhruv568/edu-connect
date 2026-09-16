"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { RegistrationCaptcha } from "@/components/auth/registration-captcha";
import {
  GraduationCap,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Award,
  IndianRupee,
  Clock,
  Video,
  Check,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface EducatorFlowState {
  step: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  captchaToken: string;
  captchaAnswer: string;
  otp: string;
  otpCooldown: number;
  // Professional fields
  headline: string;
  subjects: string;
  qualifications: string;
  experienceYears: number;
  specialization: string;
  teachingMode: string;
  hourlyRate: number;
  languages: string;
  bio: string;
  // Order & payment
  orderData: any | null;
  paymentLoading: boolean;
  paymentError: string | null;
}

const STORAGE_KEY = "educonnects_educator_flow_state";

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Verification" },
  { number: 3, label: "Profile" },
  { number: 4, label: "₹99 Fee" },
  { number: 5, label: "Payment" },
  { number: 6, label: "Complete" },
];

function EducatorRegistrationFlowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [state, setState] = useState<EducatorFlowState>({
    step: 1,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    captchaToken: "",
    captchaAnswer: "",
    otp: "",
    otpCooldown: 0,
    headline: "",
    subjects: "Mathematics",
    qualifications: "",
    experienceYears: 3,
    specialization: "",
    teachingMode: "ONLINE",
    hourlyRate: 500,
    languages: "English, Hindi",
    bio: "",
    orderData: null,
    paymentLoading: false,
    paymentError: null,
  });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submittingStep, setSubmittingStep] = useState(false);

  // Restore state from sessionStorage and check existing registration or URL params
  useEffect(() => {
    let savedState: Partial<EducatorFlowState> = {};
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        savedState = JSON.parse(stored);
      }
    } catch {}

    const orderIdParam = searchParams.get("order_id") || searchParams.get("orderId");
    const stepParam = searchParams.get("step");
    const emailParam = searchParams.get("email");

    const activeEmail = emailParam || savedState.email || "";

    if (activeEmail) {
      fetch(`/api/teacher/registration?email=${encodeURIComponent(activeEmail)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success && json.data) {
            const d = json.data;
            if (d.registered) {
              window.location.replace("/teacher/dashboard");
              return;
            }
            if (d.exists) {
              setState((prev) => ({
                ...prev,
                firstName: d.firstName || prev.firstName,
                lastName: d.lastName || prev.lastName,
                phone: d.phone || prev.phone,
                step: orderIdParam ? 6 : Math.max(prev.step, d.step || 1),
                orderData: d.orderData || prev.orderData,
              }));
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingInitial(false));
    } else {
      setLoadingInitial(false);
    }

    setState((prev) => ({
      ...prev,
      ...savedState,
      email: activeEmail || prev.email,
      step: orderIdParam ? 6 : stepParam ? parseInt(stepParam, 10) : savedState.step || prev.step,
    }));

    if (orderIdParam) {
      handleVerifyPayment(orderIdParam, activeEmail);
    }
  }, [searchParams]);

  // Persist state in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step: state.step,
          firstName: state.firstName,
          lastName: state.lastName,
          email: state.email,
          phone: state.phone,
          headline: state.headline,
          subjects: state.subjects,
          qualifications: state.qualifications,
          experienceYears: state.experienceYears,
          specialization: state.specialization,
          teachingMode: state.teachingMode,
          hourlyRate: state.hourlyRate,
          languages: state.languages,
          bio: state.bio,
          orderData: state.orderData,
        })
      );
    } catch {}
  }, [state]);

  // OTP cooldown timer
  useEffect(() => {
    if (state.otpCooldown <= 0) return;
    const t = setInterval(() => {
      setState((prev) => ({ ...prev, otpCooldown: Math.max(0, prev.otpCooldown - 1) }));
    }, 1000);
    return () => clearInterval(t);
  }, [state.otpCooldown]);

  // Step 1: Submit Basic Info
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.firstName.trim() || !state.lastName.trim()) {
      showToast("Required Fields", "Please enter your first and last name.", "error");
      return;
    }
    if (!state.email.trim() || !state.phone.trim()) {
      showToast("Contact Required", "Please enter your email and phone number.", "error");
      return;
    }
    if (!state.password || state.password.length < 8) {
      showToast("Password Format", "Password must contain at least 8 characters.", "error");
      return;
    }
    if (state.password !== state.confirmPassword) {
      showToast("Password Mismatch", "Passwords do not match.", "error");
      return;
    }

    setSubmittingStep(true);
    try {
      const res = await fetch("/api/teacher/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STEP1_INITIATE",
          firstName: state.firstName,
          lastName: state.lastName,
          email: state.email,
          phone: state.phone,
          password: state.password,
          confirmPassword: state.confirmPassword,
          captchaToken: state.captchaToken,
          captchaAnswer: state.captchaAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate registration.");

      showToast("Verification Sent! ✉️", "A 6-digit code has been dispatched to your email.", "success");
      setState((prev) => ({ ...prev, step: 2, otpCooldown: 60 }));
    } catch (err: any) {
      showToast("Registration Error", err.message, "error");
    } finally {
      setSubmittingStep(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (state.otpCooldown > 0) return;
    try {
      const res = await fetch("/api/teacher/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESEND_OTP",
          email: state.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code.");
      showToast("Code Resent", "A new verification code was sent to your email.", "success");
      setState((prev) => ({ ...prev, otpCooldown: 60 }));
    } catch (err: any) {
      showToast("Resend Error", err.message, "error");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.otp.trim() || state.otp.trim().length !== 6) {
      showToast("Invalid Code", "Please enter the complete 6-digit verification code.", "error");
      return;
    }

    setSubmittingStep(true);
    try {
      const res = await fetch("/api/teacher/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STEP2_VERIFY_OTP",
          email: state.email,
          otp: state.otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");

      showToast("Email Verified!", "Please complete your professional educator profile.", "success");
      setState((prev) => ({ ...prev, step: 3 }));
    } catch (err: any) {
      showToast("Verification Error", err.message, "error");
    } finally {
      setSubmittingStep(false);
    }
  };

  // Step 3: Save Professional Profile
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.headline.trim() || !state.subjects.trim()) {
      showToast("Required Information", "Please enter your headline and teaching subjects.", "error");
      return;
    }
    if (!state.qualifications.trim()) {
      showToast("Qualification Required", "Please specify your educational degrees or qualifications.", "error");
      return;
    }

    setSubmittingStep(true);
    try {
      const res = await fetch("/api/teacher/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STEP3_SAVE_PROFILE",
          email: state.email,
          headline: state.headline,
          subjects: state.subjects,
          qualifications: state.qualifications,
          experienceYears: state.experienceYears,
          specialization: state.specialization,
          hourlyRate: state.hourlyRate,
          teachingMode: state.teachingMode,
          languages: state.languages,
          bio: state.bio,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile details.");

      showToast("Profile Details Saved", "Review the mandatory educator registration fee.", "success");
      setState((prev) => ({ ...prev, step: 4 }));
    } catch (err: any) {
      showToast("Save Error", err.message, "error");
    } finally {
      setSubmittingStep(false);
    }
  };

  // Cashfree SDK loader helper
  const loadCashfreeSdk = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Cashfree) {
        resolve((window as any).Cashfree);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).Cashfree) resolve((window as any).Cashfree);
        else reject(new Error("Cashfree checkout SDK failed to initialize."));
      };
      script.onerror = () => reject(new Error("Failed to load Cashfree script."));
      document.body.appendChild(script);
    });
  };

  // Step 4 & 5: Initiate ₹99 Payment
  const handleInitiatePayment = async () => {
    setState((prev) => ({
      ...prev,
      step: 5,
      paymentLoading: true,
      paymentError: null,
    }));

    try {
      const res = await fetch("/api/teacher/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STEP5_CREATE_ORDER",
          email: state.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not initialize payment order.");

      const order = data.data;
      setState((prev) => ({ ...prev, orderData: order }));

      const isProd = order.env === "PRODUCTION";
      const isMockSession = order.paymentSessionId?.startsWith("session_mock_");

      if (order.paymentSessionId && (isProd || !isMockSession)) {
        const Cashfree = await loadCashfreeSdk();
        const cashfree = Cashfree({ mode: isProd ? "production" : "sandbox" });
        const returnUrl = `${window.location.origin}/teacher/register?order_id=${encodeURIComponent(order.cfOrderId || order.orderId)}&step=6`;

        await cashfree.checkout({
          paymentSessionId: order.paymentSessionId,
          returnUrl,
        });
      } else {
        handleVerifyPayment(order.orderId || order.cfOrderId, state.email);
      }
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        paymentLoading: false,
        paymentError: err.message || "Payment initiation error. Please try again.",
      }));
    }
  };

  // Step 6: Verify Payment & Complete Registration
  const handleVerifyPayment = async (orderId: string, emailOverride?: string) => {
    setState((prev) => ({ ...prev, step: 6, paymentLoading: true, paymentError: null }));
    const targetEmail = emailOverride || state.email;

    try {
      const res = await fetch("/api/teacher/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STEP6_VERIFY_PAYMENT",
          email: targetEmail,
          orderId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification incomplete.");
      }

      showToast("Registration Complete! 🎉", "Welcome to EduConnects! Redirecting to Educator Dashboard...", "success");

      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}

      setTimeout(() => {
        window.location.replace("/teacher/dashboard");
      }, 1500);
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        paymentLoading: false,
        paymentError: err.message || "Payment verification failed. Your registration charge is not complete.",
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-2">
        <GlassBadge variant="educator">
          STEP {state.step} OF 6 • EDUCATOR REGISTRATION &amp; VERIFICATION
        </GlassBadge>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {state.step === 1 && "Create Your Educator Account"}
          {state.step === 2 && "Verify Email Verification Code"}
          {state.step === 3 && "Complete Professional Profile"}
          {state.step === 4 && "Educator Registration Fee — ₹99"}
          {state.step === 5 && "Complete ₹99 Payment via Cashfree"}
          {state.step === 6 && "Account Activation Status"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          {state.step === 1 && "Enter your basic personal details to begin teaching on EduConnects."}
          {state.step === 2 && `Enter the 6-digit security OTP sent to ${state.email}.`}
          {state.step === 3 && "Tell us about your teaching experience, subjects, and credentials."}
          {state.step === 4 && "Review the mandatory ₹99 educator registration fee before checkout."}
          {state.step === 5 && "Secure INR (₹) processing via Cashfree Payment Gateway."}
          {state.step === 6 && "Confirming payment and preparing your Educator Dashboard."}
        </p>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-1.5 pt-3 max-w-md mx-auto">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                state.step >= s.number ? "bg-[#16805B]" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Information */}
      {state.step === 1 && (
        <GlassCard className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xl space-y-5">
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Ananya"
                value={state.firstName}
                onChange={(e) => setState((p) => ({ ...p, firstName: e.target.value }))}
                required
              />
              <Input
                label="Last Name"
                placeholder="Sharma"
                value={state.lastName}
                onChange={(e) => setState((p) => ({ ...p, lastName: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="ananya.sharma@example.com"
                value={state.email}
                onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
                leftIcon={<Mail className="h-4 w-4 text-[#16805B]" />}
                required
              />
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="9876543210"
                value={state.phone}
                onChange={(e) => setState((p) => ({ ...p, phone: e.target.value }))}
                leftIcon={<Phone className="h-4 w-4 text-[#16805B]" />}
                required
                helperText="For session notifications and payout updates"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={state.password}
                onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))}
                leftIcon={<Lock className="h-4 w-4 text-[#16805B]" />}
                required
                helperText="Minimum 8 characters"
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={state.confirmPassword}
                onChange={(e) => setState((p) => ({ ...p, confirmPassword: e.target.value }))}
                leftIcon={<Lock className="h-4 w-4 text-[#16805B]" />}
                required
              />
            </div>

            <div className="pt-2">
              <RegistrationCaptcha
                onVerifyChange={(token: string, answer: string) => {
                  setState((p) => ({ ...p, captchaToken: token, captchaAnswer: answer }));
                }}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submittingStep}
                className="w-full h-11 px-6 rounded-xl text-sm font-bold text-white bg-[#16805B] hover:bg-[#0D5C41] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {submittingStep ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Step 2 (Verification)</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an Educator account?{" "}
            <Link href="/teacher/login" className="font-bold text-[#16805B] hover:text-[#0D5C41] hover:underline">
              Educator Login →
            </Link>
          </div>
        </GlassCard>
      )}

      {/* STEP 2: Email Verification (OTP) */}
      {state.step === 2 && (
        <GlassCard className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xl space-y-6">
          <div className="p-4 rounded-2xl bg-[#F0FAF5] border border-[#A7F3D0] flex items-center gap-3">
            <Mail className="h-6 w-6 text-[#16805B] shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900">Verification Code Sent:</span>
              <p className="text-slate-600">
                We sent a 6-digit code to <strong className="text-slate-900">{state.email}</strong>. Please enter it below.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input
              label="6-Digit Verification Code"
              placeholder="123456"
              maxLength={6}
              value={state.otp}
              onChange={(e) => setState((p) => ({ ...p, otp: e.target.value.replace(/\D/g, "") }))}
              required
              helperText="Enter the OTP code received in your email inbox or spam folder"
            />

            <div className="flex items-center justify-between text-xs font-semibold">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={state.otpCooldown > 0}
                className="text-[#16805B] hover:text-[#0D5C41] disabled:text-slate-400 cursor-pointer"
              >
                {state.otpCooldown > 0 ? `Resend Code in ${state.otpCooldown}s` : "Resend Verification Code"}
              </button>
              <button
                type="button"
                onClick={() => setState((p) => ({ ...p, step: 1 }))}
                className="text-slate-500 hover:text-slate-800"
              >
                ← Edit Personal Details
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingStep}
                className="w-full h-11 px-6 rounded-xl text-sm font-bold text-white bg-[#16805B] hover:bg-[#0D5C41] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {submittingStep ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email &amp; Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* STEP 3: Professional Information */}
      {state.step === 3 && (
        <GlassCard className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xl space-y-5">
          <form onSubmit={handleStep3Submit} className="space-y-4">
            <Input
              label="Professional Headline"
              placeholder="e.g. Senior Mathematics Educator & Olympiad Mentor"
              value={state.headline}
              onChange={(e) => setState((p) => ({ ...p, headline: e.target.value }))}
              required
              helperText="A clear headline describing your teaching expertise"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teaching Subjects"
                placeholder="e.g. Mathematics, Calculus, Physics"
                value={state.subjects}
                onChange={(e) => setState((p) => ({ ...p, subjects: e.target.value }))}
                required
                helperText="Comma-separated subjects you specialize in"
              />
              <Input
                label="Highest Educational Qualification"
                placeholder="e.g. M.Sc. in Physics, B.Ed"
                value={state.qualifications}
                onChange={(e) => setState((p) => ({ ...p, qualifications: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Teaching Experience (Years)"
                type="number"
                min={0}
                max={50}
                value={state.experienceYears}
                onChange={(e) => setState((p) => ({ ...p, experienceYears: Number(e.target.value) }))}
                required
              />
              <Input
                label="Hourly Tutoring Rate (₹)"
                type="number"
                min={100}
                max={10000}
                step={50}
                value={state.hourlyRate}
                onChange={(e) => setState((p) => ({ ...p, hourlyRate: Number(e.target.value) }))}
                required
                helperText="Base fee for 1-on-1 live sessions"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Teaching Mode
                </label>
                <select
                  value={state.teachingMode}
                  onChange={(e) => setState((p) => ({ ...p, teachingMode: e.target.value }))}
                  className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                >
                  <option value="ONLINE">Online Virtual Classroom</option>
                  <option value="OFFLINE">In-Person Offline Sessions</option>
                  <option value="BOTH">Both Online &amp; Offline</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teaching Specialization"
                placeholder="e.g. JEE Advanced, CBSE Boards, Coding Bootcamp"
                value={state.specialization}
                onChange={(e) => setState((p) => ({ ...p, specialization: e.target.value }))}
              />
              <Input
                label="Languages Spoken"
                placeholder="e.g. English, Hindi"
                value={state.languages}
                onChange={(e) => setState((p) => ({ ...p, languages: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Short Educator Bio (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share your teaching philosophy, achievements, and what students can expect from your classes..."
                value={state.bio}
                onChange={(e) => setState((p) => ({ ...p, bio: e.target.value }))}
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl outline-none text-slate-900 resize-none font-medium"
              />
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setState((p) => ({ ...p, step: 2 }))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={submittingStep}
                className="flex-1 h-11 px-6 rounded-xl text-sm font-bold text-white bg-[#16805B] hover:bg-[#0D5C41] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {submittingStep ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Registration Fee</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* STEP 4: Registration Fee Review (₹99) */}
      {state.step === 4 && (
        <GlassCard className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xl space-y-6">
          {/* Main ₹99 Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0D5C41] via-[#16805B] to-[#083827] text-white space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-emerald-100 border border-white/25">
                MANDATORY EDUCATOR FEE
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white">₹99</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Educator Registration Fee — ₹99</h3>
              <p className="text-xs text-emerald-50 leading-relaxed font-normal">
                To maintain authentic educational standards, verify educator credentials, and provision your dedicated browser-based HD live classroom and course distribution infrastructure, a nominal one-time registration charge of ₹99 applies.
              </p>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#F0FAF5] border border-[#A7F3D0] space-y-1">
              <ShieldCheck className="h-5 w-5 text-[#16805B]" />
              <div className="font-extrabold text-slate-900">Verified Educator Badge</div>
              <div className="text-[11px] text-slate-600">Priority listing in student searches</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F0FAF5] border border-[#A7F3D0] space-y-1">
              <Video className="h-5 w-5 text-[#16805B]" />
              <div className="font-extrabold text-slate-900">HD Live Classroom</div>
              <div className="text-[11px] text-slate-600">Built-in whiteboard &amp; screen sharing</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F0FAF5] border border-[#A7F3D0] space-y-1">
              <CreditCard className="h-5 w-5 text-[#16805B]" />
              <div className="font-extrabold text-slate-900">Direct Bank Payouts</div>
              <div className="text-[11px] text-slate-600">Automated Cashfree weekly transfers</div>
            </div>
          </div>

          {/* Order Summary Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Educator Account Verification &amp; Setup:</span>
              <span className="font-bold text-slate-900">₹99.00</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Processing &amp; Taxes:</span>
              <span className="font-bold text-[#16805B]">Included</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Total Payable Amount:</span>
              <span className="text-[#0D5C41]">₹99.00 INR</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setState((p) => ({ ...p, step: 3 }))}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ← Edit Profile Details
            </button>

            <button
              type="button"
              onClick={handleInitiatePayment}
              className="w-full sm:flex-1 h-12 px-6 rounded-xl text-sm font-black text-white bg-[#16805B] hover:bg-[#0D5C41] shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CreditCard className="h-4 w-4" />
              <span>Proceed to Pay ₹99 via Cashfree</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>
      )}

      {/* STEP 5: Payment Processing Screen */}
      {state.step === 5 && (
        <GlassCard className="p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xl space-y-6 text-center">
          {state.paymentLoading ? (
            <div className="py-10 space-y-4">
              <Loader2 className="h-10 w-10 text-[#16805B] animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Connecting to Cashfree Payment Gateway...
                </h3>
                <p className="text-xs text-slate-500">
                  Please complete the ₹99 payment in the checkout window. Do not close or refresh this tab.
                </p>
              </div>
            </div>
          ) : state.paymentError ? (
            <div className="py-6 space-y-4">
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-2xl w-fit mx-auto">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Payment Incomplete or Cancelled</h3>
                <p className="text-xs text-red-600 max-w-md mx-auto">{state.paymentError}</p>
                <p className="text-xs text-slate-500 pt-2">
                  Your educator account has not been activated. Please complete the ₹99 payment to finish registration.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setState((p) => ({ ...p, step: 4 }))}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Review Order
                </button>
                <button
                  onClick={handleInitiatePayment}
                  className="h-11 px-6 rounded-xl text-xs font-black text-white bg-[#16805B] hover:bg-[#0D5C41] flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry ₹99 Payment</span>
                </button>
              </div>
            </div>
          ) : null}
        </GlassCard>
      )}

      {/* STEP 6: Completion / Verification State */}
      {state.step === 6 && (
        <GlassCard className="p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xl space-y-6 text-center">
          {state.paymentLoading ? (
            <div className="py-10 space-y-4">
              <Loader2 className="h-10 w-10 text-[#16805B] animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Verifying Payment with Cashfree...</h3>
                <p className="text-xs text-slate-500">
                  Activating your educator profile and generating portal credentials.
                </p>
              </div>
            </div>
          ) : state.paymentError ? (
            <div className="py-6 space-y-4">
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-2xl w-fit mx-auto">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Payment Verification Failed</h3>
                <p className="text-xs text-red-600 max-w-md mx-auto">{state.paymentError}</p>
                <p className="text-xs text-slate-500 pt-1">
                  We could not confirm your ₹99 registration charge.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setState((p) => ({ ...p, step: 4 }))}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Review Order
                </button>
                <button
                  onClick={handleInitiatePayment}
                  className="h-11 px-6 rounded-xl text-xs font-black text-white bg-[#16805B] hover:bg-[#0D5C41] flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Payment</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-4">
              <div className="p-3.5 bg-[#F0FAF5] text-[#16805B] border border-[#A7F3D0] rounded-3xl w-fit mx-auto">
                <CheckCircle2 className="h-12 w-12 text-[#16805B]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Welcome to EduConnects! 🎉
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Your ₹99 registration charge has been successfully processed via Cashfree. Your educator account is now active.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/teacher/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black text-white bg-[#16805B] hover:bg-[#0D5C41] shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Educator Dashboard</span>
                </Link>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}

export function EducatorRegistrationFlow() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#16805B]" />
          <span className="text-sm font-bold">Loading Educator Registration...</span>
        </div>
      }
    >
      <EducatorRegistrationFlowContent />
    </Suspense>
  );
}

export default EducatorRegistrationFlow;

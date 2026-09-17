"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { RegistrationCaptcha } from "@/components/auth/registration-captcha";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Globe,
  Headphones,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [roleType, setRoleType] = useState<"STUDENT" | "TEACHER" | "GENERAL">("GENERAL");
  const [loading, setLoading] = useState(false);

  // CAPTCHA State
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const { showToast } = useToast();

  const handleCaptchaVerifyChange = (token: string, answer: string) => {
    setCaptchaToken(token);
    setCaptchaAnswer(answer);
    if (captchaError) setCaptchaError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken || !captchaAnswer.trim()) {
      setCaptchaError("Please solve the security CAPTCHA before submitting.");
      showToast("Security Verification Required", "Please solve the security CAPTCHA before submitting.", "error");
      return;
    }

    setLoading(true);
    setCaptchaError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          roleType,
          captchaToken,
          captchaAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("captcha")) {
          setCaptchaError(data.error);
        }
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      showToast(
        "Inquiry Received! 🎉",
        data.message || "Thank you for reaching out. The EduConnects Support Team will get back to you shortly.",
        "success"
      );
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCaptchaToken("");
      setCaptchaAnswer("");
    } catch (err: any) {
      showToast("Submission Error", err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-500/20 selection:text-blue-900">
      <FloatingNavbar />

      <main className="flex-1 pt-28 sm:pt-32 pb-20 max-w-5xl mx-auto px-4 w-full space-y-10 sm:space-y-12">
        {/* Header Title Section */}
        <div className="text-center space-y-3">
          <GlassBadge variant="blue">CONTACT & SUPPORT</GlassBadge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Get in Touch with {OFFICIAL_COMPANY_INFO.brandName}
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Connect directly with the EduConnects Support Team for platform guidance, course inquiries, educator assistance, and general support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Official Business & Company Details Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-6 space-y-6 border border-white/80 shadow-xl">
              {/* Brand Header */}
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
                  Brand Name
                </span>
                <h3 className="text-xl font-black text-slate-900">{OFFICIAL_COMPANY_INFO.brandName}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{OFFICIAL_COMPANY_INFO.legalName}</p>
              </div>

              <div className="space-y-5">
                {/* EduConnects Support Team */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0 shadow-2xs">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Support Team
                    </h4>
                    <p className="text-sm font-bold text-slate-900">EduConnects Support Team</p>
                    <p className="text-[11px] text-slate-500 font-medium">Dedicated Assistance & Inquiries</p>
                  </div>
                </div>

                {/* Official EduConnects Website */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0 shadow-2xs">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Official EduConnects Website
                    </h4>
                    <a
                      href="https://educonnects.co.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>educonnects.co.in</span>
                    </a>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100 shrink-0 shadow-2xs">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Mobile Number
                    </h4>
                    <a
                      href={OFFICIAL_COMPANY_INFO.phoneUrl}
                      className="text-sm font-bold text-sky-600 hover:underline flex items-center gap-1"
                    >
                      {OFFICIAL_COMPANY_INFO.phoneNumber}
                    </a>
                    <p className="text-[11px] text-slate-500 font-medium">Direct call & phone support</p>
                  </div>
                </div>

                {/* Official WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shrink-0 shadow-2xs">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Official WhatsApp
                    </h4>
                    <a
                      href={OFFICIAL_COMPANY_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      {OFFICIAL_COMPANY_INFO.whatsappNumber}
                    </a>
                    <p className="text-[11px] text-slate-500 font-medium">Instant assistance & support</p>
                  </div>
                </div>

                {/* Registered Office */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 shrink-0 shadow-2xs">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Registered Office
                    </h4>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {OFFICIAL_COMPANY_INFO.registeredAddress}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* WhatsApp CTA Support Box */}
            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200/80 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <h4 className="text-xs font-black text-emerald-900">WhatsApp Live Support</h4>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                Need quick help with course access or educator onboarding? Connect directly with our support desk on WhatsApp.
              </p>
              <a
                href={OFFICIAL_COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Us Form with CAPTCHA (7 cols) */}
          <div className="lg:col-span-7">
            <GlassCard glowColor="rgba(99, 102, 241, 0.15)" className="p-6 sm:p-8 border border-white/80 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Inquiry Type:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["GENERAL", "STUDENT", "TEACHER"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoleType(r)}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                          roleType === r
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {r === "GENERAL"
                          ? "General"
                          : r === "STUDENT"
                          ? "Learner"
                          : "Educator"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="yourname@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Subject"
                  placeholder="How can the support team help you?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about your inquiry..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                {/* Security CAPTCHA for Spam Protection */}
                <RegistrationCaptcha
                  onVerifyChange={handleCaptchaVerifyChange}
                  error={captchaError}
                />

                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-sm font-bold"
                  isLoading={loading}
                  rightIcon={<Send className="h-4 w-4" />}
                >
                  Send Inquiry
                </GlassButton>

                <div className="text-center pt-1">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    Protected by EduConnects CAPTCHA Security & 256-Bit SSL Encryption.
                  </p>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

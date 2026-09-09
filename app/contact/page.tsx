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
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, UserCheck, ShieldCheck } from "lucide-react";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [roleType, setRoleType] = useState<"STUDENT" | "TEACHER" | "GENERAL">("GENERAL");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, roleType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit inquiry.");

      showToast("Inquiry Received!", data.message || "Thank you for reaching out. We will get back to you shortly.", "success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      showToast("Submission Error", err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-5xl mx-auto px-4 w-full space-y-12">
        <div className="text-center space-y-3">
          <GlassBadge variant="blue">CONTACT US</GlassBadge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Get in Touch with {OFFICIAL_COMPANY_INFO.brandName}
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            {OFFICIAL_COMPANY_INFO.tagline} • Connect with our official team for digital solutions, online education, and support inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Official Business Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Business Card Info */}
            <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-6 space-y-6 border border-white/80">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Brand Name</span>
                <h3 className="text-xl font-black text-slate-900">{OFFICIAL_COMPANY_INFO.brandName}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{OFFICIAL_COMPANY_INFO.legalName}</p>
              </div>

              <div className="space-y-4">
                {/* Founder & Authorized Signatory */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Founder & Authorized Signatory</h4>
                    <p className="text-sm font-bold text-slate-900">{OFFICIAL_COMPANY_INFO.founder}</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official WhatsApp</h4>
                    <a
                      href={OFFICIAL_COMPANY_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      {OFFICIAL_COMPANY_INFO.whatsappNumber}
                    </a>
                    <p className="text-[11px] text-slate-500">Instant assistance & support</p>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Website</h4>
                    <a
                      href={OFFICIAL_COMPANY_INFO.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-indigo-600 hover:underline"
                    >
                      {OFFICIAL_COMPANY_INFO.website}
                    </a>
                  </div>
                </div>

                {/* Registered Office */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Office</h4>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {OFFICIAL_COMPANY_INFO.registeredAddress}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* WhatsApp CTA Widget */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <h4 className="text-xs font-black text-emerald-900">WhatsApp Support Available</h4>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Connect directly with our team on WhatsApp for quick responses regarding course offerings and services.
              </p>
              <a
                href={OFFICIAL_COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <GlassCard glowColor="rgba(99, 102, 241, 0.15)" className="p-6 sm:p-8 border border-white/80">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                        {r === "GENERAL" ? "General" : r.charAt(0) + r.slice(1).toLowerCase()}
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
                  placeholder="How can we help you?"
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
                    className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={loading}
                  rightIcon={<Send className="h-4 w-4" />}
                >
                  Send Inquiry
                </GlassButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

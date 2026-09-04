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
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

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

      showToast("Inquiry Received!", data.message, "success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      showToast("Submission Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-5xl mx-auto px-4 w-full space-y-12">
        <div className="text-center space-y-3">
          <GlassBadge variant="blue">CONTACT EDUCONNECT</GlassBadge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Get in Touch with Our Team</h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Have a question about demo bookings, live classes, or teacher onboarding? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Info & Quick Shortcuts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Support Indicator */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Student Support: Online</h4>
                  <p className="text-[11px] text-slate-500">Average response &lt; 15 mins</p>
                </div>
              </div>
              <div className="flex items-center -space-x-1.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Counselor"
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                />
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80"
                  alt="Counselor"
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                />
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  +3
                </div>
              </div>
            </div>

            <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-6 space-y-6 border border-white/80">
              <h3 className="text-base font-bold text-slate-900">Direct Support Channels</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Us</h4>
                    <p className="text-sm font-bold text-slate-900">support@educonnect.com</p>
                    <p className="text-xs text-slate-500">24/7 dedicated support inbox</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Call Helpline</h4>
                    <p className="text-sm font-bold text-slate-900">+1 (800) 555-EDU1</p>
                    <p className="text-xs text-slate-500">Mon - Fri, 8am - 8pm EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Headquarters</h4>
                    <p className="text-sm font-bold text-slate-900">San Francisco, CA</p>
                    <p className="text-xs text-slate-500">100 Educational Way, Suite 400</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Quick Resolution Shortcuts */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Immediate Actions</h4>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/find-teachers"
                  className="p-2 rounded-xl bg-white text-slate-800 font-semibold flex items-center justify-between border border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <span>Reschedule a Demo Session</span>
                  <span className="text-blue-600 font-bold">→</span>
                </Link>
                <Link
                  href="/refund"
                  className="p-2 rounded-xl bg-white text-slate-800 font-semibold flex items-center justify-between border border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <span>Instant Class Cancellation & Refund</span>
                  <span className="text-blue-600 font-bold">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <GlassCard glowColor="rgba(99, 102, 241, 0.15)" className="p-8 border border-white/80">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    I am inquiring as a:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["STUDENT", "TEACHER", "GENERAL"] as const).map((r) => (
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
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Subject"
                  placeholder="Demo class booking inquiry..."
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

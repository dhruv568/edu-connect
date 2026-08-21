"use client";

import React, { useState } from "react";
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
  const [roleType, setRoleType] = useState<"STUDENT" | "TEACHER" | "PARENT" | "GENERAL">("GENERAL");
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
            Have a question about demo bookings, live classes, teacher onboarding, or parent accounts? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-6 space-y-6 border border-white/80">
              <h3 className="text-lg font-bold text-slate-900">Support Directory</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Email Support</div>
                    <div className="text-slate-500">support@educonnect.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Phone Support</div>
                    <div className="text-slate-500">+1 (800) 555-EDUCONNECT</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Global Headquarters</div>
                    <div className="text-slate-500">100 Education Way, Suite 400</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <GlassCard glowColor="rgba(99, 102, 241, 0.15)" className="p-8 border border-white/90 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    I am inquiring as a:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["STUDENT", "TEACHER", "PARENT", "GENERAL"] as const).map((r) => (
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

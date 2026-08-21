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
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request.");

      setSent(true);
      showToast("Reset Instructions Sent", data.message, "info");
    } catch (err: any) {
      showToast("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-md mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="blue">PASSWORD RECOVERY</GlassBadge>
          <h1 className="text-3xl font-black text-slate-900">Forgot Password</h1>
          <p className="text-xs text-slate-500">Enter your email address to receive password reset instructions</p>
        </div>

        <GlassCard glowColor="rgba(37, 99, 235, 0.15)" className="p-8 border border-white/90 shadow-xl space-y-6">
          {sent ? (
            <div className="space-y-4 text-center py-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists for <strong>{email}</strong>, we have dispatched a password reset link to your inbox.
              </p>
              <Link href="/login">
                <GlassButton variant="secondary" className="w-full mt-4">
                  Back to Sign In
                </GlassButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <GlassButton type="submit" variant="primary" className="w-full mt-2" isLoading={loading} rightIcon={<Send className="h-4 w-4" />}>
                Send Reset Instructions
              </GlassButton>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

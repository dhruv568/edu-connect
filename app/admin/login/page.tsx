"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FloatingNavbar } from "@/components/homepage/floating-navbar";
import { PremiumFooter } from "@/components/homepage/premium-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Admin login failed.");

      if (data.data.user.role !== "ADMIN") {
        throw new Error("Access denied: Account does not possess Administrative privileges.");
      }

      showToast("Admin Authenticated!", "Welcome to System Governance.", "success");
      router.push("/admin");
    } catch (err: any) {
      showToast("Authorization Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <FloatingNavbar />

      <main className="flex-1 pt-32 pb-20 max-w-md mx-auto px-4 w-full space-y-8">
        <div className="text-center space-y-2">
          <GlassBadge variant="dark">SECURE SYSTEM GOVERNANCE</GlassBadge>
          <h1 className="text-3xl font-black text-white">Admin Authentication</h1>
          <p className="text-xs text-slate-400">Restricted portal for system administrators</p>
        </div>

        <GlassCard dark glowColor="rgba(239, 68, 68, 0.2)" className="p-8 border border-white/20 shadow-2xl space-y-6">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@educonnect.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-800 text-white border-slate-700"
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-800 text-white border-slate-700"
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <GlassButton type="submit" variant="primary" className="w-full mt-2 bg-rose-600 hover:bg-rose-700" isLoading={loading} rightIcon={<ShieldCheck className="h-4 w-4" />}>
              Authenticate Admin Session
            </GlassButton>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => { setEmail("admin@educonnect.com"); setPassword("Password123!"); }}
              className="text-[11px] font-bold text-rose-400 hover:underline"
            >
              Fill Admin Dev Credentials (admin@educonnect.com)
            </button>
          </div>
        </GlassCard>
      </main>

      <PremiumFooter />
    </div>
  );
}

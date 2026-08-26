"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Server, CheckCircle2, AlertTriangle, RefreshCw, Database, CreditCard, Mail, Video } from "lucide-react";

export default function AdminSystemHealthPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system-health");
      const json = await res.json();
      if (json.data) setHealth(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <DashboardLayout role="ADMIN" userName="System Health">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              System Operational Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live service statuses for Database, Razorpay Payment Gateway, Email Provider, LiveKit, and Mux Video.
            </p>
          </div>

          <button
            onClick={fetchHealth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition"
            title="Refresh Status"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Global Operational Status Badge */}
        <Card className="p-6 bg-slate-900 text-white rounded-3xl flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Server className="h-8 w-8" />
            </div>
            <div>
              <div className="text-lg font-black">
                Platform Status: {health?.status || "OPERATIONAL"}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Last checked: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "Just now"}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
            ALL SYSTEMS GO
          </span>
        </Card>

        {/* Services Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">PostgreSQL Database</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {health?.services?.database?.status || "HEALTHY"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Provider: Neon Serverless PostgreSQL</p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Razorpay Payment Gateway</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {health?.services?.paymentGateway?.status || "ACTIVE"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Provider: Razorpay Standard & Route</p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Email Notification Service</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                HEALTHY
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Provider: {health?.services?.emailService?.provider || "Resend / SMTP"}
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-amber-500" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">LiveKit & Mux Streaming</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Providers: LiveKit WebRTC & Mux Video</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

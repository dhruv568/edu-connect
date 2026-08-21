"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Video, BookOpen, BarChart3, Users, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";

export function TrustChips() {
  const trustItems = [
    { icon: ShieldCheck, label: "Verified Teachers", color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: Video, label: "Live Interactive Learning", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: BookOpen, label: "Structured Courses", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: BarChart3, label: "Real-time Progress Tracking", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Users, label: "360° Parent Visibility", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <section className="py-12 border-y border-white/60 relative bg-white/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Built Around Real Learning
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {trustItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="glass-surface px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-default border border-white/80"
            >
              <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Target, Video, Play, Calendar, Users, CheckCircle2, ArrowRight, Mic, Award, Clock, Star } from "lucide-react";
import { UserRole } from "@/types/auth";

export interface LiquidLearningModelsProps {
  onOpenAuth: (role: UserRole) => void;
}

export function LiquidLearningModels({ onOpenAuth }: LiquidLearningModelsProps) {
  const [hoveredModel, setHoveredModel] = useState<number | null>(null);

  const models = [
    {
      id: 1,
      icon: Target,
      tag: "DEMO BOOKING",
      title: "Meet the teacher first.",
      tagline: "1-on-1 Introductory Sessions",
      description:
        "Book a low-pressure trial session with any verified teacher before making any subscription decisions.",
      badge: "Introductory",
      badgeVariant: "blue" as const,
      glow: "rgba(37, 99, 235, 0.2)",
      hoverDetails: "Interactive 1-on-1 calendar slot allocation with instant chat.",
      renderVisual: () => (
        <div className="relative rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-4 text-white overflow-hidden shadow-inner border border-blue-800/40 my-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-blue-200">1-on-1 Demo Slot</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
              Zero Commitment
            </span>
          </div>

          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt="Sarah Jenkins"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-400"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h5 className="text-xs font-black text-white">Sarah Jenkins, M.Sc.</h5>
                <p className="text-[10px] text-blue-300">Physics & Calculus Mentor</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-amber-300 font-bold">
                  ★ 4.95 (142 reviews)
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-blue-200 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-400" /> Tomorrow, 4:30 PM
            </span>
            <span className="text-emerald-300 font-bold">Free 30m Trial</span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      icon: Video,
      tag: "LIVE CLASS SLOT",
      title: "Learn together, live.",
      tagline: "Scheduled Interactive Slots",
      description:
        "Reserve your seat in live interactive classes with real-time video, digital whiteboards, and instant Q&A.",
      badge: "Live Interactive",
      badgeVariant: "indigo" as const,
      glow: "rgba(99, 102, 241, 0.2)",
      hoverDetails: "HD streaming classroom with interactive whiteboard & group chat.",
      renderVisual: () => (
        <div className="relative rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-4 text-white overflow-hidden shadow-inner border border-indigo-800/40 my-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>BROADCASTING LIVE</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Room 4-B
            </span>
          </div>

          <div className="py-2.5 space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/30 font-mono text-[11px] text-indigo-300 flex items-center justify-between">
              <span>∫(3x² + 2x) dx = x³ + x² + C</span>
              <span className="text-[9px] text-slate-400">Whiteboard</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-300">Active Q&A Session</span>
              </div>
              <div className="flex items-center -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-[9px] font-bold flex items-center justify-center ring-1 ring-slate-900">R</div>
                <div className="w-5 h-5 rounded-full bg-purple-500 text-[9px] font-bold flex items-center justify-center ring-1 ring-slate-900">A</div>
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-[9px] font-bold flex items-center justify-center ring-1 ring-slate-900">K</div>
                <span className="text-[9px] text-indigo-300 font-bold pl-2">+21 in class</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-indigo-200 font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-400" /> Max 25 Seats
            </span>
            <span className="text-amber-300 font-bold">3 Seats Left</span>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      icon: Play,
      tag: "PRE-RECORDED COURSE",
      title: "Learn at your own pace.",
      tagline: "Structured Self-Paced LMS",
      description:
        "Access structured, self-paced curriculum 24/7 complete with downloadable workbooks and automated quizzes.",
      badge: "24/7 Access",
      badgeVariant: "emerald" as const,
      glow: "rgba(16, 185, 129, 0.2)",
      hoverDetails: "Automated progress tracking with downloadable certificate modules.",
      renderVisual: () => (
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-4 text-white overflow-hidden shadow-inner border border-emerald-800/40 my-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <Play className="w-3 h-3 fill-emerald-400" />
              <span>ON-DEMAND LMS</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              Lifetime Access
            </span>
          </div>

          <div className="py-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white truncate">Organic Chemistry Mastery</span>
              <span className="text-emerald-400 font-bold shrink-0">82%</span>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 w-[82%] rounded-full" />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-300">
              <span>14 Lessons • 8 Workbooks</span>
              <span className="text-emerald-300 flex items-center gap-0.5 font-bold">
                <Award className="w-3 h-3" /> Certificate
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-200 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> 24/7 Self-Paced
            </span>
            <span className="text-white font-bold">Auto-Graded</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="models" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Flexible Learning Models
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose how you want to learn.
          </h2>
          <p className="text-base text-slate-600">
            EduConnect keeps each learning model distinct so students and teachers get the optimal experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {models.map((model) => {
            const Icon = model.icon;
            const isHovered = hoveredModel === model.id;

            return (
              <GlassCard
                key={model.id}
                glowColor={model.glow}
                onMouseEnter={() => setHoveredModel(model.id)}
                onMouseLeave={() => setHoveredModel(null)}
                className="group relative cursor-pointer flex flex-col justify-between h-full border-2 border-white/80 hover:border-blue-300 transition-all p-5 sm:p-7 shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-white shadow-md text-blue-600 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                    <GlassBadge variant={model.badgeVariant}>{model.badge}</GlassBadge>
                  </div>

                  <div>
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {model.tag}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                      {model.title}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 italic mt-0.5 mb-2">{model.tagline}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{model.description}</p>
                  </div>

                  {/* Rich Visual Illustration Preview */}
                  {model.renderVisual()}
                </div>

                <div className="pt-4 border-t border-slate-100/80 mt-2">
                  <AnimatePresence mode="wait">
                    {isHovered ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2.5"
                      >
                        <p className="text-xs font-semibold text-slate-700 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
                          ⚡ {model.hoverDetails}
                        </p>
                        <GlassButton
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => onOpenAuth("STUDENT")}
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                          Explore {model.tag}
                        </GlassButton>
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors py-1">
                        <span>Explore Model</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

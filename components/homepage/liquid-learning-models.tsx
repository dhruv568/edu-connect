"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Target, Video, Play, Calendar, Users, CheckCircle2, ArrowRight } from "lucide-react";
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
                className="group relative cursor-pointer flex flex-col justify-between h-full border-2 border-white/80 hover:border-blue-300 transition-all p-5 sm:p-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="p-4 rounded-2xl bg-white shadow-md text-blue-600 group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8" />
                    </div>
                    <GlassBadge variant={model.badgeVariant}>{model.badge}</GlassBadge>
                  </div>

                  <div>
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {model.tag}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                      {model.title}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 italic mt-0.5 mb-3">{model.tagline}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{model.description}</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100/80 mt-6">
                  <AnimatePresence mode="wait">
                    {isHovered ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <p className="text-xs font-semibold text-slate-700 bg-blue-50/80 p-3 rounded-xl border border-blue-100">
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
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                        <span>Learn More</span>
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

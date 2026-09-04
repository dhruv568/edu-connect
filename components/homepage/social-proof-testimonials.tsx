"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import {
  Star,
  Quote,
  CheckCircle2,
  Trophy,
  Users,
  Award,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { UserRole } from "@/types/auth";

export interface SocialProofTestimonialsProps {
  onOpenAuth: (role: UserRole) => void;
}

export function SocialProofTestimonials({ onOpenAuth }: SocialProofTestimonialsProps) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "DEMO" | "LIVE" | "LMS">("ALL");

  const testimonials = [
    {
      id: 1,
      name: "Arjun Mehta",
      role: "12th Grade CBSE STEM",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      model: "LIVE",
      modelLabel: "Live Class Slots",
      badgeVariant: "indigo" as const,
      achievement: "Scored 98% in CBSE Board Math",
      achievementIcon: Trophy,
      rating: 5,
      tutor: "Mr. Rahul Sharma",
      quote:
        "The live interactive whiteboard made differential calculus finally make sense. In school I was always too shy to raise my hand, but here I asked 10+ questions every slot without feeling judged.",
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "NEET Medical Aspirant",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      model: "DEMO",
      modelLabel: "1-on-1 Demo Session",
      badgeVariant: "blue" as const,
      achievement: "170/180 in NEET Physics Section",
      achievementIcon: Award,
      rating: 5,
      tutor: "Sarah Jenkins, M.Sc.",
      quote:
        "Booking a 1-on-1 demo first was the best decision. Sarah analyzed my weak areas in optics and created a custom roadmap. No other coaching gave me this level of focused personal attention.",
    },
    {
      id: 3,
      name: "David Chen",
      role: "College Freshman & Coder",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      model: "LMS",
      modelLabel: "Pre-recorded LMS Course",
      badgeVariant: "emerald" as const,
      achievement: "Built 4 Full-Stack Projects",
      achievementIcon: Sparkles,
      rating: 5,
      tutor: "Elena Rostova",
      quote:
        "The pre-recorded Python & Data Structures curriculum is unmatched. Every module comes with practical downloadable workbooks and auto-graded code challenges that solidified my understanding.",
    },
    {
      id: 4,
      name: "Ananya Verma",
      role: "10th ICSE Board Topper",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      model: "LIVE",
      modelLabel: "Live Class Slots",
      badgeVariant: "indigo" as const,
      achievement: "Rank 1 in Science Olympiad",
      achievementIcon: Trophy,
      rating: 5,
      tutor: "Dr. Rahul Sharma",
      quote:
        "My grades jumped from 78% to 95% in just 4 months. EduConnect's pay-per-class model meant my parents didn't have to lock into huge annual contracts, yet the teaching was world-class.",
    },
  ];

  const filteredTestimonials =
    activeFilter === "ALL"
      ? testimonials
      : testimonials.filter((t) => t.model === activeFilter);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Proven Academic Breakthroughs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Real Students, Real Results.
          </h2>
          <p className="text-base text-slate-600">
            Discover how learners turn difficult concepts into academic strengths through verified educators and personalized learning models.
          </p>
        </div>

        {/* High-Impact Trust Numbers Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-blue-600">15,000+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Students</div>
            <p className="text-[11px] text-slate-400">Across 40+ academic subjects</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600">850+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Educators</div>
            <p className="text-[11px] text-slate-400">Multi-stage credential verified</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">98.6%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Satisfaction Rate</div>
            <p className="text-[11px] text-slate-400">Based on 12,000+ class reviews</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500">4.95 / 5.0</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Tutor Rating</div>
            <p className="text-[11px] text-slate-400">Transparent student scores</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {[
            { key: "ALL", label: "All Experiences" },
            { key: "DEMO", label: "1-on-1 Demos" },
            { key: "LIVE", label: "Live Classes" },
            { key: "LMS", label: "Recorded LMS" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeFilter === tab.key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <AnimatePresence mode="wait">
            {filteredTestimonials.map((item) => {
              const AchIcon = item.achievementIcon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard
                    glowColor="rgba(37, 99, 235, 0.15)"
                    className="p-6 sm:p-7 border-2 border-white/90 shadow-lg flex flex-col justify-between h-full space-y-6"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">{item.role}</p>
                          </div>
                        </div>
                        <GlassBadge variant={item.badgeVariant} size="sm">
                          {item.modelLabel}
                        </GlassBadge>
                      </div>

                      {/* Achievement Ribbon */}
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-bold">
                        <AchIcon className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="truncate">{item.achievement}</span>
                      </div>

                      {/* Quote */}
                      <div className="relative pt-1">
                        <Quote className="h-6 w-6 text-blue-200 absolute -top-2 -left-1 pointer-events-none opacity-40" />
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal pl-4 italic">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-slate-500 font-medium">{item.tutor}</span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* CTA Bar */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black">Experience the difference with a free demo session.</h3>
            <p className="text-xs text-blue-100">Meet your tutor, discuss your syllabus, and get a tailored study plan.</p>
          </div>
          <GlassButton
            variant="secondary"
            size="md"
            onClick={() => onOpenAuth("STUDENT")}
            rightIcon={<ArrowRight className="h-4 w-4 text-indigo-600" />}
            className="bg-white text-indigo-700 hover:bg-slate-50 shrink-0"
          >
            Find My Teacher
          </GlassButton>
        </div>
      </div>
    </section>
  );
}
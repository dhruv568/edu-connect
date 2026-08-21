"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LearningOrb } from "./learning-orb";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video,
  BookOpen,
  CalendarCheck,
  Star,
  Users,
  CheckCircle,
  Play,
} from "lucide-react";
import { UserRole } from "@/types/auth";

export interface InteractiveHeroCanvasProps {
  onOpenAuth: (role: UserRole) => void;
}

export function InteractiveHeroCanvas({ onOpenAuth }: InteractiveHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax Coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // Transform floating components with subtle opposite parallax depth
  const floatCard1X = useTransform(springX, [-0.5, 0.5], [-25, 25]);
  const floatCard1Y = useTransform(springY, [-0.5, 0.5], [-25, 25]);

  const floatCard2X = useTransform(springX, [-0.5, 0.5], [30, -30]);
  const floatCard2Y = useTransform(springY, [-0.5, 0.5], [30, -30]);

  const floatCard3X = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const floatCard3Y = useTransform(springY, [-0.5, 0.5], [20, -20]);

  const floatCard4X = useTransform(springX, [-0.5, 0.5], [22, -22]);
  const floatCard4Y = useTransform(springY, [-0.5, 0.5], [-22, 22]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] pt-32 pb-20 flex items-center justify-center overflow-hidden"
    >
      {/* Background Liquid Gradient Blobs */}
      <div className="liquid-blob-1 top-10 left-1/4" />
      <div className="liquid-blob-2 top-1/3 right-10" />
      <div className="liquid-blob-3 bottom-10 left-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Asymmetric Dynamic Composition */}
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Top Pill Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-blue-700 text-xs font-extrabold uppercase tracking-widest shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-blue-600 animate-spin" style={{ animationDuration: "8s" }} />
            <span>EduConnect Liquid Learning Canvas</span>
          </motion.div>

          {/* Distinctive Hero Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl space-y-4"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Learning, <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                but more connected.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              Meet the right teacher, join live classes, explore courses, and make learning progress visible.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => onOpenAuth("STUDENT")}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Explore Teachers
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="lg"
                onClick={() => onOpenAuth("TEACHER")}
                leftIcon={<BookOpen className="h-4 w-4 text-indigo-600" />}
              >
                Explore Courses
              </GlassButton>
            </div>
          </motion.div>

          {/* LIVING LEARNING CANVAS VISUAL AREA */}
          <div className="relative w-full max-w-5xl py-8 min-h-[460px] flex items-center justify-center">
            {/* Central Learning Orb */}
            <div className="z-10">
              <LearningOrb />
            </div>

            {/* FLOATING CARD 1: Teacher Card (Top-Left) */}
            <motion.div
              style={{ x: floatCard1X, y: floatCard1Y }}
              className="absolute -top-4 left-0 sm:left-6 z-20 w-64 hidden sm:block pointer-events-auto"
            >
              <GlassCard
                glowColor="rgba(99, 102, 241, 0.2)"
                className="p-4 space-y-3 cursor-pointer group hover:border-indigo-300"
                onClick={() => onOpenAuth("TEACHER")}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                    alt="Sarah Jenkins"
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Sarah Jenkins
                    </h4>
                    <p className="text-[11px] text-slate-500">Mathematics & STEM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-500">★★★★★ (4.95)</span>
                  <GlassBadge variant="emerald" size="sm">
                    Verified
                  </GlassBadge>
                </div>
              </GlassCard>
            </motion.div>

            {/* FLOATING CARD 2: Live Class Card (Top-Right) */}
            <motion.div
              style={{ x: floatCard2X, y: floatCard2Y }}
              className="absolute top-2 right-0 sm:right-6 z-20 w-64 hidden sm:block pointer-events-auto"
            >
              <GlassCard
                glowColor="rgba(37, 99, 235, 0.2)"
                className="p-4 space-y-3 cursor-pointer group hover:border-blue-300"
                onClick={() => onOpenAuth("STUDENT")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600" /> LIVE NOW
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">● 24 Students</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Advanced Calculus</h4>
                  <p className="text-[11px] text-slate-500">Mr. Rahul • Room 4B</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Join Class</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </GlassCard>
            </motion.div>

            {/* FLOATING CARD 3: Course Card (Bottom-Left) */}
            <motion.div
              style={{ x: floatCard3X, y: floatCard3Y }}
              className="absolute bottom-2 left-2 sm:left-12 z-20 w-60 hidden md:block pointer-events-auto"
            >
              <GlassCard
                glowColor="rgba(16, 185, 129, 0.2)"
                className="p-4 space-y-2.5 cursor-pointer group hover:border-emerald-300"
                onClick={() => onOpenAuth("STUDENT")}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700">
                  <span>COURSE</span>
                  <span>68% Complete</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Physics Olympiad Mastery</h4>
                <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[68%]" />
                </div>
              </GlassCard>
            </motion.div>

            {/* FLOATING CARD 4: Calendar Today (Bottom-Right) */}
            <motion.div
              style={{ x: floatCard4X, y: floatCard4Y }}
              className="absolute bottom-4 right-2 sm:right-12 z-20 w-60 hidden md:block pointer-events-auto"
            >
              <GlassCard
                glowColor="rgba(245, 158, 11, 0.2)"
                className="p-4 space-y-2 cursor-pointer group hover:border-amber-300"
                onClick={() => onOpenAuth("STUDENT")}
              >
                <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <CalendarCheck className="h-3.5 w-3.5" /> TODAY&apos;S SCHEDULE
                  </div>
                </div>
                <div className="text-[11px] font-bold text-slate-800 flex justify-between">
                  <span>5:00 PM</span>
                  <span className="text-blue-600">Mathematics</span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 flex justify-between">
                  <span>7:30 PM</span>
                  <span className="text-indigo-600">Physics</span>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

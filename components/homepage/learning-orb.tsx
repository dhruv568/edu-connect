"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Star, Pencil, Play, Sparkles } from "lucide-react";

export function LearningOrb() {
  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center pointer-events-none select-none">
      {/* Outer Ambient Glowing Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl animate-pulse-glow" />

      {/* Main Glass Sphere Body */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-white/60 backdrop-blur-2xl bg-gradient-to-tr from-white/40 via-blue-50/20 to-purple-50/30 shadow-[0_20px_60px_rgba(37,99,235,0.25),inset_0_2px_10px_rgba(255,255,255,0.9)] flex items-center justify-center overflow-hidden"
      >
        {/* Core Internal Liquid Energy Glow */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 opacity-60 blur-xl animate-pulse-subtle" />

        {/* Floating Internal Icons inside the Orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="p-4 rounded-3xl bg-white/80 border border-white backdrop-blur-md shadow-lg text-blue-600"
          >
            <GraduationCap className="h-10 w-10 sm:h-14 sm:h-14" />
          </motion.div>
        </div>

        {/* Orbital Ring 1 */}
        <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-spin" style={{ animationDuration: "18s" }} />

        {/* Orbital Ring 2 */}
        <div className="absolute inset-8 rounded-full border border-indigo-400/25 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }} />
      </motion.div>

      {/* Orbiting Satellite Elements */}
      {/* 1. Book Top Left */}
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-4 p-3 rounded-2xl glass-surface text-indigo-600 shadow-xl border border-white/80"
      >
        <BookOpen className="h-6 w-6" />
      </motion.div>

      {/* 2. Star Top Right */}
      <motion.div
        animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 right-6 p-3 rounded-2xl glass-surface text-amber-500 shadow-xl border border-white/80"
      >
        <Star className="h-6 w-6 fill-amber-400" />
      </motion.div>

      {/* 3. Pencil Bottom Left */}
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-8 p-3 rounded-2xl glass-surface text-emerald-600 shadow-xl border border-white/80"
      >
        <Pencil className="h-6 w-6" />
      </motion.div>

      {/* 4. Play Button Bottom Right */}
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-4 p-3 rounded-2xl glass-surface text-purple-600 shadow-xl border border-white/80"
      >
        <Play className="h-6 w-6 fill-purple-600" />
      </motion.div>
    </div>
  );
}

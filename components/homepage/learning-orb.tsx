"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Star, Pencil, Play, Sparkles } from "lucide-react";

export function LearningOrb() {
  return (
    <div className="relative w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center pointer-events-none select-none">
      {/* Outer Ambient Glowing Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-2xl sm:blur-3xl animate-pulse-glow" />

      {/* Main Glass Sphere Body */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="relative w-40 h-40 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full border border-white/60 backdrop-blur-2xl bg-gradient-to-tr from-white/40 via-blue-50/20 to-purple-50/30 shadow-[0_15px_40px_rgba(37,99,235,0.2),inset_0_2px_10px_rgba(255,255,255,0.9)] flex items-center justify-center overflow-hidden"
      >
        {/* Core Internal Liquid Energy Glow */}
        <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 opacity-60 blur-lg sm:blur-xl animate-pulse-subtle" />

        {/* Floating Internal Icons inside the Orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/80 border border-white backdrop-blur-md shadow-lg text-blue-600"
          >
            <GraduationCap className="h-8 w-8 sm:h-12 sm:w-12" />
          </motion.div>
        </div>

        {/* Orbital Ring 1 */}
        <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-spin" style={{ animationDuration: "18s" }} />

        {/* Orbital Ring 2 */}
        <div className="absolute inset-6 sm:inset-8 rounded-full border border-indigo-400/25 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }} />
      </motion.div>

      {/* Orbiting Satellite Elements */}
      {/* 1. Book Top Left */}
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1 left-0 sm:top-2 sm:left-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl glass-surface text-indigo-600 shadow-md sm:shadow-xl border border-white/80"
      >
        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </motion.div>

      {/* 2. Star Top Right */}
      <motion.div
        animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1 -right-1 sm:top-4 sm:right-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl glass-surface text-amber-500 shadow-md sm:shadow-xl border border-white/80"
      >
        <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 fill-amber-400" />
      </motion.div>

      {/* 3. Pencil Bottom Left */}
      <motion.div
        animate={{ y: [0, -6, 0], x: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1 -left-1 sm:bottom-4 sm:left-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl glass-surface text-emerald-600 shadow-md sm:shadow-xl border border-white/80"
      >
        <Pencil className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </motion.div>

      {/* 4. Play Button Bottom Right */}
      <motion.div
        animate={{ y: [0, 8, 0], x: [0, 6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-1 right-0 sm:bottom-4 sm:right-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl glass-surface text-purple-600 shadow-md sm:shadow-xl border border-white/80"
      >
        <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 fill-purple-600" />
      </motion.div>
    </div>
  );
}

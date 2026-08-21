"use client";

import React from "react";
import { BookOpen, GraduationCap, Star, Pencil, Award, Sparkles } from "lucide-react";

export function FloatingLearningElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating Star Top-Left */}
      <div className="absolute top-12 left-10 text-amber-400 opacity-60 animate-float-slow">
        <Star className="h-8 w-8 fill-amber-300" />
      </div>

      {/* Floating Graduation Cap Top-Right */}
      <div className="absolute top-20 right-16 text-indigo-500 opacity-50 animate-float" style={{ animationDelay: "1s" }}>
        <GraduationCap className="h-10 w-10" />
      </div>

      {/* Floating Book Mid-Left */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 text-blue-500 opacity-40 animate-float-slow" style={{ animationDelay: "2s" }}>
        <BookOpen className="h-9 w-9" />
      </div>

      {/* Floating Pencil Bottom-Right */}
      <div className="absolute bottom-24 right-12 text-emerald-500 opacity-50 animate-float" style={{ animationDelay: "1.5s" }}>
        <Pencil className="h-8 w-8" />
      </div>

      {/* Floating Award Bottom-Left */}
      <div className="absolute bottom-16 left-20 text-purple-500 opacity-40 animate-float-slow" style={{ animationDelay: "2.5s" }}>
        <Award className="h-9 w-9" />
      </div>

      {/* Floating Sparkles Top-Center */}
      <div className="absolute top-16 left-1/3 text-blue-400 opacity-60 animate-pulse-subtle">
        <Sparkles className="h-6 w-6" />
      </div>

      {/* Decorative Dot Clusters */}
      <div className="absolute top-1/3 right-1/4 flex gap-1.5 opacity-30">
        <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        <div className="w-2 h-2 rounded-full bg-indigo-600" />
        <div className="w-2 h-2 rounded-full bg-emerald-600" />
      </div>
    </div>
  );
}

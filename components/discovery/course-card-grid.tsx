"use client";

import React from "react";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { PlayCircle, Clock, BookOpen, Star, ArrowRight } from "lucide-react";
import { UserRole } from "@/types/auth";
import { formatCurrency } from "@/lib/currency";

export interface CourseCardGridProps {
  courses: any[];
  loading?: boolean;
  onOpenAuth: (role: UserRole) => void;
}

export function CourseCardGrid({ courses, loading = false, onOpenAuth }: CourseCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-72 bg-white rounded-3xl animate-pulse border border-slate-200" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
        <h3 className="text-lg font-bold text-slate-900">No courses found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Try broadening your search query or selecting &ldquo;All Subjects&rdquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map((c) => (
        <GlassCard
          key={c.id}
          glowColor="rgba(16, 185, 129, 0.15)"
          className="group cursor-pointer flex flex-col justify-between h-full border-2 border-white/90 hover:border-emerald-300 transition-all p-6 space-y-4"
        >
          <div className="space-y-3">
            <div className="relative h-40 rounded-2xl overflow-hidden mb-3">
              <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3 bg-white/90 rounded-full text-emerald-600 shadow-lg">
                  <PlayCircle className="h-8 w-8" />
                </div>
              </div>
              <div className="absolute top-3 left-3">
                <GlassBadge variant="emerald" size="sm">{c.subject}</GlassBadge>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                {c.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description}</p>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold text-slate-600">
              <span>{c.lessonCount} Lessons</span>
              <span>{c.durationHours} Hours</span>
              <span className="text-amber-500">★ {c.rating} ({c.reviewCount})</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-lg font-black text-slate-900">{c.price === 0 ? "FREE" : formatCurrency(c.price)}</div>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => onOpenAuth("STUDENT")}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Enroll Course
            </GlassButton>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

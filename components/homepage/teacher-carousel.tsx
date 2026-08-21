"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Star, ShieldCheck, Calendar, ArrowRight, Award } from "lucide-react";
import { UserRole } from "@/types/auth";

export interface TeacherCarouselProps {
  onOpenAuth: (role: UserRole) => void;
}

export function TeacherCarousel({ onOpenAuth }: TeacherCarouselProps) {
  const [activeTeacher, setActiveTeacher] = useState<number | null>(null);

  const teachers = [
    {
      id: 1,
      name: "Sarah Jenkins",
      subject: "Mathematics & Physics",
      headline: "Senior STEM Educator & Olympiad Coach",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
      reviewsCount: 38,
      experience: "8+ Years",
      rate: "$45.00",
      status: "VERIFIED",
    },
    {
      id: 2,
      name: "Dr. Rahul Sharma",
      subject: "Chemistry & Biology",
      headline: "Ex-University Lecturer & Medical Prep Expert",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.98,
      reviewsCount: 52,
      experience: "12+ Years",
      rate: "$55.00",
      status: "VERIFIED",
    },
    {
      id: 3,
      name: "Elena Rostova",
      subject: "Computer Science & AI",
      headline: "Software Engineer & Youth Coding Specialist",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      rating: 4.92,
      reviewsCount: 29,
      experience: "6+ Years",
      rate: "$40.00",
      status: "VERIFIED",
    },
  ];

  return (
    <section id="teachers" className="py-24 bg-white/60 backdrop-blur-md border-y border-white/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">
            Verified Educators
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Find someone who makes it click.
          </h2>
          <p className="text-base text-slate-600">
            Browse top-rated tutors, check real student reviews, and book an instant demo session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teachers.map((t) => (
            <GlassCard
              key={t.id}
              glowColor="rgba(99, 102, 241, 0.15)"
              onMouseEnter={() => setActiveTeacher(t.id)}
              onMouseLeave={() => setActiveTeacher(null)}
              className="group cursor-pointer flex flex-col justify-between h-full border-2 border-white/90 hover:border-indigo-300 transition-all p-7"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs font-bold text-indigo-600">{t.subject}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <GlassBadge variant="emerald" size="sm" className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </GlassBadge>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {t.headline}
                </p>

                <div className="flex items-center justify-between text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="font-bold text-amber-500">★ {t.rating}</span>
                    <span className="text-slate-400 text-[10px]"> ({t.reviewsCount})</span>
                  </div>
                  <div className="font-bold text-slate-700">{t.experience}</div>
                  <div className="font-extrabold text-slate-900">{t.rate}/hr</div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <GlassButton
                  variant={activeTeacher === t.id ? "primary" : "secondary"}
                  size="sm"
                  className="w-full"
                  onClick={() => onOpenAuth("STUDENT")}
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  View Profile & Book Demo
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

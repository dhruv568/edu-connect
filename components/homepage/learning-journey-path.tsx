"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Users, Video, Award, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";

export function LearningJourneyPath() {
  const steps = [
    { num: "01", title: "DISCOVER", desc: "Search verified teachers by subject, hourly rate, and trial availability.", icon: Search, color: "text-blue-600", bg: "bg-blue-50" },
    { num: "02", title: "CONNECT", desc: "Book an introductory 1-on-1 demo session with zero commitment.", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { num: "03", title: "LEARN", desc: "Join live class slots or study structured self-paced video modules.", icon: Video, color: "text-purple-600", bg: "bg-purple-50" },
    { num: "04", title: "PROGRESS", desc: "Track learning mastery, complete quizzes, and earn certificates.", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <section className="py-24 bg-white/60 backdrop-blur-md border-y border-white/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            The EduConnect Experience
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            How EduConnect Works
          </h2>
          <p className="text-base text-slate-600">
            A continuous flowing journey built for student growth and interactive online learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
              >
                <GlassCard className="p-6 space-y-4 h-full border-2 border-white/90 hover:border-blue-300 transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${step.bg} ${step.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-black text-slate-300">{step.num}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {idx < 3 && (
                    <div className="hidden md:flex justify-end pt-2 text-slate-300">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

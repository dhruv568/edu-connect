"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Heart, ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export type RoleCardType = "teacher" | "student" | "parent";

export interface RoleCardProps {
  type: RoleCardType;
  title: string;
  tagline: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

const roleConfigs = {
  teacher: {
    icon: GraduationCap,
    badgeBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    borderColor: "hover:border-indigo-300",
    glowColor: "group-hover:bg-indigo-500/10",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700",
    badgeText: "For Educators",
  },
  student: {
    icon: BookOpen,
    badgeBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    borderColor: "hover:border-emerald-300",
    glowColor: "group-hover:bg-emerald-500/10",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700",
    badgeText: "For Learners",
  },
  parent: {
    icon: Heart,
    badgeBg: "bg-amber-100",
    iconColor: "text-amber-600",
    borderColor: "hover:border-amber-300",
    glowColor: "group-hover:bg-amber-500/10",
    buttonBg: "bg-amber-500 hover:bg-amber-600",
    badgeText: "For Parents",
  },
};

export function RoleCard({ type, title, tagline, description, onClick, className }: RoleCardProps) {
  const config = roleConfigs[type];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.25 } }}
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between h-full",
        config.borderColor,
        className
      )}
    >
      {/* Background glow */}
      <div className={cn("absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl transition-all duration-300", config.glowColor)} />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className={cn("p-4 rounded-2xl transition-transform group-hover:rotate-6 group-hover:scale-110", config.badgeBg, config.iconColor)}>
            <Icon className="h-8 w-8" />
          </div>
          <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", config.badgeBg, config.iconColor)}>
            {config.badgeText}
          </span>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
          {title}
        </h3>

        <p className="text-sm font-semibold text-blue-600 italic mb-4">
          &ldquo;{tagline}&rdquo;
        </p>

        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          {description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          Get Started as {title}
        </span>
        <div className={cn("p-2.5 rounded-xl text-white transition-all transform group-hover:translate-x-1.5", config.buttonBg)}>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}

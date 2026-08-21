"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface LearningCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badgeText?: string;
  progress?: number;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export function LearningCard({
  icon: Icon,
  title,
  description,
  badgeText,
  progress,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  className,
}: LearningCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={cn(
        "group relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer overflow-hidden",
        className
      )}
    >
      {/* Decorative corner glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />

      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3.5 rounded-2xl transition-transform group-hover:scale-110", iconBgColor, iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
        {badgeText && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {badgeText}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {description}
      </p>

      {progress !== undefined && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Progress</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

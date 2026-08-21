"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "glow";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer relative overflow-hidden backdrop-blur-md";

    const variants = {
      primary:
        "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-liquid-button border border-white/30 hover:shadow-xl hover:from-blue-700 hover:to-purple-700",
      secondary:
        "bg-white/80 text-slate-900 border border-white/90 shadow-sm hover:bg-white hover:border-blue-300 hover:shadow-md",
      ghost:
        "bg-transparent text-slate-700 hover:bg-white/50 hover:text-slate-900 border border-transparent",
      glow:
        "bg-blue-600/90 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] border border-blue-400/40 hover:bg-blue-600 hover:shadow-[0_0_35px_rgba(37,99,235,0.6)]",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs rounded-xl gap-1.5",
      md: "h-11 px-6 text-sm rounded-2xl gap-2",
      lg: "h-13 px-8 text-base rounded-2xl gap-2.5",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.03 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Subtle glass shine highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />

        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-current" /> : leftIcon}
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";

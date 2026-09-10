"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, showPasswordToggle = true, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === "password";
    const effectiveType = isPasswordType ? (showPassword ? "text" : "password") : type;
    const hasPasswordToggle = isPasswordType && showPasswordToggle;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#102A2A] uppercase tracking-wider">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#5D7373]">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={effectiveType}
            className={cn(
              "w-full h-11 px-4 text-sm rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F4B]/20 focus:border-[#0B4F4B]",
              className?.includes("bg-slate-") || className?.includes("text-white")
                ? "bg-[#073F3C] border border-[#1B6863] text-white placeholder:text-teal-200/60 dark-input-crisp"
                : "bg-white border border-[#DCE5E4] text-[#102A2A] placeholder:text-[#5D7373]",
              leftIcon && "pl-10",
              (rightIcon || hasPasswordToggle) && "pr-10",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />

          {hasPasswordToggle ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-[#5D7373] hover:text-[#102A2A] focus:outline-none transition-colors p-1 rounded-md hover:bg-[#F5F7F8]"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3.5 text-[#5D7373]">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#5D7373]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";


"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { canGoBackInternal } from "@/components/providers/navigation-history-tracker";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface BackButtonProps {
  /** Safe fallback parent route if no internal browser history exists */
  fallbackUrl: string;
  /** Contextual text label (e.g., "Back to Dashboard", "Back to Courses") */
  label?: string;
  /** Visual variant matching the page theme */
  variant?: "default" | "dark" | "ghost" | "glass" | "outline" | "link";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Optional custom CSS classes */
  className?: string;
  /** Accessible label for screen readers (defaults to label or "Go back") */
  ariaLabel?: string;
  /** Whether to show the back arrow icon (default: true) */
  showIcon?: boolean;
  /** Custom icon node if different from ArrowLeft */
  icon?: React.ReactNode;
  /** Whether to render as an icon-only square button */
  iconOnly?: boolean;
  /** Optional unsaved changes confirmation flag */
  confirmUnsavedChanges?: boolean;
  /** Message to display if unsaved changes exist */
  unsavedChangesMessage?: string;
  /** Optional click interceptor */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function BackButton({
  fallbackUrl,
  label,
  variant = "default",
  size = "sm",
  className,
  ariaLabel,
  showIcon = true,
  icon,
  iconOnly = false,
  confirmUnsavedChanges = false,
  unsavedChangesMessage = "You have unsaved changes. Are you sure you want to leave this page?",
  onClick,
}: BackButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }

    if (confirmUnsavedChanges) {
      const confirmed = window.confirm(unsavedChangesMessage);
      if (!confirmed) return;
    }

    setIsNavigating(true);

    const safeInternal = canGoBackInternal();
    if (safeInternal) {
      router.back();
    } else {
      const destination = fallbackUrl || "/";
      router.push(destination);
    }
  };

  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer group shrink-0";

  const variants = {
    default:
      "bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:border-slate-300",
    dark:
      "bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 shadow-sm",
    ghost:
      "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60",
    glass:
      "bg-white/10 hover:bg-white/20 active:bg-white/25 text-white backdrop-blur-md border border-white/20 shadow-md",
    outline:
      "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80",
    link:
      "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:underline p-0 h-auto font-semibold",
  };

  const sizeStyles = {
    sm: iconOnly ? "h-9 w-9 rounded-xl p-0" : "h-9 px-3.5 text-xs rounded-xl gap-1.5",
    md: iconOnly ? "h-11 w-11 rounded-xl p-0" : "h-11 px-4 text-sm rounded-xl gap-2",
    lg: iconOnly ? "h-13 w-13 rounded-2xl p-0" : "h-13 px-5 text-base rounded-2xl gap-2.5",
  };

  const resolvedAriaLabel = ariaLabel || label || (fallbackUrl ? `Go back to ${fallbackUrl}` : "Go back");
  const displayLabel = label || (!iconOnly ? "Back" : undefined);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isNavigating}
      aria-label={resolvedAriaLabel}
      className={cn(
        baseStyles,
        variants[variant],
        variant !== "link" && sizeStyles[size],
        className
      )}
    >
      {isNavigating ? (
        <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
      ) : showIcon ? (
        icon ? (
          <span className="shrink-0 inline-flex items-center transition-transform group-hover:-translate-x-0.5">
            {icon}
          </span>
        ) : (
          <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
        )
      ) : null}

      {displayLabel && (
        <span className={iconOnly ? "sr-only" : "truncate"}>{displayLabel}</span>
      )}
    </button>
  );
}

export default BackButton;

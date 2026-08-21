import React from "react";
import { VerificationStatus } from "@/types/auth";
import { ShieldCheck, Clock, XCircle, AlertOctagon, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: VerificationStatus | "EMAIL_VERIFIED" | "EMAIL_UNVERIFIED";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  switch (status) {
    case "VERIFIED":
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${sizeClasses[size]} ${className}`}
        >
          <ShieldCheck className={`${iconSizes[size]} text-emerald-600`} />
          VERIFIED EDUCATOR
        </span>
      );
    case "PENDING":
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs ${sizeClasses[size]} ${className}`}
        >
          <Clock className={`${iconSizes[size]} text-amber-600 animate-pulse`} />
          PENDING REVIEW
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs ${sizeClasses[size]} ${className}`}
        >
          <XCircle className={`${iconSizes[size]} text-rose-600`} />
          REJECTED / ACTION REQ.
        </span>
      );
    case "SUSPENDED":
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-slate-900 text-rose-400 border border-rose-500/30 shadow-xs ${sizeClasses[size]} ${className}`}
        >
          <AlertOctagon className={`${iconSizes[size]} text-rose-400`} />
          SUSPENDED
        </span>
      );
    case "EMAIL_VERIFIED":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses[size]} ${className}`}
        >
          <CheckCircle2 className={`${iconSizes[size]} text-blue-600`} />
          EMAIL VERIFIED
        </span>
      );
    case "EMAIL_UNVERIFIED":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses[size]} ${className}`}
        >
          <Clock className={`${iconSizes[size]} text-slate-400`} />
          EMAIL UNVERIFIED
        </span>
      );
    default:
      return null;
  }
}

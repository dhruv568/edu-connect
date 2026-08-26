"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart2, Plus, ArrowRight } from "lucide-react";

export interface EmptyAnalyticsStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyAnalyticsState({
  title = "Not enough data yet",
  description = "Start taking courses or hosting live classes to generate real-time performance analytics.",
  actionText,
  actionHref,
}: EmptyAnalyticsStateProps) {
  return (
    <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
        <BarChart2 className="h-7 w-7" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h4 className="text-base font-black text-slate-900 dark:text-slate-100">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && actionHref && (
        <div className="pt-2">
          <Link href={actionHref}>
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              {actionText}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

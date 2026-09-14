"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AdminBreadcrumb({ items, className = "" }: AdminBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 ${className}`}>
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <Link
            href="/admin"
            className="flex items-center gap-1 font-semibold text-slate-500 hover:text-[#0B4F4B] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="font-medium text-slate-500 hover:text-[#0B4F4B] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  LayoutDashboard,
  Users,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  BookOpen,
  AlertOctagon,
  Video,
  FileCheck,
  IndianRupee,
  BarChart2,
  Activity,
  Server,
  Settings,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SearchEntry {
  title: string;
  category: string;
  href: string;
  icon: any;
  keywords: string[];
  description: string;
}

const ADMIN_SEARCH_ENTRIES: SearchEntry[] = [
  // Overview
  {
    title: "Overview Dashboard",
    category: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    keywords: ["dashboard", "home", "stats", "overview", "metrics", "summary", "attention"],
    description: "Executive platform overview, priority queues, and business activity",
  },
  // People
  {
    title: "User Governance",
    category: "People",
    href: "/admin/users",
    icon: Users,
    keywords: ["users", "accounts", "learners", "students", "teachers", "educators", "suspend", "status", "roles"],
    description: "Manage learner, educator, and staff accounts and status controls",
  },
  {
    title: "Educator Roster",
    category: "People",
    href: "/admin/teachers",
    icon: GraduationCap,
    keywords: ["educator", "teachers", "roster", "faculty", "directory", "profiles", "hourly rate"],
    description: "Browse verified educator directory, subjects, and ratings",
  },
  {
    title: "Educator Verifications",
    category: "People",
    href: "/admin/verification",
    icon: ShieldCheck,
    keywords: ["verifications", "documents", "id", "degrees", "pending", "approval", "review", "teachers", "educators"],
    description: "Review pending educator credential submissions and ID proofs",
  },
  {
    title: "Staff Management",
    category: "People",
    href: "/admin/staff",
    icon: UserCheck,
    keywords: ["staff", "team", "invitations", "admin members", "assign role"],
    description: "Invite staff, assign custom roles, and revoke administrative access",
  },
  {
    title: "Role Management",
    category: "People",
    href: "/admin/roles",
    icon: ShieldAlert,
    keywords: ["roles", "permissions", "rbac", "access control", "privileges"],
    description: "Configure dynamic roles and granular permission sets",
  },
  // Content
  {
    title: "Course Moderation",
    category: "Content",
    href: "/admin/courses",
    icon: BookOpen,
    keywords: ["courses", "moderation", "review", "curriculum", "publishing", "catalog", "drafts"],
    description: "Review and publish pre-recorded course submissions",
  },
  {
    title: "Content & User Reports",
    category: "Content",
    href: "/admin/reports",
    icon: AlertOctagon,
    keywords: ["reports", "violations", "flags", "abuse", "complaints", "moderation"],
    description: "Investigate reported content and behavioral violations",
  },
  // Live
  {
    title: "Live Classes",
    category: "Live",
    href: "/admin/live-classes",
    icon: Video,
    keywords: ["live", "classes", "classroom", "livekit", "scheduled", "sessions", "video slots"],
    description: "Monitor interactive video classroom slots and live sessions",
  },
  // Finance
  {
    title: "Financial Ledger & Payouts",
    category: "Finance",
    href: "/admin/payments",
    icon: FileCheck,
    keywords: ["finance", "ledger", "payouts", "revenue", "commission", "cashfree", "reconciliation"],
    description: "Track platform revenue, teacher payouts, and commission fee ledger",
  },
  {
    title: "Refund Management",
    category: "Finance",
    href: "/admin/refunds",
    icon: IndianRupee,
    keywords: ["refunds", "returns", "reversals", "chargebacks", "claims", "disputes"],
    description: "Review, approve, or reject learner refund requests",
  },
  // Insights
  {
    title: "Platform Analytics",
    category: "Insights",
    href: "/admin/analytics",
    icon: BarChart2,
    keywords: ["analytics", "growth", "trends", "charts", "metrics", "export", "reports"],
    description: "Analyze enrollment trajectories, user growth, and revenue trends",
  },
  // Security & Operations
  {
    title: "Audit & Security Logs",
    category: "Security & Operations",
    href: "/admin/activity",
    icon: Activity,
    keywords: ["audit", "logs", "security", "activity", "compliance", "events", "history"],
    description: "Immutable trail of administrative, financial, and authentication events",
  },
  {
    title: "System Health",
    category: "Security & Operations",
    href: "/admin/system-health",
    icon: Server,
    keywords: ["health", "system", "database", "livekit", "mux", "cashfree", "status", "uptime"],
    description: "Service operational statuses, latency, and database diagnostics",
  },
  // Settings
  {
    title: "Platform Settings",
    category: "Settings",
    href: "/admin/settings",
    icon: Settings,
    keywords: ["settings", "configuration", "commission rate", "taxonomies", "branding"],
    description: "Global platform policies, commission rates, and category taxonomies",
  },
];

export interface AdminSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSearchDialog({ isOpen, onClose }: AdminSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredEntries = ADMIN_SEARCH_ENTRIES.filter((entry) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredEntries.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredEntries.length) % (filteredEntries.length || 1));
    } else if (e.key === "Enter" && filteredEntries[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredEntries[selectedIndex].href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="h-5 w-5 text-teal-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search admin modules, actions, or destinations..."
            className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-xs font-semibold">No admin destinations match &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-slate-400 mt-1">Try searching for &ldquo;verification&rdquo;, &ldquo;refunds&rdquo;, or &ldquo;users&rdquo;.</p>
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const Icon = entry.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={entry.href}
                  onClick={() => handleSelect(entry.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#0B4F4B] text-white shadow-sm"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-white/10 text-[#F2C14E]"
                          : "bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">{entry.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {entry.category}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] truncate ${
                          isSelected ? "text-teal-100" : "text-slate-400"
                        }`}
                      >
                        {entry.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isSelected ? "translate-x-1 text-[#F2C14E]" : "text-slate-300 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigate with</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">↓</kbd>
            <span>and</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Enter</kbd>
          </div>
          <span className="flex items-center gap-1 text-[#0B4F4B] font-bold">
            <Sparkles className="h-3 w-3" /> Quick Access
          </span>
        </div>
      </div>
    </div>
  );
}

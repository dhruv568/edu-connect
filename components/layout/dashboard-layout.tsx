"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Video,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ShieldCheck,
  Award,
  FileCheck,
  UserCheck,
  GraduationCap as TeacherIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import { useToast } from "@/components/ui/toast";

export interface DashboardLayoutProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function DashboardLayout({ role, userName, userEmail, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const roleColors = {
    ADMIN: "admin",
    TEACHER: "teacher",
    STUDENT: "student",
  } as const;

  const navItems = {
    ADMIN: [
      { label: "Overview Dashboard", icon: LayoutDashboard, href: "/admin" },
      { label: "Verification Queue", icon: ShieldCheck, href: "/admin/verification" },
      { label: "Teacher Management", icon: TeacherIcon, href: "/admin/teachers" },
      { label: "User Governance", icon: Users, href: "/admin/users" },
    ],
    TEACHER: [
      { label: "Teacher Dashboard", icon: LayoutDashboard, href: "/teacher" },
      { label: "Profile Onboarding", icon: FileCheck, href: "/teacher/onboarding" },
      { label: "Verification Status", icon: ShieldCheck, href: "/teacher/verification" },
      { label: "Live Class Slots", icon: Video, href: "#" },
      { label: "Courses & Content", icon: BookOpen, href: "#" },
    ],
    STUDENT: [
      { label: "Student Hub", icon: LayoutDashboard, href: "/student" },
      { label: "Find Teachers", icon: TeacherIcon, href: "/find-teachers" },
      { label: "My Live Classes", icon: Video, href: "#" },
      { label: "Enrolled Courses", icon: BookOpen, href: "#" },
    ],
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Logged out", "You have been signed out.", "info");
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Backdrop & Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">EDUCONNECT</h1>
              <Badge variant={roleColors[role] || "student"} size="sm">
                {role} PORTAL
              </Badge>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {(navItems[role] || []).map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/teacher" && pathname.startsWith(item.href));
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search portal..."
                className="w-full h-9 pl-9 pr-4 bg-slate-100 border-none rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm uppercase">
                {userName ? userName.charAt(0) : "U"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900">{userName || "User"}</div>
                <div className="text-[10px] text-slate-500">{userEmail}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

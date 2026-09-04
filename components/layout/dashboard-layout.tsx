"use client";

import React, { useState, useEffect } from "react";
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
  IndianRupee,
  AlertOctagon,
  BarChart2,
  Activity,
  Server,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import { useToast } from "@/components/ui/toast";
import { NotificationPopover } from "@/components/layout/notification-popover";
import { PermissionProvider } from "@/components/shared/permission-guard";

export interface DashboardLayoutProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
  children: React.ReactNode;
}

export function DashboardLayout({ role, userName, userEmail, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const [currentUserName, setCurrentUserName] = useState<string>(userName || "");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(userEmail || "");
  const [currentRoleTitle, setCurrentRoleTitle] = useState<string>(role === "ADMIN" ? "SUPER ADMIN" : role === "STAFF" ? "STAFF" : role);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dynamicNav, setDynamicNav] = useState<any[] | null>(null);

  useEffect(() => {
    if (userName && userName !== "User" && userName !== "Loading...") {
      setCurrentUserName(userName);
    }
    if (userEmail && userEmail !== "..." && userEmail !== "loading...") {
      setCurrentUserEmail(userEmail);
    }

    // Always fetch auth info to resolve role name, avatar, and dynamic navigation for staff/admin
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.user) {
          const u = json.data.user;
          const resolvedName =
            u.name ||
            [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
            (u.email ? u.email.split("@")[0] : "");

          if (resolvedName) {
            setCurrentUserName(resolvedName);
          }
          if (u.email) {
            setCurrentUserEmail(u.email);
          }
          if (u.avatarUrl) {
            setAvatarUrl(u.avatarUrl);
          }
          if (u.roleName) {
            setCurrentRoleTitle(u.roleName.toUpperCase());
          }
          if (Array.isArray(u.navigation) && u.navigation.length > 0) {
            setDynamicNav(u.navigation);
          }
        }
      })
      .catch(() => {});
  }, [userName, userEmail]);

  const roleColors: Record<string, "admin" | "teacher" | "student"> = {
    ADMIN: "admin",
    STAFF: "admin",
    TEACHER: "teacher",
    STUDENT: "student",
  };

  const iconMap: Record<string, any> = {
    LayoutDashboard,
    Users,
    GraduationCap,
    TeacherIcon,
    ShieldCheck,
    BookOpen,
    Video,
    FileCheck,
    IndianRupee,
    AlertOctagon,
    BarChart2,
    Activity,
    Server,
    ShieldAlert,
    UserCheck,
    Settings,
  };

  const staticNavItems = {
    ADMIN: [
      { label: "Overview Dashboard", icon: LayoutDashboard, href: "/admin" },
      { label: "User Governance", icon: Users, href: "/admin/users" },
      { label: "Teacher Verifications", icon: ShieldCheck, href: "/admin/verification" },
      { label: "Teacher Roster", icon: TeacherIcon, href: "/admin/teachers" },
      { label: "Course Moderation", icon: BookOpen, href: "/admin/courses" },
      { label: "Live Classes", icon: Video, href: "/admin/live-classes" },
      { label: "Payment Ledger", icon: FileCheck, href: "/admin/payments" },
      { label: "Refund Management", icon: FileCheck, href: "/admin/refunds" },
      { label: "Report Moderation", icon: ShieldCheck, href: "/admin/reports" },
      { label: "Platform Analytics", icon: BarChart2, href: "/admin/analytics" },
      { label: "Activity Audit Logs", icon: FileCheck, href: "/admin/activity" },
      { label: "Role Management", icon: ShieldAlert, href: "/admin/roles" },
      { label: "Staff Management", icon: UserCheck, href: "/admin/staff" },
      { label: "Platform Settings", icon: Settings, href: "/admin/settings" },
      { label: "System Health", icon: Settings, href: "/admin/system-health" },
    ],
    STAFF: [
      { label: "Staff Dashboard", icon: LayoutDashboard, href: "/staff/dashboard" },
    ],
    TEACHER: [
      { label: "Teacher Dashboard", icon: LayoutDashboard, href: "/teacher" },
      { label: "Profile Onboarding", icon: FileCheck, href: "/teacher/onboarding" },
      { label: "Verification Status", icon: ShieldCheck, href: "/teacher/verification" },
      { label: "Live Class Slots", icon: Video, href: "/teacher/live-classes" },
      { label: "Courses & Content", icon: BookOpen, href: "/teacher/courses" },
    ],
    STUDENT: [
      { label: "Student Hub", icon: LayoutDashboard, href: "/student" },
      { label: "Find Teachers", icon: TeacherIcon, href: "/student/teachers" },
      { label: "My Live Classes", icon: Video, href: "/student/live-classes" },
      { label: "Enrolled Courses", icon: BookOpen, href: "/student/courses" },
    ],
  };

  // Compile active navigation
  let activeNav: Array<{ label: string; icon: any; href: string }> = [];
  if ((role === "ADMIN" || role === "STAFF") && dynamicNav) {
    activeNav = dynamicNav.map((item) => ({
      label: item.label,
      icon: iconMap[item.icon] || LayoutDashboard,
      href: role === "STAFF" && item.href === "/admin" ? "/staff/dashboard" : item.href,
    }));
  } else {
    activeNav = staticNavItems[role] || [];
  }

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
    <PermissionProvider>
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
                {currentRoleTitle}
              </Badge>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {activeNav.map((item, idx) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/staff/dashboard" &&
                item.href !== "/teacher" &&
                item.href !== "/student" &&
                pathname.startsWith(item.href));
            const IconComponent = item.icon || LayoutDashboard;
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
                <IconComponent className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
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
            <NotificationPopover />

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={currentUserName || "User"}
                  className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm uppercase">
                  {currentUserName ? currentUserName.trim().charAt(0) : "U"}
                </div>
              )}
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900">
                  {currentUserName || "User"}
                </div>
                {currentUserEmail && (
                  <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                    {currentUserEmail}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
    </PermissionProvider>
  );
}

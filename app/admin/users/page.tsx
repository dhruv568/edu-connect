"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlassButton } from "@/components/glass/glass-button";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCheck,
  UserX,
  ShieldAlert,
  Eye,
  X,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // User detail modal & action state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const tabs = [
    { id: "all", label: "All Users", role: "ALL", status: "ALL", verification: "ALL" },
    { id: "learners", label: "Learners", role: "STUDENT", status: "ALL", verification: "ALL" },
    { id: "educators", label: "Educators", role: "TEACHER", status: "ALL", verification: "ALL" },
    { id: "staff", label: "Staff & Admins", role: "STAFF", status: "ALL", verification: "ALL" },
    { id: "pending", label: "Pending Verification", role: "ALL", status: "ALL", verification: "PENDING" },
    { id: "suspended", label: "Suspended / Restricted", role: "ALL", status: "SUSPENDED", verification: "ALL" },
  ];

  const handleTabChange = (t: typeof tabs[0]) => {
    setActiveTab(t.id);
    setRoleFilter(t.role);
    setStatusFilter(t.status);
    setVerificationFilter(t.verification);
    setPage(1);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, verificationFilter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter,
        page: String(page),
        limit: "10",
      });

      if (verificationFilter !== "ALL") {
        query.set("verificationStatus", verificationFilter);
      }

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const json = await res.json();

      if (json.data) {
        setUsers(json.data.users || []);
        setTotalPages(json.data.pagination?.totalPages || 1);
        setTotalCount(json.data.pagination?.total || json.data.pagination?.totalCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const openUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const json = await res.json();
      if (json.data) {
        setSelectedUser(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateUserStatus = async (targetStatus: "ACTIVE" | "SUSPENDED" | "DEACTIVATED") => {
    if (!selectedUser) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus, reason: actionReason }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSelectedUser((prev: any) => (prev ? { ...prev, status: targetStatus } : null));
        setActionReason("");
        fetchUsers();
      } else {
        alert(json.error?.message || "Failed to update user status.");
      }
    } catch (err) {
      console.error("Error updating user status:", err);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="educonnects.com@gmail.com">
      <div className="space-y-6 pb-16">
        {/* Breadcrumb & Header */}
        <div>
          <AdminBreadcrumb
            items={[{ label: "People" }, { label: "User Governance" }]}
            className="mb-3"
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  User Governance & Directory
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                  {totalCount} Accounts
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">
                Centralized administration for learner, educator, and staff accounts with safe status management.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#0B4F4B] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full h-10 pl-10 pr-4 bg-slate-100 border-none rounded-2xl text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-[#0B4F4B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="ALL">ALL ROLES</option>
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
                <option value="TEACHER">EDUCATOR</option>
                <option value="STUDENT">LEARNER</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">ALL ACCOUNT STATUSES</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="DEACTIVATED">DEACTIVATED</option>
            </select>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-0 border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Email Status</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 text-[#0B4F4B] animate-spin mx-auto mb-2" />
                      Loading user database...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const displayRole =
                      u.role === "TEACHER"
                        ? "EDUCATOR"
                        : u.role === "STUDENT"
                        ? "LEARNER"
                        : u.role;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0B4F4B] text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0 uppercase">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">{u.name}</div>
                              <div className="text-[11px] text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                            {displayRole}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={u.status || "ACTIVE"} size="sm" />
                        </td>
                        <td className="p-4">
                          <StatusBadge status={u.emailVerified ? "EMAIL_VERIFIED" : "EMAIL_UNVERIFIED"} size="sm" />
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openUserDetails(u.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-[11px] font-extrabold hover:bg-teal-100 transition-colors border border-teal-200 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing Page <span className="font-bold text-slate-900">{page}</span> of{" "}
              <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount} total results)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email} • ID: {selectedUser.id}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Role & Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-extrabold text-slate-900">
                      {selectedUser.role === "TEACHER"
                        ? "EDUCATOR"
                        : selectedUser.role === "STUDENT"
                        ? "LEARNER"
                        : selectedUser.role}
                    </span>
                    <StatusBadge status={selectedUser.status} size="sm" />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Email Verification</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedUser.emailVerified ? "EMAIL_VERIFIED" : "EMAIL_UNVERIFIED"} size="sm" />
                  </div>
                </div>
              </div>

              {selectedUser.teacherProfile && (
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs space-y-2">
                  <h4 className="font-extrabold text-teal-900">Educator Profile</h4>
                  <p className="text-slate-700">{selectedUser.teacherProfile.headline || "No headline set"}</p>
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>Subjects: {selectedUser.teacherProfile.subjects || "N/A"}</span>
                    <span>Experience: {selectedUser.teacherProfile.experienceYears} Years</span>
                    <span>Verification: <StatusBadge status={selectedUser.teacherProfile.verificationStatus} size="sm" /></span>
                  </div>
                </div>
              )}

              {/* Status Action Form */}
              {selectedUser.role !== "ADMIN" && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-700">Administrative Account Actions</h4>
                  <input
                    type="text"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Reason for suspension or status change..."
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0B4F4B]"
                  />
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedUser.status !== "ACTIVE" && (
                      <button
                        disabled={submittingAction}
                        onClick={() => updateUserStatus("ACTIVE")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Reactivate / Restore User</span>
                      </button>
                    )}

                    {selectedUser.status !== "SUSPENDED" && (
                      <button
                        disabled={submittingAction}
                        onClick={() => updateUserStatus("SUSPENDED")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        <span>Suspend User</span>
                      </button>
                    )}

                    {selectedUser.status !== "DEACTIVATED" && (
                      <button
                        disabled={submittingAction}
                        onClick={() => updateUserStatus("DEACTIVATED")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <UserX className="h-4 w-4" />
                        <span>Deactivate User</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

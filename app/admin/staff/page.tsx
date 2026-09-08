"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { BackButton } from "@/components/ui/back-button";
import {
  UserCheck,
  UserPlus,
  Mail,
  Shield,
  Copy,
  Check,
  RotateCw,
  Ban,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Send,
  Calendar,
} from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  role: string;
  roleId: string | null;
  roleName: string;
  status: string;
  firstName: string;
  lastName: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
}

interface StaffInvitation {
  id: string;
  email: string;
  fullName: string | null;
  roleId: string;
  roleName: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  invitedBy: string;
}

interface RoleOption {
  id: string;
  name: string;
  status: string;
}

export default function AdminStaffPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"roster" | "invitations">("roster");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccessInfo, setInviteSuccessInfo] = useState<{ email: string; roleName: string } | null>(null);

  // Change Role Modal
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [newRoleId, setNewRoleId] = useState("");
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    fetchStaffData();
    fetchRoles();
  }, []);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const json = await res.json();
      if (json.data?.staff) setStaff(json.data.staff);
      if (json.data?.invitations) setInvitations(json.data.invitations);
    } catch (err: any) {
      showToast("Error", "Failed to load staff roster.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const json = await res.json();
      if (json.data?.roles) {
        const activeRoles = json.data.roles.filter((r: any) => r.status === "ACTIVE");
        setRoles(activeRoles);
        if (activeRoles.length > 0 && !inviteRoleId) {
          setInviteRoleId(activeRoles[0].id);
        }
      }
    } catch {}
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteRoleId) {
      showToast("Validation Error", "Please fill in email and select a role.", "error");
      return;
    }

    setInviting(true);
    try {
      const res = await fetch("/api/admin/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          fullName: inviteFullName.trim() || undefined,
          roleId: inviteRoleId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Unable to send invitation email. Please try again.");
      }

      const assignedRole = roles.find((r) => r.id === inviteRoleId)?.name || "Staff Member";
      setInviteSuccessInfo({
        email: inviteEmail.trim(),
        roleName: assignedRole,
      });

      showToast("Invitation Sent", `Invitation email sent successfully to ${inviteEmail.trim()}.`, "success");
      fetchStaffData();
    } catch (err: any) {
      showToast("Invitation Failed", err.message || "Unable to send invitation email. Please try again.", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleCloseInviteModal = () => {
    setInviteModalOpen(false);
    setInviteSuccessInfo(null);
    setInviteEmail("");
    setInviteFullName("");
  };

  const handleResendInvite = async (invitationId: string) => {
    try {
      const res = await fetch("/api/admin/staff/invite/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to send invitation email. Please try again.");

      showToast("Invitation Resent", "Staff invitation email has been dispatched again.", "success");
      fetchStaffData();
    } catch (err: any) {
      showToast("Error", err.message || "Unable to send invitation email. Please try again.", "error");
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this staff invitation?")) return;

    try {
      const res = await fetch("/api/admin/staff/invite/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to cancel invitation.");

      showToast("Invitation Cancelled", "The invitation has been cancelled.", "info");
      fetchStaffData();
    } catch (err: any) {
      showToast("Error", err.message, "error");
    }
  };

  const handleToggleStaffStatus = async (staffMember: StaffMember) => {
    const newStatus = staffMember.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    const actionLabel = newStatus === "ACTIVE" ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${actionLabel} ${staffMember.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/staff/${staffMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Failed to ${actionLabel} staff member.`);

      showToast("Status Updated", `Staff member is now ${newStatus}.`, "success");
      fetchStaffData();
    } catch (err: any) {
      showToast("Error", err.message, "error");
    }
  };

  const handleOpenChangeRole = (member: StaffMember) => {
    setSelectedStaff(member);
    setNewRoleId(member.roleId || (roles[0]?.id || ""));
    setChangeRoleModalOpen(true);
  };

  const handleSaveChangedRole = async () => {
    if (!selectedStaff || !newRoleId) return;

    setChangingRole(true);
    try {
      const res = await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: newRoleId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reassign role.");

      showToast("Role Reassigned", `${selectedStaff.name}'s role was updated.`, "success");
      setChangeRoleModalOpen(false);
      fetchStaffData();
    } catch (err: any) {
      showToast("Error", err.message, "error");
    } finally {
      setChangingRole(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator">
      <div className="space-y-8 pb-16">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <BackButton
              fallbackUrl="/admin"
              label="Back to Dashboard"
              variant="default"
              className="mb-3"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Staff Operations & Roster
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                Team Governance
              </span>
            </div>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              Invite team members, assign dynamic roles, manage privileges, and oversee platform operators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => {
                setInviteEmail("");
                setInviteFullName("");
                setInviteModalOpen(true);
              }}
            >
              Invite Staff Member
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("roster")}
            className={`pb-3 text-sm font-bold transition relative ${
              activeTab === "roster"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Active Staff Roster ({staff.length})
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={`pb-3 text-sm font-bold transition relative ${
              activeTab === "invitations"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Pending & Sent Invitations ({invitations.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading staff records...</p>
          </div>
        ) : activeTab === "roster" ? (
          /* Staff Roster Tab */
          staff.length === 0 ? (
            <Card className="p-12 text-center space-y-3 border-dashed">
              <UserCheck className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Staff Members Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Invite your first staff member to delegate administration, moderation, or finance.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setInviteModalOpen(true)}
              >
                Invite Staff
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member) => (
                <Card
                  key={member.id}
                  className="p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                            {member.name}
                          </h4>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>

                      <StatusBadge status={member.status} size="sm" />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Assigned Role</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-blue-600" />
                          <span>{member.roleName}</span>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {member.role !== "ADMIN" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenChangeRole(member)}
                        >
                          Change Role
                        </Button>

                        <button
                          onClick={() => handleToggleStaffStatus(member)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                            member.status === "ACTIVE"
                              ? "text-rose-600 border-rose-200 hover:bg-rose-50"
                              : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          }`}
                        >
                          {member.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 italic">
                        Super Administrator
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* Invitations Tab */
          invitations.length === 0 ? (
            <Card className="p-12 text-center space-y-3 border-dashed">
              <Mail className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Invitations Sent</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No staff invites have been dispatched yet.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setInviteModalOpen(true)}
              >
                Send Invitation
              </Button>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase">
                    <th className="p-3.5">Candidate / Email</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Expires</th>
                    <th className="p-3.5">Invited By</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {inv.fullName || "Staff Candidate"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{inv.email}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          {inv.roleName}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>

                      <td className="p-3.5 text-slate-500">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-slate-500">{inv.invitedBy}</td>

                      <td className="p-3.5 text-right space-x-1.5">
                        {inv.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleResendInvite(inv.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Resend invitation email"
                            >
                              Resend Email
                            </button>
                            <button
                              onClick={() => handleRevokeInvite(inv.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Cancel staff invitation"
                            >
                              Cancel Invitation
                            </button>
                          </>
                        )}
                        {inv.status === "ACCEPTED" && (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Activated
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Invite Staff Modal */}
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Invite New Staff Member
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send an email invitation to onboard a new staff member.
                  </p>
                </div>
                <button
                  onClick={handleCloseInviteModal}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {inviteSuccessInfo ? (
                /* Success View */
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        ✓ Invitation Sent Successfully!
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Invitation email has been sent to:
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                        {inviteSuccessInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-xs text-slate-500 font-medium">Assigned Role:</div>
                    <div className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                      {inviteSuccessInfo.roleName}
                    </div>
                    <p className="text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                      The staff member can complete their account setup using the instructions in the email.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCloseInviteModal}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSendInvite} className="p-6 space-y-4">
                  <Input
                    label="Candidate Email Address *"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />

                  <Input
                    label="Full Name (Optional)"
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Assign Custom Role *
                    </label>
                    <select
                      value={inviteRoleId}
                      onChange={(e) => setInviteRoleId(e.target.value)}
                      className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <Button variant="ghost" size="sm" type="button" onClick={handleCloseInviteModal}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      isLoading={inviting}
                      leftIcon={<Send className="h-4 w-4" />}
                    >
                      Send Invitation
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Change Role Modal */}
        {changeRoleModalOpen && selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Change Staff Role
                </h3>
                <button
                  onClick={() => setChangeRoleModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Reassigning <span className="font-bold text-slate-800">{selectedStaff.name}</span> to a different role will immediately update their allowed features and permissions.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Select New Role
                </label>
                <select
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value)}
                  className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setChangeRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={changingRole}
                  onClick={handleSaveChangedRole}
                >
                  Save New Role
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

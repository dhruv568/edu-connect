"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import {
  ShieldAlert,
  Plus,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  Key,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  isSystem: boolean;
  staffCount: number;
  invitationCount: number;
  featureKeys: string[];
  permissionKeys: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FeatureItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  permissions: Array<{
    id: string;
    key: string;
    name: string;
    description: string | null;
    action: string;
  }>;
}

interface RoleTemplate {
  name: string;
  description: string;
  features: string[];
  permissions: string[];
}

export default function AdminRolesPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [templates, setTemplates] = useState<Record<string, RoleTemplate>>({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleStatus, setRoleStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [selectedFeatureKeys, setSelectedFeatureKeys] = useState<string[]>([]);
  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState<string[]>([]);
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, featRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/features"),
      ]);

      const rolesJson = await rolesRes.json();
      const featJson = await featRes.json();

      if (rolesJson.data?.roles) {
        setRoles(rolesJson.data.roles);
      }
      if (featJson.data?.features) {
        setFeatures(featJson.data.features);
      }
      if (featJson.data?.templates) {
        setTemplates(featJson.data.templates);
      }
    } catch (err: any) {
      showToast("Error", "Failed to load roles and features directory.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRoleId(null);
    setSelectedTemplate("");
    setRoleName("");
    setRoleDescription("");
    setRoleStatus("ACTIVE");
    setSelectedFeatureKeys([]);
    setSelectedPermissionKeys([]);
    // Expand all features by default for convenient browsing
    const exp: Record<string, boolean> = {};
    features.forEach((f) => {
      exp[f.key] = true;
    });
    setExpandedFeatures(exp);
    setModalOpen(true);
  };

  const handleOpenEditModal = (role: RoleItem) => {
    setEditingRoleId(role.id);
    setSelectedTemplate("");
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setRoleStatus(role.status);
    setSelectedFeatureKeys([...role.featureKeys]);
    setSelectedPermissionKeys([...role.permissionKeys]);
    const exp: Record<string, boolean> = {};
    features.forEach((f) => {
      exp[f.key] = role.featureKeys.includes(f.key);
    });
    setExpandedFeatures(exp);
    setModalOpen(true);
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (!templateKey) return;

    const tpl = templates[templateKey];
    if (tpl) {
      if (!editingRoleId) {
        setRoleName(tpl.name);
        setRoleDescription(tpl.description);
      }
      setSelectedFeatureKeys([...tpl.features]);
      setSelectedPermissionKeys([...tpl.permissions]);

      // Expand features that are in this template
      const exp: Record<string, boolean> = {};
      features.forEach((f) => {
        exp[f.key] = tpl.features.includes(f.key);
      });
      setExpandedFeatures(exp);
      showToast("Template Applied", `Applied "${tpl.name}" permission template.`, "info");
    }
  };

  const toggleFeature = (featKey: string) => {
    const isSelected = selectedFeatureKeys.includes(featKey);
    const feat = features.find((f) => f.key === featKey);
    const permKeysForFeat = feat?.permissions.map((p) => p.key) || [];

    if (isSelected) {
      // Deselect feature and remove its permissions
      setSelectedFeatureKeys((prev) => prev.filter((k) => k !== featKey));
      setSelectedPermissionKeys((prev) => prev.filter((p) => !permKeysForFeat.includes(p)));
    } else {
      // Select feature and automatically grant its permissions
      setSelectedFeatureKeys((prev) => [...prev, featKey]);
      setSelectedPermissionKeys((prev) => Array.from(new Set([...prev, ...permKeysForFeat])));
      setExpandedFeatures((prev) => ({ ...prev, [featKey]: true }));
    }
  };

  const togglePermission = (permKey: string, featKey: string) => {
    const isSelected = selectedPermissionKeys.includes(permKey);
    let updatedPerms: string[];

    if (isSelected) {
      updatedPerms = selectedPermissionKeys.filter((k) => k !== permKey);
      // If no permissions left for feature, deselect feature
      const feat = features.find((f) => f.key === featKey);
      const remainingFeatPerms = feat?.permissions.filter((p) => updatedPerms.includes(p.key)) || [];
      if (remainingFeatPerms.length === 0) {
        setSelectedFeatureKeys((prev) => prev.filter((k) => k !== featKey));
      }
    } else {
      updatedPerms = [...selectedPermissionKeys, permKey];
      // Automatically ensure parent feature is selected
      if (!selectedFeatureKeys.includes(featKey)) {
        setSelectedFeatureKeys((prev) => [...prev, featKey]);
      }
    }

    setSelectedPermissionKeys(updatedPerms);
  };

  const toggleExpand = (featKey: string) => {
    setExpandedFeatures((prev) => ({ ...prev, [featKey]: !prev[featKey] }));
  };

  const handleSelectAllForFeature = (feat: FeatureItem) => {
    const permKeys = feat.permissions.map((p) => p.key);
    if (!selectedFeatureKeys.includes(feat.key)) {
      setSelectedFeatureKeys((prev) => [...prev, feat.key]);
    }
    setSelectedPermissionKeys((prev) => Array.from(new Set([...prev, ...permKeys])));
  };

  const handleDeselectAllForFeature = (feat: FeatureItem) => {
    const permKeys = feat.permissions.map((p) => p.key);
    setSelectedFeatureKeys((prev) => prev.filter((k) => k !== feat.key));
    setSelectedPermissionKeys((prev) => prev.filter((p) => !permKeys.includes(p)));
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      showToast("Validation Error", "Please provide a valid role name.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: roleName.trim(),
        description: roleDescription.trim() || undefined,
        status: roleStatus,
        featureKeys: selectedFeatureKeys,
        permissionKeys: selectedPermissionKeys,
      };

      const url = editingRoleId ? `/api/admin/roles/${editingRoleId}` : "/api/admin/roles";
      const method = editingRoleId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save role.");
      }

      showToast(
        "Success",
        editingRoleId ? "Role updated successfully!" : "Custom role created successfully!",
        "success"
      );
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast("Operation Failed", err.message || "Could not save role.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (role: RoleItem) => {
    try {
      const res = await fetch(`/api/admin/roles/${role.id}/duplicate`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to duplicate role.");
      }

      showToast("Role Duplicated", `Cloned role "${json.data.role.name}" created.`, "success");
      fetchData();
    } catch (err: any) {
      showToast("Error", err.message || "Failed to duplicate role.", "error");
    }
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to permanently delete role "${roleName}"?`)) {
      return;
    }

    setDeletingId(roleId);
    try {
      const res = await fetch(`/api/admin/roles/${roleId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete role.");
      }

      showToast("Role Deleted", `Role "${roleName}" was removed.`, "success");
      fetchData();
    } catch (err: any) {
      showToast("Delete Failed", err.message || "Could not delete role.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator">
      <div className="space-y-8 pb-16">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Role Governance & Permissions
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                Dynamic RBAC
              </span>
            </div>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              Create custom roles, map features, and designate fine-grained operational permissions. Staff dashboards dynamically adapt to these rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenCreateModal}
            >
              Create Custom Role
            </Button>
          </div>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading platform role directory...</p>
          </div>
        ) : roles.length === 0 ? (
          <Card className="p-12 text-center space-y-3 border-dashed">
            <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Custom Roles Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating a role like "Course Manager" or "Finance Executive" from starter templates.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
              Create First Role
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card
                key={role.id}
                className="flex flex-col justify-between p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                          {role.name}
                        </h3>
                        {role.isSystem && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 uppercase">
                            Starter
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {role.description || "No description provided."}
                      </p>
                    </div>

                    <StatusBadge status={role.status} size="sm" />
                  </div>

                  {/* Badges / Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Features</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                        {role.featureKeys.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Perms</div>
                      <div className="text-sm font-black text-blue-600 mt-0.5">
                        {role.permissionKeys.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Staff</div>
                      <div className="text-sm font-black text-emerald-600 mt-0.5">
                        {role.staffCount}
                      </div>
                    </div>
                  </div>

                  {/* Feature Tags Preview */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Assigned Features
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.featureKeys.slice(0, 4).map((fKey) => (
                        <span
                          key={fKey}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {fKey.replace(/_/g, " ")}
                        </span>
                      ))}
                      {role.featureKeys.length > 4 && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600">
                          +{role.featureKeys.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit2 className="h-3 w-3" />}
                      onClick={() => handleOpenEditModal(role)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Copy className="h-3 w-3" />}
                      onClick={() => handleDuplicate(role)}
                      title="Clone role"
                    >
                      Clone
                    </Button>
                  </div>

                  {!role.isSystem && (
                    <button
                      onClick={() => handleDelete(role.id, role.name)}
                      disabled={deletingId === role.id || role.staffCount > 0}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                      title={role.staffCount > 0 ? "Cannot delete role with assigned staff" : "Delete role"}
                    >
                      {deletingId === role.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create / Edit Role Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {editingRoleId ? "Edit Custom Role" : "Create New Custom Role"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure feature availability and granular operational privileges.
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Template Preset Selector (only in create mode) */}
                {!editingRoleId && Object.keys(templates).length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span>Start from a Pre-Configured Template</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(templates).map(([key, tpl]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleTemplateSelect(key)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                            selectedTemplate === key
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                          }`}
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Role Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Role Title *"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Course Manager"
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Role Status
                    </label>
                    <div className="flex items-center gap-3 h-11 px-4 bg-white border border-slate-200 rounded-xl">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="roleStatus"
                          value="ACTIVE"
                          checked={roleStatus === "ACTIVE"}
                          onChange={() => setRoleStatus("ACTIVE")}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        Active
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="roleStatus"
                          value="INACTIVE"
                          checked={roleStatus === "INACTIVE"}
                          onChange={() => setRoleStatus("INACTIVE")}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        Inactive
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Role Description
                  </label>
                  <input
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Brief summary of duties and platform scope..."
                    className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Feature & Permission Matrix */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Feature & Permission Matrix
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {selectedFeatureKeys.length} features and {selectedPermissionKeys.length} permissions active
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFeatureKeys(features.map((f) => f.key));
                          setSelectedPermissionKeys(
                            features.flatMap((f) => f.permissions.map((p) => p.key))
                          );
                        }}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFeatureKeys([]);
                          setSelectedPermissionKeys([]);
                        }}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {features.map((feat) => {
                      const isFeatSelected = selectedFeatureKeys.includes(feat.key);
                      const isExpanded = expandedFeatures[feat.key] || false;
                      const activePermsCount = feat.permissions.filter((p) =>
                        selectedPermissionKeys.includes(p.key)
                      ).length;

                      return (
                        <div
                          key={feat.key}
                          className={`rounded-xl border transition-all ${
                            isFeatSelected
                              ? "border-blue-300 bg-blue-50/20 dark:border-blue-800"
                              : "border-slate-200 dark:border-slate-800 bg-white"
                          }`}
                        >
                          {/* Feature Header */}
                          <div className="p-3.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isFeatSelected}
                                onChange={() => toggleFeature(feat.key)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {feat.name}
                                  </span>
                                  <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-slate-100 text-slate-600">
                                    {feat.category}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{feat.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-500">
                                {activePermsCount} / {feat.permissions.length} perms
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleExpand(feat.key)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Granular Permissions */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
                              <div className="flex items-center justify-between mb-2 text-[11px]">
                                <span className="font-semibold text-slate-500">Granular Operations:</span>
                                <div className="space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAllForFeature(feat)}
                                    className="text-blue-600 hover:underline"
                                  >
                                    Select All
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeselectAllForFeature(feat)}
                                    className="text-slate-500 hover:underline"
                                  >
                                    Deselect All
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {feat.permissions.map((perm) => {
                                  const isPermSelected = selectedPermissionKeys.includes(perm.key);
                                  return (
                                    <label
                                      key={perm.key}
                                      className={`p-2 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition ${
                                        isPermSelected
                                          ? "bg-white border-blue-400 shadow-2xs font-medium text-slate-900"
                                          : "bg-transparent border-slate-200 text-slate-600 hover:bg-white"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isPermSelected}
                                        onChange={() => togglePermission(perm.key, feat.key)}
                                        className="h-3.5 w-3.5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <div>
                                        <div className="font-bold text-[11px] text-slate-800">{perm.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{perm.key}</div>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  onClick={handleSaveRole}
                >
                  {editingRoleId ? "Save Changes" : "Create Role"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

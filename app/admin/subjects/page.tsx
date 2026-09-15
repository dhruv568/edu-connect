"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuthPermissions } from "@/components/shared/permission-guard";
import { useToast } from "@/components/ui/toast";
import {
  BookOpen,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  Loader2,
  Power,
  Layers,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSubjectsPage() {
  const { user } = useAuthPermissions();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subjects");
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.subjects)) {
        setSubjects(json.data.subjects);
      }
    } catch (err: any) {
      showToast("Error", "Failed to load subjects.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormName("");
    setFormDescription("");
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormName(subject.name);
    setFormDescription(subject.description || "");
    setFormIsActive(subject.isActive);
    setIsAddModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Validation Error", "Subject name is required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingSubject) {
        // Update
        const res = await fetch("/api/admin/subjects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingSubject.id,
            name: formName.trim(),
            description: formDescription.trim(),
            isActive: formIsActive,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update subject.");
        showToast("Success", "Subject updated successfully.", "success");
      } else {
        // Create
        const res = await fetch("/api/admin/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            description: formDescription.trim(),
            isActive: formIsActive,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create subject.");
        showToast("Success", "Subject added successfully.", "success");
      }

      setIsAddModalOpen(false);
      fetchSubjects();
    } catch (err: any) {
      showToast("Error", err.message || "Operation failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (subject: Subject) => {
    const newStatus = !subject.isActive;
    // Optimistic update
    setSubjects((prev) =>
      prev.map((s) => (s.id === subject.id ? { ...s, isActive: newStatus } : s))
    );

    try {
      const res = await fetch("/api/admin/subjects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subject.id, isActive: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update subject status.");
      showToast(
        "Status Updated",
        `Subject "${subject.name}" is now ${newStatus ? "Active" : "Disabled"}.`,
        "success"
      );
    } catch (err: any) {
      // Revert optimistic update
      setSubjects((prev) =>
        prev.map((s) => (s.id === subject.id ? { ...s, isActive: !newStatus } : s))
      );
      showToast("Error", err.message || "Failed to update subject status.", "error");
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout
      role="ADMIN"
      userName={user?.name || "System Administrator"}
      userEmail={user?.email || undefined}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              <span>Subject Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage platform subjects used across Free AI Exams, course categories, and educator discovery.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Subject</span>
          </button>
        </div>

        {/* Search & Statistics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">{subjects.length}</div>
              <div className="text-[11px] text-slate-500 font-medium">Total Subjects</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-black text-blue-600">
                {subjects.filter((s) => s.isActive).length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Active (Learner Visible)</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-black text-amber-600">Free AI Exams</div>
              <div className="text-[11px] text-slate-500 font-medium">Automatic Generator Sync</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search subjects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent outline-none font-medium"
          />
        </div>

        {/* Subjects Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Loading subjects...</span>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No subjects found</p>
              <p className="text-xs text-slate-400">
                {searchQuery ? "Try adjusting your search query." : "Click Add New Subject to create your first subject."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sub.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {sub.slug}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {sub.description || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(sub)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            sub.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          title={`Click to ${sub.isActive ? "Disable" : "Enable"}`}
                        >
                          <Power className="h-3 w-3" />
                          <span>{sub.isActive ? "Active" : "Disabled"}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Edit Subject"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Add or Edit Subject */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">
                  {editingSubject ? "Edit Subject" : "Add New Subject"}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSubject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Physics, Programming"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Key concepts, syllabus topics covered..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <label
                    htmlFor="isActiveCheck"
                    className="text-xs font-bold text-slate-800 cursor-pointer select-none"
                  >
                    Active for Learners & Free AI Exams
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{editingSubject ? "Save Changes" : "Create Subject"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

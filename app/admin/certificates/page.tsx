"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Award,
  ShieldCheck,
  Search,
  Download,
  Mail,
  RotateCcw,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Save,
  Loader2,
  X,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function AdminCertificatesPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"roster" | "template">("roster");

  // Roster state
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  // Details & Audit Modal
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Revoke Modal
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  // Template Studio state
  const [template, setTemplate] = useState<any>({
    title: "15-Day Educator Certification Template",
    badgeText: "VERIFIED EDUCATOR",
    headline: "Certificate of Completion",
    subtext: "This is proudly presented to",
    bodyText:
      "For successfully completing the intensive 15-Day Educator Training Program, demonstrating mastery of live interactive classroom delivery, digital curriculum design, and online pedagogical excellence.",
    issuerName: "EduConnects Academy",
    issuerTitle: "Director of Academic Excellence",
    primaryColor: "#16805B",
    accentColor: "#0D5C41",
    isActive: true,
  });
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Load Certificates Roster
  const loadCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      params.set("page", pagination.page.toString());

      const res = await fetch(`/api/admin/certificates?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCertificates(json.data.certificates || []);
        setPagination(json.data.pagination || pagination);
      }
    } catch {
      showToast("Failed to load certificates roster", "error");
    } finally {
      setLoadingCertificates(false);
    }
  };

  useEffect(() => {
    if (activeTab === "roster") {
      loadCertificates();
    }
  }, [activeTab, searchQuery, statusFilter, pagination.page]);

  // Load Template
  const loadTemplate = async () => {
    setLoadingTemplate(true);
    try {
      const res = await fetch("/api/admin/certificates/template");
      const json = await res.json();
      if (json.success && json.data?.template) {
        setTemplate(json.data.template);
      }
    } catch {
      showToast("Failed to load certificate template", "error");
    } finally {
      setLoadingTemplate(false);
    }
  };

  useEffect(() => {
    if (activeTab === "template") {
      loadTemplate();
    }
  }, [activeTab]);

  // View Details & Audit Log
  const handleViewDetails = async (certId: string) => {
    setLoadingDetails(true);
    setDetailsModalOpen(true);
    try {
      const res = await fetch(`/api/admin/certificates/${certId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedCert(json.data);
      }
    } catch {
      showToast("Failed to load certificate details", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Resend Email
  const handleResendEmail = async (certId: string) => {
    try {
      const res = await fetch(`/api/admin/certificates/${certId}/resend`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("Certificate email resent with PDF attachment", "success");
        loadCertificates();
      } else {
        showToast(json.error || "Failed to resend email", "error");
      }
    } catch {
      showToast("Error resending email", "error");
    }
  };

  // Regenerate Certificate
  const handleRegenerate = async (certId: string) => {
    try {
      const res = await fetch(`/api/admin/certificates/${certId}/regenerate`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("Certificate regenerated and reinstated successfully", "success");
        loadCertificates();
        if (detailsModalOpen) handleViewDetails(certId);
      } else {
        showToast(json.error || "Failed to regenerate", "error");
      }
    } catch {
      showToast("Error regenerating certificate", "error");
    }
  };

  // Open Revoke Modal
  const handleOpenRevoke = (cert: any) => {
    setSelectedCert(cert);
    setRevokeReason("");
    setRevokeModalOpen(true);
  };

  // Execute Revoke
  const handleConfirmRevoke = async () => {
    if (!selectedCert) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/admin/certificates/${selectedCert.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: revokeReason || "Revoked by platform administrator" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Certificate revoked successfully", "success");
        setRevokeModalOpen(false);
        loadCertificates();
        if (detailsModalOpen) handleViewDetails(selectedCert.id);
      } else {
        showToast(json.error || "Failed to revoke certificate", "error");
      }
    } catch {
      showToast("Error revoking certificate", "error");
    } finally {
      setRevoking(false);
    }
  };

  // Save Template
  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/admin/certificates/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Certificate template configuration saved", "success");
      } else {
        showToast(json.error || "Failed to save template", "error");
      }
    } catch {
      showToast("Error saving template", "error");
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8 pb-16">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#0D5C41] via-[#16805B] to-[#0D5C41] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-200 text-xs font-extrabold uppercase tracking-wider">
                <Award className="h-4 w-4 text-[#35A979]" />
                <span>Credentials &amp; Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Certificate Management &amp; Template Studio
              </h1>
              <p className="text-sm text-emerald-100 max-w-2xl font-medium">
                Manage issued educator certificates, verify public certificate authenticity, audit issuance history, and customize the official dynamic certificate template.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={loadCertificates}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-bold self-start md:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Refresh
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab("roster")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "roster"
                ? "border-[#16805B] text-[#0D5C41]"
                : "border-transparent text-slate-650 hover:text-slate-900"
            }`}
          >
            <Award className="h-4 w-4" /> Issued Certificates Roster
          </button>
          <button
            onClick={() => setActiveTab("template")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "template"
                ? "border-[#16805B] text-[#0D5C41]"
                : "border-transparent text-slate-650 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Template Configuration &amp; Preview
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ISSUED CERTIFICATES ROSTER */}
        {/* ========================================================================= */}
        {activeTab === "roster" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or Certificate ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-[#16805B]"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-semibold text-slate-650">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl text-xs font-bold p-2 outline-none"
                >
                  <option value="ALL">All Certificates</option>
                  <option value="ISSUED">Issued &amp; Active</option>
                  <option value="REVOKED">Revoked</option>
                </select>
              </div>
            </div>

            {loadingCertificates ? (
              <div className="p-12 text-center text-slate-650 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#16805B]" /> Loading certificates...
              </div>
            ) : certificates.length === 0 ? (
              <Card className="p-12 text-center text-slate-650">
                <Award className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">No certificates found.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Certificates appear here automatically once enrolled educators complete all 15 days and confirm identity.
                </p>
              </Card>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">Certificate ID</th>
                      <th className="p-3.5">Educator</th>
                      <th className="p-3.5">Program</th>
                      <th className="p-3.5">Completion Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {certificates.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#16805B]">{c.certificateNumber}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{c.educatorName}</div>
                          <div className="text-[11px] text-slate-650 font-mono">{c.educatorEmail}</div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">{c.programTitle}</td>
                        <td className="p-3.5 text-slate-650">
                          {new Date(c.completionDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3.5">
                          <Badge
                            className={`text-[10px] font-bold ${
                              c.status === "ISSUED"
                                ? "bg-emerald-100 text-[#0D5C41] border border-emerald-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View Audit & Details */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(c.id)}
                              className="h-7 text-xs font-semibold px-2"
                              title="Audit History"
                            >
                              <Eye className="h-3 w-3 mr-1" /> Audit
                            </Button>

                            {/* Download PDF */}
                            <a
                              href={`/api/admin/certificates/${c.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 h-7 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                              title="Download PDF"
                            >
                              <Download className="h-3 w-3" /> PDF
                            </a>

                            {/* Resend Email */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendEmail(c.id)}
                              disabled={c.status === "REVOKED"}
                              className="h-7 text-xs font-semibold px-2 text-teal-700 hover:bg-teal-50"
                              title="Resend to Educator Email"
                            >
                              <Mail className="h-3 w-3" />
                            </Button>

                            {/* Revoke or Regenerate */}
                            {c.status === "ISSUED" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenRevoke(c)}
                                className="h-7 text-xs font-semibold px-2 text-rose-700 hover:bg-rose-50 border-rose-200"
                              >
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRegenerate(c.id)}
                                className="h-7 text-xs font-semibold px-2 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              >
                                Regenerate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CERTIFICATE TEMPLATE & REALTIME PREVIEW */}
        {/* ========================================================================= */}
        {activeTab === "template" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Form: 5 cols */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-6 border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Template Properties
                  </h3>
                  <Button
                    size="sm"
                    onClick={handleSaveTemplate}
                    disabled={savingTemplate}
                    className="bg-[#16805B] hover:bg-[#0D5C41] text-white text-xs font-bold"
                  >
                    {savingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                    Save Template
                  </Button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Badge Ribbon Text</label>
                  <input
                    type="text"
                    value={template.badgeText}
                    onChange={(e) => setTemplate({ ...template, badgeText: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-[#16805B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Headline</label>
                  <input
                    type="text"
                    value={template.headline}
                    onChange={(e) => setTemplate({ ...template, headline: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-[#16805B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subtext</label>
                  <input
                    type="text"
                    value={template.subtext}
                    onChange={(e) => setTemplate({ ...template, subtext: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#16805B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Body / Achievement Text</label>
                  <textarea
                    rows={4}
                    value={template.bodyText}
                    onChange={(e) => setTemplate({ ...template, bodyText: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#16805B]"
                  />
                  <span className="text-[11px] text-slate-650">The Educator's verified name and program title are dynamically formatted above and below.</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Issuer Name</label>
                    <input
                      type="text"
                      value={template.issuerName}
                      onChange={(e) => setTemplate({ ...template, issuerName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Issuer Title</label>
                    <input
                      type="text"
                      value={template.issuerTitle}
                      onChange={(e) => setTemplate({ ...template, issuerTitle: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={template.primaryColor}
                        onChange={(e) => setTemplate({ ...template, primaryColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer border"
                      />
                      <span className="font-mono text-xs">{template.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Accent Dark Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={template.accentColor}
                        onChange={(e) => setTemplate({ ...template, accentColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer border"
                      />
                      <span className="font-mono text-xs">{template.accentColor}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Live Vector Canvas Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-[#16805B]" /> Real-Time Certificate Layout Preview
                </h3>
                <span className="text-[11px] text-slate-650">Generated dynamically via pdf-lib</span>
              </div>

              {/* Simulated High-Res Vector Certificate Card */}
              <div
                className="w-full rounded-2xl border-4 shadow-2xl p-6 sm:p-8 bg-white relative overflow-hidden aspect-[1.414/1] flex flex-col justify-between"
                style={{
                  borderColor: template.accentColor || "#0D5C41",
                  backgroundColor: "#FAFAF8",
                }}
              >
                {/* Inner Gold Frame */}
                <div
                  className="absolute inset-2 border-2 rounded-xl pointer-events-none"
                  style={{ borderColor: "#C9A147" }}
                />

                {/* Header */}
                <div className="text-center space-y-1 relative z-10 pt-2">
                  <div
                    className="font-black text-[10px] tracking-widest uppercase"
                    style={{ color: template.primaryColor || "#16805B" }}
                  >
                    E D U C O N N E C T S   A C A D E M Y
                  </div>
                  <div className="inline-block px-3 py-0.5 rounded-full text-[9px] font-bold border border-emerald-300 bg-emerald-50 text-[#0D5C41]">
                    {template.badgeText || "VERIFIED EDUCATOR"}
                  </div>
                  <h2
                    className="text-xl sm:text-2xl font-serif font-black tracking-tight pt-2"
                    style={{ color: template.accentColor || "#0D5C41" }}
                  >
                    {template.headline || "Certificate of Completion"}
                  </h2>
                  <p className="text-xs italic text-slate-500 font-serif">
                    {template.subtext || "This is proudly presented to"}
                  </p>
                </div>

                {/* Recipient & Body */}
                <div className="text-center space-y-2 relative z-10 my-auto">
                  <div className="text-lg sm:text-xl font-serif font-black text-slate-900">
                    [Educator Full Name]
                  </div>
                  <div className="w-48 h-0.5 mx-auto bg-amber-400" />

                  <div className="text-[11px] text-slate-650 max-w-md mx-auto leading-relaxed pt-1">
                    for successfully completing the rigorous requirements of the
                  </div>
                  <div
                    className="text-sm font-black tracking-wide"
                    style={{ color: template.accentColor || "#0D5C41" }}
                  >
                    15-Day Educator Training Program
                  </div>
                  <p className="text-[10px] text-slate-600 max-w-sm mx-auto leading-snug line-clamp-2">
                    {template.bodyText}
                  </p>
                </div>

                {/* Signatures & Seal */}
                <div className="grid grid-cols-3 items-center text-center relative z-10 pt-3 border-t border-slate-200/80">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[10px] text-slate-800">
                      {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="text-[8px] text-slate-650 uppercase font-semibold">Date of Completion</div>
                  </div>

                  {/* Rosette Emblem */}
                  <div className="mx-auto w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-50/80 flex flex-col items-center justify-center p-1 text-[#0D5C41]">
                    <span className="text-[7px] font-black leading-tight">EDUCONNECTS</span>
                    <span className="text-[8px] font-black text-amber-600">VERIFIED</span>
                    <span className="text-[7px]">★ ★ ★</span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-serif italic text-xs font-bold text-[#0D5C41]">Dr. Vikram Shrivastava</div>
                    <div className="text-[8px] font-bold text-slate-800">{template.issuerTitle}</div>
                    <div className="text-[7px] text-slate-650">{template.issuerName}</div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex justify-between items-center text-[8px] text-slate-650 pt-2 border-t border-slate-100 font-mono">
                  <span>Certificate ID: EDU-CERT-2026-XXXXXX</span>
                  <span>Issued by Shrivastava ProFunnels Ventures Pvt Ltd</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CERTIFICATE DETAILS & AUDIT MODAL */}
      {/* ========================================================================= */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#16805B]" />
                <h3 className="text-lg font-black text-slate-900">Certificate Audit &amp; Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetails || !selectedCert ? (
              <div className="p-8 text-center text-slate-650 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#16805B]" /> Loading audit history...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Status & ID Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-650">Verification ID:</span>
                    <span className="font-mono font-bold text-[#16805B] text-sm">
                      {selectedCert.certificateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-650">Educator:</span>
                    <span className="font-bold text-slate-900">{selectedCert.educatorName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-650">Email:</span>
                    <span className="font-mono text-slate-700">{selectedCert.educatorEmail}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-650">Status:</span>
                    <Badge
                      className={`font-bold ${
                        selectedCert.status === "ISSUED"
                          ? "bg-emerald-100 text-[#0D5C41]"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {selectedCert.status}
                    </Badge>
                  </div>
                  {selectedCert.revokedAt && (
                    <div className="flex justify-between items-center text-rose-700">
                      <span className="font-bold">Revocation Reason:</span>
                      <span>{selectedCert.revocationReason || "Admin action"}</span>
                    </div>
                  )}
                </div>

                {/* Audit Trail Timeline */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Chronological Audit Trail
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedCert.auditLogs?.map((log: any) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-[#16805B]">{log.action}</span>
                          <p className="text-slate-650 mt-0.5">{log.details}</p>
                        </div>
                        <span className="text-[10px] text-slate-650 shrink-0">
                          {new Date(log.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t">
                  <a
                    href={`/certificate/verify/${selectedCert.certificateNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Public Page
                  </a>
                  <a
                    href={`/api/admin/certificates/${selectedCert.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#16805B] text-white font-bold hover:bg-[#0D5C41] inline-flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVOKE CERTIFICATE MODAL */}
      {/* ========================================================================= */}
      {revokeModalOpen && selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="text-lg font-black text-slate-900">Revoke Certificate</h3>
            </div>

            <p className="text-xs text-slate-650">
              Are you sure you want to revoke certificate{" "}
              <strong className="text-slate-900">{selectedCert.certificateNumber}</strong> for{" "}
              <strong>{selectedCert.educatorName}</strong>? Once revoked, the public verification page will display the certificate as INVALID / REVOKED.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Revocation</label>
              <textarea
                rows={2}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Incomplete training integrity, educator request, or violation of guidelines..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setRevokeModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRevoke}
                disabled={revoking}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {revoking ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Confirm Revocation
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

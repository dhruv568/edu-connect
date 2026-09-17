"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Calendar,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Search,
  ArrowRight,
  GraduationCap,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function PublicCertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = (params?.certificateId as string) || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [lookupId, setLookupId] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (certificateId) {
      fetchVerification(certificateId);
    }
  }, [certificateId]);

  const fetchVerification = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificate/verify/${encodeURIComponent(id)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || "Certificate record not found");
        setData(null);
      }
    } catch {
      setError("Network error communicating with the EduConnects Verification Ledger");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupId.trim()) {
      router.push(`/certificate/verify/${encodeURIComponent(lookupId.trim().toUpperCase())}`);
    }
  };

  const handleCopy = (text: string, type: "link" | "id") => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-200">
      {/* Top Brand Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Logo variant="compact" size="md" href="/" roleContext="teacher" />
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/training"
              className="text-xs font-bold text-slate-650 hover:text-[#16805B] transition-colors hidden sm:inline"
            >
              Educator Academy
            </Link>
            <Link
              href="/teacher/login"
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#16805B] hover:bg-[#0D5C41] text-white transition-all shadow-sm"
            >
              Educator Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Verification Status Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-[#16805B]" />
            <span>EduConnects Credential Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Official Credential Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-650 max-w-md mx-auto">
            Authenticity confirmation for EduConnects Certified Educators and Academy Graduates.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#16805B]" />
            <p className="text-sm font-semibold text-slate-650">Querying cryptographic verification registry...</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <Card className="p-8 sm:p-12 rounded-3xl border-2 border-red-200 bg-red-50/50 text-center space-y-6 shadow-lg">
            <div className="w-16 h-16 rounded-3xl bg-red-100 border border-red-300 flex items-center justify-center mx-auto text-red-600 shadow-sm">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <Badge className="bg-red-100 text-red-900 border-red-300 font-bold px-3 py-1">
                Certificate Not Found
              </Badge>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Invalid or Unregistered Credential ID
              </h2>
              <p className="text-xs sm:text-sm text-slate-650 max-w-md mx-auto leading-relaxed">
                The identifier <code className="font-mono font-bold text-red-700">{certificateId}</code> does not match any authenticated record in the EduConnects registry.
              </p>
            </div>

            <div className="max-w-md mx-auto pt-2">
              <form onSubmit={handleLookupSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try another ID (e.g. EDU-CERT-...)"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#16805B]"
                />
                <Button type="submit" className="bg-[#16805B] text-white rounded-2xl text-xs font-bold px-4">
                  Search
                </Button>
              </form>
            </div>
          </Card>
        )}

        {/* Successful Verification Display */}
        {!loading && data && (
          <div className="space-y-6">
            {/* Status Banner */}
            {data.status === "ISSUED" ? (
              <div className="p-5 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#16805B] text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-emerald-900 uppercase tracking-wide">
                        Verified &amp; Active Credential
                      </span>
                      <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-black uppercase">
                        Authentic
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Cryptographically certified by EduConnects Academy. All training milestones satisfied.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(window.location.href, "link")}
                    className="rounded-xl border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "Link Copied" : "Share Link"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-red-500/10 border-2 border-red-500/30 text-red-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-red-900 uppercase tracking-wide">
                        Revoked Credential
                      </span>
                      <Badge className="bg-red-600 text-white border-0 text-[10px] font-black uppercase">
                        Revoked
                      </Badge>
                    </div>
                    <p className="text-xs text-red-800 mt-0.5">
                      This certificate was revoked on{" "}
                      <span className="font-bold">{data.revokedAt ? new Date(data.revokedAt).toLocaleDateString("en-IN") : "N/A"}</span>
                      {data.revocationReason ? ` — Reason: ${data.revocationReason}` : "."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Official Credential Certificate Plaque */}
            <Card className="rounded-3xl border-4 border-[#16805B]/20 bg-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#16805B]/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-8">
                {/* Plaque Header */}
                <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-extrabold text-[#16805B] uppercase tracking-widest">
                      EduConnects Academy Credential
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      {data.programTitle}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs font-bold py-1 px-2.5 border-slate-300 bg-slate-50 text-slate-700">
                      ID: {data.certificateNumber}
                    </Badge>
                    <button
                      onClick={() => handleCopy(data.certificateNumber, "id")}
                      title="Copy Certificate ID"
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-650 transition-colors"
                    >
                      {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Recipient Highlight */}
                <div className="space-y-1.5 text-center sm:text-left py-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-650">
                    Awarded To Verified Educator
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-serif tracking-wide">
                    {data.educatorName}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-650 text-xs font-bold uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5 text-[#16805B]" />
                      <span>Completion Date</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{data.completionDate}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-650 text-xs font-bold uppercase tracking-wider">
                      <Award className="h-3.5 w-3.5 text-[#16805B]" />
                      <span>Issue Date</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{data.issueDate}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-1.5 text-slate-650 text-xs font-bold uppercase tracking-wider">
                      <Building2 className="h-3.5 w-3.5 text-[#16805B]" />
                      <span>Issuing Body</span>
                    </div>
                    <p className="text-xs font-black text-slate-900 truncate">EduConnects Academy</p>
                  </div>
                </div>

                {/* Legal Entity Notice */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-650">
                  <p>
                    Issued by <span className="font-bold text-slate-800">Shrivastava ProFunnels Ventures Pvt Ltd</span> (CIN: <span className="font-mono font-semibold text-slate-800">U85499UP2024PTC212061</span>).
                  </p>
                  <span className="text-[#16805B] font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Tamper-Evident Vector Record
                  </span>
                </div>
              </div>
            </Card>

            {/* Public Lookup Bar for Employers & Verifiers */}
            <Card className="p-6 rounded-3xl border border-slate-200 bg-white space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Search className="h-4 w-4 text-[#16805B]" />
                <span>Verify Another Certificate</span>
              </h3>
              <form onSubmit={handleLookupSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Certificate ID (e.g. EDU-CERT-2026-XXXXXX)"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#16805B]"
                />
                <Button type="submit" className="bg-[#16805B] hover:bg-[#0D5C41] text-white rounded-xl text-xs font-black px-5">
                  Verify
                </Button>
              </form>
            </Card>
          </div>
        )}
      </main>

      {/* Corporate Verification Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-650 space-y-2">
        <p className="font-semibold text-slate-700">
          EduConnects Academic Credentials Verification System
        </p>
        <p>
          Corporate Entity: <span className="font-bold text-slate-800">Shrivastava ProFunnels Ventures Pvt Ltd</span> • CIN: <span className="font-mono text-slate-800">U85499UP2024PTC212061</span>
        </p>
        <p className="text-[11px] text-slate-650">
          © {new Date().getFullYear()} EduConnects. All rights reserved. Registered in accordance with Indian educational and corporate governance standards.
        </p>
      </footer>
    </div>
  );
}

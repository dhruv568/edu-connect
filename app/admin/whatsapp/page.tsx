"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { GlassButton } from "@/components/glass/glass-button";
import { BackButton } from "@/components/ui/back-button";
import {
  MessageSquare,
  Search,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  Clock,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Info,
  Settings,
} from "lucide-react";

export default function AdminWhatsAppHistoryPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  });

  // Selected Message for Dialog Details
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (eventFilter !== "ALL") params.set("eventType", eventFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/whatsapp?${params.toString()}`);
      const json = await res.json();

      if (json.data) {
        setMessages(json.data.messages || []);
        setTotalPages(json.data.pagination?.totalPages || 1);
        setTotalCount(json.data.pagination?.total || 0);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp history:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, eventFilter, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleRetry = async (messageId: string) => {
    setRetryingId(messageId);
    try {
      const res = await fetch(`/api/admin/whatsapp/retry/${messageId}`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.data?.success) {
        alert("Message resent successfully!");
        fetchMessages();
      } else {
        alert(json.data?.message || json.error?.message || "Retry attempt failed.");
        fetchMessages();
      }
    } catch (err) {
      console.error("Error retrying message:", err);
      alert("Network error while retrying message.");
    } finally {
      setRetryingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READ":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
            <Eye className="h-3 w-3" /> READ
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" /> DELIVERED
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <CheckCircle className="h-3 w-3" /> SENT
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <AlertTriangle className="h-3 w-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="h-3 w-3" /> {status}
          </span>
        );
    }
  };

  const getEventBadge = (event: string) => {
    let color = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    if (event.startsWith("PAYMENT_")) {
      color = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
    } else if (event.startsWith("REFUND_")) {
      color = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
    } else if (event.includes("REGISTRATION") || event.includes("VERIF")) {
      color = "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300";
    } else if (event.includes("CLASS") || event.includes("COURSE")) {
      color = "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300";
    }

    return (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold font-mono uppercase ${color}`}>
        {event.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <DashboardLayout role="ADMIN" userName="System Administrator" userEmail="educonnects.com@gmail.com">
      <div className="space-y-6 pb-16 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <BackButton fallbackUrl="/admin" label="Back to Dashboard" variant="default" className="mb-3" />
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
              <MessageSquare className="h-7 w-7 text-emerald-500" />
              WhatsApp Notification History
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              Audit log of automated WhatsApp Cloud API notifications, delivery status tracking, and failure recovery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              Notification Settings
            </a>
            <GlassButton variant="secondary" size="sm" onClick={() => fetchMessages()} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </GlassButton>
          </div>
        </div>

        {/* Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Messages</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {stats.total.toLocaleString()}
            </span>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-blue-500 block uppercase">Sent</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {stats.sent.toLocaleString()}
            </span>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-emerald-500 block uppercase">Delivered</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats.delivered.toLocaleString()}
            </span>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-purple-500 block uppercase">Read</span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {stats.read.toLocaleString()}
            </span>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-red-500 block uppercase">Failed</span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">
              {stats.failed.toLocaleString()}
            </span>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search phone number, recipient email, template name, or Meta message ID..."
                className="w-full h-10 pl-9 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SENT">Sent</option>
                <option value="DELIVERED">Delivered</option>
                <option value="READ">Read</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Event Filter */}
            <div className="w-full md:w-56">
              <select
                value={eventFilter}
                onChange={(e) => {
                  setEventFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Event Types</option>
                <option value="PAYMENT_SUCCESS">Payment Success</option>
                <option value="PAYMENT_RECEIPT">Receipt Generated</option>
                <option value="PAYMENT_FAILED">Payment Failed</option>
                <option value="REFUND_REQUESTED">Refund Requested</option>
                <option value="REFUND_APPROVED">Refund Approved</option>
                <option value="REFUND_COMPLETED">Refund Completed</option>
                <option value="REFUND_REJECTED">Refund Rejected</option>
                <option value="LEARNER_REGISTRATION">Learner Registration</option>
                <option value="EDUCATOR_REGISTRATION">Educator Registration</option>
                <option value="EDUCATOR_VERIFIED">Educator Verified</option>
                <option value="EDUCATOR_VERIFICATION_PENDING">Verification Pending</option>
                <option value="COURSE_ENROLLED">Course Enrolled</option>
                <option value="BOOKING_CONFIRMED">Booking Confirmed</option>
                <option value="CLASS_REMINDER">Class Reminder</option>
                <option value="CLASS_CANCELLED">Class Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Message History Table */}
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Template Name</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Meta Message ID</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                      Loading WhatsApp notification history...
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      No WhatsApp notification logs matching criteria.
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => {
                    const userName = msg.user?.profile
                      ? `${msg.user.profile.firstName} ${msg.user.profile.lastName}`.trim()
                      : msg.user?.email || "Guest";

                    return (
                      <tr
                        key={msg.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Recipient */}
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                            {msg.phoneNumber}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {userName}
                          </div>
                        </td>

                        {/* Event */}
                        <td className="p-4">{getEventBadge(msg.eventType)}</td>

                        {/* Template */}
                        <td className="p-4">
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold block">
                            {msg.templateName}
                          </span>
                          <button
                            onClick={() => setSelectedMessage(msg)}
                            className="text-[10px] text-emerald-600 hover:underline inline-flex items-center gap-0.5 mt-0.5 font-bold"
                          >
                            <Info className="h-3 w-3" /> View Data
                          </button>
                        </td>

                        {/* Date & Time */}
                        <td className="p-4 text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {getStatusBadge(msg.status)}
                          {msg.errorMessage && (
                            <span
                              className="block text-[10px] text-red-500 truncate max-w-[150px] mt-0.5"
                              title={msg.errorMessage}
                            >
                              {msg.errorMessage}
                            </span>
                          )}
                        </td>

                        {/* Meta Message ID */}
                        <td className="p-4">
                          {msg.metaMessageId ? (
                            <div className="flex items-center gap-1">
                              <span
                                className="font-mono text-[10px] text-slate-500 truncate max-w-[100px]"
                                title={msg.metaMessageId}
                              >
                                {msg.metaMessageId.slice(0, 12)}...
                              </span>
                              <button
                                onClick={() => copyToClipboard(msg.metaMessageId, msg.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Copy full Meta Message ID"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              {copiedId === msg.id && (
                                <span className="text-[9px] text-emerald-500 font-bold">Copied!</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          {msg.status === "FAILED" ? (
                            <GlassButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRetry(msg.id)}
                              disabled={retryingId === msg.id}
                              className="text-red-500 border-red-500/30 hover:bg-red-500/10 font-black text-[11px]"
                            >
                              {retryingId === msg.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              ) : (
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              )}
                              Retry Send
                            </GlassButton>
                          ) : (
                            <GlassButton
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedMessage(msg)}
                              className="text-[11px] font-bold"
                            >
                              Details
                            </GlassButton>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
            <div>
              Showing {messages.length > 0 ? (page - 1) * 15 + 1 : 0} to{" "}
              {Math.min(page * 15, totalCount)} of {totalCount} notifications
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                Page {page} of {totalPages || 1}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Message Details Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">
                  Notification Payload Details
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Recipient Phone</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedMessage.phoneNumber}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Event & Template</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getEventBadge(selectedMessage.eventType)}
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      {selectedMessage.templateName}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Meta Message ID</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">
                    {selectedMessage.metaMessageId || "Not assigned"}
                  </span>
                </div>

                {selectedMessage.errorMessage && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-600 dark:text-red-400 text-xs">
                    <span className="font-bold block mb-0.5">Failure Reason:</span>
                    {selectedMessage.errorMessage}
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">
                    Template Parameters
                  </span>
                  <pre className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 overflow-x-auto max-h-48">
                    {JSON.stringify(
                      selectedMessage.parameters ? JSON.parse(selectedMessage.parameters) : {},
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                {selectedMessage.status === "FAILED" && (
                  <GlassButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const id = selectedMessage.id;
                      setSelectedMessage(null);
                      handleRetry(id);
                    }}
                    className="text-red-500 border-red-500/30 font-bold"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry Now
                  </GlassButton>
                )}
                <GlassButton size="sm" onClick={() => setSelectedMessage(null)} className="font-bold">
                  Close
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

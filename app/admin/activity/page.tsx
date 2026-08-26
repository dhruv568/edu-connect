"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Search, Shield, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function AdminActivityPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/activity?page=${page}&limit=20&action=${actionFilter}`);
      const json = await res.json();
      if (json.data) {
        setActivities(json.data.activities || []);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, actionFilter]);

  return (
    <DashboardLayout role="ADMIN" userName="Activity Logs">
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Platform Audit & Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Traceable log of user registrations, course enrollments, payments, teacher verifications, and system events.
          </p>
        </div>

        <Card className="p-4 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by action (e.g. PAYMENT_CAPTURED, TEACHER_VERIFIED)..."
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        <Card className="p-0 border-slate-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-500">No activity logs recorded for this query.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {activities.map((act) => (
                <div key={act.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {act.action}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {act.actorName} ({act.actorRole || "SYSTEM"})
                      </span>
                    </div>

                    {act.entityType && (
                      <p className="text-slate-500">
                        Entity: <span className="font-semibold text-slate-700 dark:text-slate-300">{act.entityType}</span> ({act.entityId || "N/A"})
                      </p>
                    )}

                    {act.metadata && (
                      <pre className="text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded-lg text-slate-600 dark:text-slate-400 overflow-x-auto max-w-lg">
                        {JSON.stringify(act.metadata, null, 2)}
                      </pre>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

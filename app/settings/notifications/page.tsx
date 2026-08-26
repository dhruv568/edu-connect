"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, ShieldAlert, CheckCircle2, Loader2, Save } from "lucide-react";

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [prefs, setPrefs] = useState({
    emailCourseUpdates: true,
    emailClassReminders: true,
    emailPaymentUpdates: true,
    emailMarketing: false,
    inAppEnabled: true,
    browserEnabled: false,
  });

  const [userRole, setUserRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");
  const [userName, setUserName] = useState("Notification Preferences");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.user) {
          if (json.data.user.role) setUserRole(json.data.user.role);
          if (json.data.user.firstName) setUserName(`${json.data.user.firstName} ${json.data.user.lastName || ""}`.trim());
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.preferences) {
          setPrefs({
            emailCourseUpdates: json.data.preferences.emailCourseUpdates,
            emailClassReminders: json.data.preferences.emailClassReminders,
            emailPaymentUpdates: json.data.preferences.emailPaymentUpdates,
            emailMarketing: json.data.preferences.emailMarketing,
            inAppEnabled: json.data.preferences.inAppEnabled,
            browserEnabled: json.data.preferences.browserEnabled,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={userRole} userName={userName}>
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Notification Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose which notifications you receive via email and in-app alerts. Transactional & security alerts cannot be disabled.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5" /> Preferences saved successfully!
          </div>
        )}

        <Card className="p-6 space-y-6 border-slate-200 dark:border-slate-800">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" /> Email Notifications
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3 pt-1">
              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Live Class Reminders
                  </div>
                  <p className="text-xs text-slate-500">
                    Receive 24h, 1h, and 10-minute email reminders before your live sessions start.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailClassReminders}
                  onChange={(e) => setPrefs({ ...prefs, emailClassReminders: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Course & LMS Updates
                  </div>
                  <p className="text-xs text-slate-500">
                    Get emails when new lessons, resources, or announcements are published in enrolled courses.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailCourseUpdates}
                  onChange={(e) => setPrefs({ ...prefs, emailCourseUpdates: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Payment Receipts & Billing
                  </div>
                  <p className="text-xs text-slate-500">
                    Receive email receipts for course purchases, class bookings, and refund confirmations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailPaymentUpdates}
                  onChange={(e) => setPrefs({ ...prefs, emailPaymentUpdates: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Promotional & Marketing Emails
                  </div>
                  <p className="text-xs text-slate-500">
                    Occasional updates on top recommended teachers and platform discounts.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailMarketing}
                  onChange={(e) => setPrefs({ ...prefs, emailMarketing: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-600" /> Platform Notifications
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    In-App Notification Bell
                  </div>
                  <p className="text-xs text-slate-500">
                    Display unread badges and drop-down notification popover in your navigation header.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.inAppEnabled}
                  onChange={(e) => setPrefs({ ...prefs, inAppEnabled: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              disabled={saving || loading}
              onClick={handleSave}
              leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            >
              {saving ? "Saving Changes..." : "Save Preferences"}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

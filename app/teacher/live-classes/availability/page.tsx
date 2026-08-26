"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Clock, Save, Plus, Trash2, Calendar, ShieldCheck } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherAvailabilityPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("Educator");
  const [userEmail, setUserEmail] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [availabilities, setAvailabilities] = useState<
    Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>
  >([
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
  ]);

  const [breaks, setBreaks] = useState<Array<{ dayOfWeek: number; startTime: string; endTime: string }>>([
    { dayOfWeek: 1, startTime: "13:00", endTime: "14:00" },
    { dayOfWeek: 2, startTime: "13:00", endTime: "14:00" },
    { dayOfWeek: 3, startTime: "13:00", endTime: "14:00" },
    { dayOfWeek: 4, startTime: "13:00", endTime: "14:00" },
    { dayOfWeek: 5, startTime: "13:00", endTime: "14:00" },
  ]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const profileRes = await fetch("/api/teacher/onboarding");
      const profileJson = await profileRes.json();
      if (profileJson.data) {
        setUserName(`${profileJson.data.profile.firstName} ${profileJson.data.profile.lastName}`.trim() || profileJson.data.user.email);
        setUserEmail(profileJson.data.user.email);
      }

      const res = await fetch("/api/teacher/availability");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.availabilities && json.data.availabilities.length > 0) {
          setAvailabilities(json.data.availabilities);
        }
        if (json.data.breaks && json.data.breaks.length > 0) {
          setBreaks(json.data.breaks);
        }
      }
    } catch (err) {
      console.error("Failed to load availability:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/teacher/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone, availabilities, breaks }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Settings Saved", "Your weekly teaching availability has been updated.", "success");
      } else {
        showToast("Error", json.error?.message || "Failed to save availability.", "error");
      }
    } catch (err) {
      showToast("Error", "Server error while saving availability.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleDayActive = (dayIdx: number) => {
    setAvailabilities((prev) => {
      const existing = prev.find((a) => a.dayOfWeek === dayIdx);
      if (existing) {
        return prev.map((a) => (a.dayOfWeek === dayIdx ? { ...a, isActive: !a.isActive } : a));
      } else {
        return [...prev, { dayOfWeek: dayIdx, startTime: "09:00", endTime: "17:00", isActive: true }];
      }
    });
  };

  const updateTimes = (dayIdx: number, field: "startTime" | "endTime", value: string) => {
    setAvailabilities((prev) =>
      prev.map((a) => (a.dayOfWeek === dayIdx ? { ...a, [field]: value } : a))
    );
  };

  return (
    <DashboardLayout role="TEACHER" userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/teacher/live-classes">
              <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" /> Availability & Buffer Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your weekly teaching hours, breaks, and automated slot conflict prevention.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
          >
            {saving ? "Saving..." : "Save Availability"}
          </Button>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        ) : (
          <div className="space-y-6 max-w-4xl">
            {/* Timezone Configuration */}
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" /> Default Teaching Timezone
              </h3>
              <div className="max-w-md">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                  <option value="America/New_York">America/New_York (EST - UTC-5)</option>
                  <option value="Europe/London">Europe/London (GMT - UTC+0)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST - UTC+4)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+8)</option>
                </select>
              </div>
            </Card>

            {/* Weekly Schedule Grid */}
            <Card className="p-6 space-y-6">
              <h3 className="text-base font-bold text-slate-900">Weekly Available Hours</h3>

              <div className="space-y-3">
                {DAYS.map((dayName, dayIdx) => {
                  const dayAvail = availabilities.find((a) => a.dayOfWeek === dayIdx) || {
                    dayOfWeek: dayIdx,
                    startTime: "09:00",
                    endTime: "17:00",
                    isActive: false,
                  };

                  return (
                    <div
                      key={dayIdx}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition ${
                        dayAvail.isActive ? "bg-white border-slate-200 shadow-xs" : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-40">
                        <input
                          type="checkbox"
                          checked={dayAvail.isActive}
                          onChange={() => toggleDayActive(dayIdx)}
                          className="h-4 w-4 rounded-md text-blue-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-900">{dayName}</span>
                      </div>

                      {dayAvail.isActive ? (
                        <div className="flex items-center gap-3 text-xs">
                          <input
                            type="time"
                            value={dayAvail.startTime}
                            onChange={(e) => updateTimes(dayIdx, "startTime", e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                          />
                          <span className="text-slate-400 font-bold">to</span>
                          <input
                            type="time"
                            value={dayAvail.endTime}
                            onChange={(e) => updateTimes(dayIdx, "endTime", e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

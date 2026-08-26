"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Users, ArrowLeft, Award, AlertTriangle, XCircle } from "lucide-react";
import { LiveSessionDetails } from "@/types/classroom";

interface ClassSummaryProps {
  sessionDetails: LiveSessionDetails;
  isTeacher: boolean;
  userDurationMinutes?: number;
  summaryStats?: {
    totalBooked: number;
    present: number;
    partial: number;
    absent: number;
  };
  attendances?: Array<{
    id: string;
    studentName: string;
    durationMinutes: number;
    status: "PRESENT" | "PARTIAL" | "ABSENT";
  }>;
}

export function ClassSummary({
  sessionDetails,
  isTeacher,
  userDurationMinutes = 0,
  summaryStats,
  attendances = [],
}: ClassSummaryProps) {
  const redirectUrl = isTeacher ? "/teacher" : "/student";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-center space-y-3 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md text-3xl mb-2">
            🎓
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">
            Class Completed!
          </h1>
          <p className="text-sm text-emerald-100 font-medium">
            {sessionDetails.title} • {sessionDetails.subject}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Class Duration</p>
              <p className="text-lg font-extrabold text-white">
                {sessionDetails.durationMinutes || 60} Minutes
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Capacity</p>
              <p className="text-lg font-extrabold text-white">
                {summaryStats ? summaryStats.totalBooked : sessionDetails.maxCapacity} Students
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <Award className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                {isTeacher ? "Present Rate" : "Your Participation"}
              </p>
              <p className="text-lg font-extrabold text-white">
                {isTeacher
                  ? `${summaryStats ? summaryStats.present : 0} Present`
                  : `${userDurationMinutes} Minutes`}
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Roster (For Teacher) */}
        {isTeacher && attendances.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Session Attendance Report
            </h3>

            <div className="space-y-2">
              {attendances.map((att) => (
                <div
                  key={att.id}
                  className="bg-slate-800/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {att.status === "PRESENT" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    {att.status === "PARTIAL" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                    {att.status === "ABSENT" && <XCircle className="h-4 w-4 text-red-400" />}
                    <span className="font-bold text-white">{att.studentName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{att.durationMinutes} min attended</span>
                    <Badge
                      variant={
                        att.status === "PRESENT"
                          ? "success"
                          : att.status === "PARTIAL"
                          ? "warning"
                          : "error"
                      }
                      className="text-[10px]"
                    >
                      {att.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <Link href={redirectUrl}>
            <Button className="h-12 px-8 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

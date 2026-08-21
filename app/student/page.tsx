import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, CalendarCheck, Flame, Search } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <DashboardLayout role="STUDENT" userName="Alex Morgan" userEmail="student@educonnect.com">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black">Welcome Back, Alex! 👋</h1>
            <p className="text-xs text-emerald-100">
              Grade 10 • STEM & Advanced Algebra Track
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-700/60 px-4 py-2 rounded-2xl border border-emerald-500/40">
            <Flame className="h-5 w-5 text-amber-300 animate-pulse" />
            <span className="text-xs font-bold">7 Day Learning Streak!</span>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Upcoming Live Slot</span>
              <Badge variant="student">Live</Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900">Calculus Olympiad Prep</h3>
            <p className="text-xs text-slate-500">With Sarah Jenkins • Today @ 5:00 PM</p>
            <Button variant="student" size="sm" className="w-full">
              Join Live Classroom
            </Button>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Demo Sessions</span>
              <Badge variant="primary">1 Scheduled</Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900">Physics Demo Class</h3>
            <p className="text-xs text-slate-500">Tomorrow @ 3:30 PM</p>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Find New Tutors</span>
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Explore Marketplace</h3>
            <p className="text-xs text-slate-500">Search over 500+ verified STEM educators</p>
            <Button variant="secondary" size="sm" className="w-full">
              Browse Teachers
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

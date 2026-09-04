"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DynamicDashboard } from "@/components/dashboard/dynamic-dashboard";
import { useAuthPermissions } from "@/components/shared/permission-guard";

export default function StaffDashboardPage() {
  const { user, roleName } = useAuthPermissions();

  return (
    <DashboardLayout
      role="STAFF"
      userName={user?.name || "Staff Member"}
      userEmail={user?.email || undefined}
    >
      <DynamicDashboard />
    </DashboardLayout>
  );
}

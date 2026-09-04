"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DynamicDashboard } from "@/components/dashboard/dynamic-dashboard";
import { useAuthPermissions } from "@/components/shared/permission-guard";

export default function AdminDashboardPage() {
  const { user } = useAuthPermissions();

  return (
    <DashboardLayout
      role="ADMIN"
      userName={user?.name || "System Administrator"}
      userEmail={user?.email || undefined}
    >
      <DynamicDashboard />
    </DashboardLayout>
  );
}

import React from "react";
import { OFFICIAL_COMPANY_INFO } from "@/lib/company";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-6 mt-auto border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-500 font-medium">
      <p>© {currentYear} {OFFICIAL_COMPANY_INFO.brandName || "EduConnects"}. All rights reserved.</p>
    </footer>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  isAiAssistantExcluded,
  getSectionTheme,
  AssistantRole,
} from "@/lib/ai/assistant-config";
import { AIAssistantButton } from "./ai-assistant-button";
import { AIAssistantModal } from "./ai-assistant-modal";

export const AIAssistantProvider: React.FC = () => {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<AssistantRole>("guest");

  // Determine exclusion
  const isExcluded = isAiAssistantExcluded(pathname);

  // Determine section theme (home, learner, educator, admin)
  const themeType = getSectionTheme(pathname, role);

  // Fetch session role once on mount or pathname change
  useEffect(() => {
    let isMounted = true;
    async function fetchRole() {
      try {
        const res = await fetch("/api/ai/session");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.data?.role) {
            setRole(data.data.role);
          }
        }
      } catch {
        // Fallback gracefully to guest/url-based role
      }
    }
    fetchRole();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // If on excluded page (classroom, checkout, auth/OTP forms), do not render
  if (isExcluded) {
    return null;
  }

  return (
    <>
      <AIAssistantButton
        isOpen={isOpen}
        onClick={() => setIsOpen(true)}
        themeType={themeType}
      />
      <AIAssistantModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        role={role}
        themeType={themeType}
      />
    </>
  );
};

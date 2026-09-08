"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "edu_internal_nav_history";
const MAX_HISTORY = 30;

function NavigationHistoryListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    try {
      const search = searchParams?.toString();
      const currentUrl = search ? `${pathname}?${search}` : pathname;

      const rawHistory = sessionStorage.getItem(STORAGE_KEY);
      let history: string[] = rawHistory ? JSON.parse(rawHistory) : [];

      if (!Array.isArray(history)) {
        history = [];
      }

      // Avoid pushing consecutive identical URLs
      const lastUrl = history[history.length - 1];
      if (lastUrl !== currentUrl) {
        history.push(currentUrl);
        if (history.length > MAX_HISTORY) {
          history = history.slice(-MAX_HISTORY);
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    } catch {
      // Ignore storage errors (private browsing or quota exceeded)
    }
  }, [pathname, searchParams]);

  return null;
}

export function NavigationHistoryTracker() {
  return (
    <Suspense fallback={null}>
      <NavigationHistoryListener />
    </Suspense>
  );
}

/**
 * Check whether a safe internal previous page exists in the current session.
 */
export function canGoBackInternal(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const rawHistory = sessionStorage.getItem(STORAGE_KEY);
    if (rawHistory) {
      const history: string[] = JSON.parse(rawHistory);
      if (Array.isArray(history) && history.length >= 2) {
        const prevUrl = history[history.length - 2];
        if (prevUrl && typeof prevUrl === "string" && prevUrl.startsWith("/")) {
          return true;
        }
      }
    }

    // Secondary check: window.history length and document.referrer
    if (
      document.referrer &&
      document.referrer.startsWith(window.location.origin) &&
      window.history.length > 1
    ) {
      return true;
    }
  } catch {
    // Default to false on error
  }

  return false;
}

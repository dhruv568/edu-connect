"use client";

import React from "react";
import { Sparkles, MessageSquare, Bot } from "lucide-react";
import { THEMES, ThemeConfig } from "@/lib/ai/assistant-config";

interface AIAssistantButtonProps {
  isOpen: boolean;
  onClick: () => void;
  themeType: "home" | "learner" | "educator" | "admin";
  unreadCount?: number;
}

export const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({
  isOpen,
  onClick,
  themeType,
  unreadCount = 0,
}) => {
  const theme = THEMES[themeType] || THEMES.home;

  if (isOpen) {
    return null; // Hidden when chat panel is open
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center select-none">
      {/* Floating Action Button */}
      <button
        onClick={onClick}
        aria-label="Open EduConnects AI Assistant"
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-teal-500/40 ${theme.floatingButtonBg}`}
      >
        {/* Soft pulsing halo */}
        <span className="absolute -inset-1 rounded-full bg-current opacity-20 animate-ping pointer-events-none" />

        {/* Assistant Icon with subtle sparkle */}
        <div className="relative flex items-center justify-center">
          <Bot className="w-7 h-7 transition-transform group-hover:rotate-6" />
          <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-300 animate-pulse" />
        </div>

        {/* Tooltip on hover for desktop */}
        <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md hidden sm:block">
          Ask EduConnects AI
        </span>

        {/* Optional notification / first-time badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white shadow">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

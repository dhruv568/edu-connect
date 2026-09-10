"use client";

import React, { useState, useEffect } from "react";
import { liveEventConfig } from "@/lib/live-event-config";

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export interface LiveCountdownProps {
  targetDateISO?: string;
  onComplete?: () => void;
}

export function calculateTimeRemaining(targetISO: string): CountdownTime {
  const targetTime = new Date(targetISO).getTime();
  const nowTime = new Date().getTime();
  const difference = targetTime - nowTime;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return { days, hours, minutes, seconds, isComplete: false };
}

export function LiveCountdown({
  targetDateISO = liveEventConfig.startDateTime,
  onComplete,
}: LiveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(() =>
    calculateTimeRemaining(targetDateISO)
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(targetDateISO);
      setTimeLeft(remaining);
      if (remaining.isComplete) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateISO, onComplete]);

  // Format with leading zero if less than 10
  const formatNum = (num: number) => String(num).padStart(2, "0");

  if (!isMounted) {
    return (
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg w-full">
        {["Days", "Hours", "Minutes", "Seconds"].map((unit, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#073F3C]/90 border border-[#F2C14E]/30 text-white shadow-xl backdrop-blur-md"
          >
            <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-[#F2C14E]">
              00
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-teal-100/80 mt-1">
              {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (timeLeft.isComplete) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#073F3C] border-2 border-[#F2C14E] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl animate-pulse">
        <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
        <span>🔴 LIVE NOW — The event is in session!</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg w-full">
      {/* Days Card */}
      <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#073F3C]/90 border border-[#F2C14E]/40 shadow-xl backdrop-blur-md group hover:border-[#F2C14E] hover:scale-105 transition-all">
        <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-b from-[#F2C14E] via-yellow-200 to-[#F2C14E] bg-clip-text text-transparent drop-shadow-sm">
          {formatNum(timeLeft.days)}
        </span>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-teal-100/90 mt-1">
          Days
        </span>
      </div>

      {/* Hours Card */}
      <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#073F3C]/90 border border-[#F2C14E]/40 shadow-xl backdrop-blur-md group hover:border-[#F2C14E] hover:scale-105 transition-all">
        <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-b from-[#F2C14E] via-yellow-200 to-[#F2C14E] bg-clip-text text-transparent drop-shadow-sm">
          {formatNum(timeLeft.hours)}
        </span>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-teal-100/90 mt-1">
          Hours
        </span>
      </div>

      {/* Minutes Card */}
      <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#073F3C]/90 border border-[#F2C14E]/40 shadow-xl backdrop-blur-md group hover:border-[#F2C14E] hover:scale-105 transition-all">
        <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-b from-[#F2C14E] via-yellow-200 to-[#F2C14E] bg-clip-text text-transparent drop-shadow-sm">
          {formatNum(timeLeft.minutes)}
        </span>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-teal-100/90 mt-1">
          Minutes
        </span>
      </div>

      {/* Seconds Card */}
      <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#073F3C]/90 border border-[#F2C14E]/40 shadow-xl backdrop-blur-md group hover:border-[#F2C14E] hover:scale-105 transition-all">
        <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-b from-[#F2C14E] via-yellow-200 to-[#F2C14E] bg-clip-text text-transparent drop-shadow-sm">
          {formatNum(timeLeft.seconds)}
        </span>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-teal-100/90 mt-1">
          Seconds
        </span>
      </div>
    </div>
  );
}

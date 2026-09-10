"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Sparkles, Bell, Video, Play, ArrowRight, CheckCircle2 } from "lucide-react";
import { liveEventConfig, EventStatus } from "@/lib/live-event-config";
import { LiveCountdown } from "./live-countdown";
import { LiveArtwork } from "./live-artwork";

export interface LiveHeroProps {
  eventStatus: EventStatus;
  onOpenRegisterModal: () => void;
  onJoinLiveClick: () => void;
}

export function LiveHero({
  eventStatus,
  onOpenRegisterModal,
  onJoinLiveClick,
}: LiveHeroProps) {
  const getPrimaryCta = () => {
    if (eventStatus === "DURING_EVENT") {
      return (
        <button
          type="button"
          onClick={onJoinLiveClick}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-2xl shadow-red-600/40 ring-4 ring-amber-400/60 hover:ring-amber-300 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group animate-pulse"
        >
          <span className="h-3 w-3 rounded-full bg-white animate-ping" />
          <span>🔴 Join Live Now</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>
      );
    }

    if (eventStatus === "AFTER_EVENT") {
      if (liveEventConfig.recordingUrl) {
        return (
          <a
            href={liveEventConfig.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-2xl shadow-amber-500/30 ring-2 ring-white/50 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Play className="h-5 w-5 fill-slate-950" />
            <span>▶ Watch Recording</span>
          </a>
        );
      }
      return (
        <button
          type="button"
          disabled
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800 text-amber-200 font-extrabold text-sm uppercase tracking-wider cursor-not-allowed opacity-80 border border-amber-400/30 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-5 w-5 text-amber-400" />
          <span>Event Completed</span>
        </button>
      );
    }

    // BEFORE_EVENT
    return (
      <button
        type="button"
        onClick={onOpenRegisterModal}
        className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-2xl shadow-amber-500/30 ring-4 ring-amber-300/60 hover:ring-white hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 group"
      >
        <Bell className="h-5 w-5 text-slate-950 group-hover:rotate-12 transition-transform" />
        <span>🔔 Register for Live Event</span>
        <ArrowRight className="h-5 w-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
      </button>
    );
  };

  return (
    <section className="relative pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-24 bg-gradient-to-b from-[#073F3C] via-[#0B4F4B] to-[#073F3C] text-white overflow-hidden font-sans border-b border-[#F2C14E]/30">
      {/* Ambient Lighting Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#F2C14E]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-[#1B6863]/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* HERO LEFT CONTENT */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Gold Outlined Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F2C14E]/15 border-2 border-[#F2C14E] text-[#F2C14E] text-xs sm:text-sm font-black uppercase tracking-widest shadow-lg shadow-[#F2C14E]/10 backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4 text-[#F2C14E] animate-spin" style={{ animationDuration: "8s" }} />
              <span>{liveEventConfig.heroBadge}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
                Learn. Connect.{" "}
                <span className="bg-gradient-to-r from-[#F2C14E] via-yellow-200 to-[#F2C14E] bg-clip-text text-transparent drop-shadow-sm">
                  Grow. Live.
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-100 tracking-wide">
                {liveEventConfig.heroSubheadline}
              </p>
              <p className="text-sm sm:text-base text-teal-100/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed pt-1">
                {liveEventConfig.heroDescription}
              </p>
            </motion.div>

            {/* EVENT INFORMATION CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-[#073F3C]/90 border border-[#F2C14E]/40 shadow-xl backdrop-blur-md text-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F2C14E]/15 text-[#F2C14E] border border-[#F2C14E]/30">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-sm sm:text-base font-extrabold text-white">
                  {liveEventConfig.displayDate}
                </span>
              </div>

              <div className="hidden sm:block w-px h-8 bg-[#F2C14E]/30" />

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F2C14E]/15 text-[#F2C14E] border border-[#F2C14E]/30">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-sm sm:text-base font-extrabold text-[#F2C14E]">
                  {liveEventConfig.displayTime}
                </span>
              </div>
            </motion.div>

            {/* COUNTDOWN TIMER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-2 flex flex-col items-center lg:items-start space-y-2"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300/80">
                Event Starts In
              </p>
              <LiveCountdown targetDateISO={liveEventConfig.startDateTime} />
            </motion.div>

            {/* HERO CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 w-full"
            >
              {getPrimaryCta()}

              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 text-white font-extrabold text-sm sm:text-base uppercase tracking-wider border border-amber-400/40 hover:bg-amber-400/20 hover:border-amber-300 transition-all flex items-center justify-center gap-2"
              >
                <span>📱 Get Event Updates</span>
              </button>
            </motion.div>
          </div>

          {/* HERO RIGHT ARTWORK */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 w-full flex justify-center"
          >
            <LiveArtwork />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

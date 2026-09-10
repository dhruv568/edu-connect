"use client";

import React, { useState, useEffect } from "react";
import { Video, Radio, Clock, Play, Sparkles, AlertCircle } from "lucide-react";
import { liveEventConfig, EventStatus } from "@/lib/live-event-config";
import { LiveCountdown } from "./live-countdown";

export interface LiveSessionSectionProps {
  eventStatus: EventStatus;
  onOpenRegisterModal?: () => void;
}

export function LiveSessionSection({
  eventStatus,
  onOpenRegisterModal,
}: LiveSessionSectionProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>("wss://demo.livekit.cloud");
  const [isJoining, setIsJoining] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const fetchLiveToken = async () => {
    setIsJoining(true);
    setLiveError(null);
    try {
      const res = await fetch("/api/events/live-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Live Attendee" }),
      });
      const json = await res.json();
      if (res.ok && json.data?.token) {
        setToken(json.data.token);
        if (json.data.serverUrl) setServerUrl(json.data.serverUrl);
      } else {
        setLiveError(json.error || "Could not retrieve live stream session token.");
      }
    } catch {
      setLiveError("Connection error while requesting live stream credentials.");
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    if (eventStatus === "DURING_EVENT") {
      fetchLiveToken();
    }
  }, [eventStatus]);

  return (
    <section id="live-session" className="py-16 sm:py-24 bg-slate-900 text-white font-sans relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-red-900/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-widest">
            <Radio className="h-4 w-4 animate-pulse text-red-500" />
            <span>EduConnects Broadcast</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            🔴 Join the Live Session
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Experience real-time interactive classrooms with EduConnects educators.
          </p>
        </div>

        {/* CONTAINER DISPLAY BASED ON STATUS */}
        <div className="w-full max-w-4xl mx-auto rounded-3xl border-2 border-amber-400/40 bg-slate-950 shadow-2xl p-6 sm:p-10 overflow-hidden relative min-h-[360px] flex flex-col items-center justify-center">
          
          {/* STATE 1: BEFORE EVENT */}
          {eventStatus === "BEFORE_EVENT" && (
            <div className="space-y-6 max-w-lg py-4">
              <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-amber-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  The live session hasn&apos;t started yet.
                </h3>
                <p className="text-sm text-slate-400">
                  The event stream will open live on {liveEventConfig.displayDate} at {liveEventConfig.displayTime}.
                </p>
              </div>

              <div className="pt-2 flex flex-col items-center">
                <LiveCountdown targetDateISO={liveEventConfig.startDateTime} />
              </div>

              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
              >
                🔔 Register to Get Direct Live Notification
              </button>
            </div>
          )}

          {/* STATE 2: DURING EVENT */}
          {eventStatus === "DURING_EVENT" && (
            <div className="w-full h-full space-y-4">
              {token ? (
                <div className="w-full aspect-video rounded-2xl bg-black border border-slate-800 flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="flex items-center gap-2 text-red-500 font-extrabold text-sm uppercase tracking-wider animate-pulse">
                    <Radio className="h-5 w-5" /> Live Stream Connected
                  </div>
                  <p className="text-sm font-semibold text-slate-300 max-w-md">
                    You are connected to room <code className="text-amber-400 font-mono">edu-session-{liveEventConfig.slug}</code> via LiveKit Cloud.
                  </p>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1 text-left w-full max-w-md">
                    <p><strong className="text-white">Server URL:</strong> {serverUrl}</p>
                    <p><strong className="text-white">Role:</strong> Audience Member</p>
                  </div>
                </div>
              ) : isJoining ? (
                <div className="py-12 space-y-3">
                  <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-amber-300">Connecting to LiveKit Room...</p>
                </div>
              ) : (
                <div className="py-12 space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                    <Radio className="h-8 w-8 text-red-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">🔴 Live Event in Session</h3>
                  <p className="text-sm text-slate-300">
                    {liveError || "🔴 Live session will appear here when the event starts."}
                  </p>
                  <button
                    type="button"
                    onClick={fetchLiveToken}
                    className="px-6 py-2.5 rounded-full bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors"
                  >
                    Refresh Live Room Connection
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: AFTER EVENT */}
          {eventStatus === "AFTER_EVENT" && (
            <div className="space-y-6 max-w-lg py-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto border border-slate-700">
                <Video className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  This live event has ended.
                </h3>
                <p className="text-sm text-slate-400">
                  Thank you to everyone who joined our EduConnects Grand Opening session!
                </p>
              </div>

              {liveEventConfig.recordingUrl ? (
                <a
                  href={liveEventConfig.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider hover:scale-105 transition-transform"
                >
                  <Play className="h-4 w-4 fill-slate-950" />
                  <span>Watch Recording</span>
                </a>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  ▶ Recording coming soon
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

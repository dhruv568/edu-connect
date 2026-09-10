"use client";

import React from "react";
import { GraduationCap, Sparkles, Video, Users, Award, Calendar, Star } from "lucide-react";
import { liveEventConfig } from "@/lib/live-event-config";

export function LiveArtwork() {
  return (
    <div className="relative w-full max-w-md lg:max-w-lg mx-auto aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-3xl p-1 bg-gradient-to-br from-[#F2C14E] via-[#1B6863] to-[#0B4F4B] shadow-2xl shadow-[#073F3C]/60 group hover:shadow-[#F2C14E]/20 transition-all duration-500">
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#F2C14E] via-[#1B6863] to-[#0B4F4B] rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />

      {/* Main Inner Card */}
      <div className="relative h-full w-full rounded-[1.4rem] bg-gradient-to-b from-[#073F3C] via-[#0B4F4B] to-[#073F3C] overflow-hidden p-6 sm:p-8 flex flex-col justify-between border border-[#F2C14E]/30">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2C14E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1B6863]/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Decorative Golden Corner Frames */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#F2C14E]/70 rounded-tl" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#F2C14E]/70 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#F2C14E]/70 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#F2C14E]/70 rounded-br" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2C14E]/15 border border-[#F2C14E]/40 text-[#F2C14E] text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#F2C14E] animate-spin" style={{ animationDuration: "10s" }} />
            <span>Grand Launch 2026</span>
          </div>

          <div className="flex items-center gap-1 text-[#F2C14E] text-xs font-bold bg-black/30 px-2.5 py-1 rounded-full border border-[#F2C14E]/30">
            <Star className="h-3.5 w-3.5 fill-[#F2C14E] text-[#F2C14E]" />
            <span>EduConnects</span>
          </div>
        </div>

        {/* Central Graphic Composition */}
        <div className="my-auto py-6 flex flex-col items-center text-center space-y-5 z-10">
          {/* Emblem Icon */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#F2C14E] to-[#1B6863] rounded-full blur-lg opacity-40 animate-pulse" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#F2C14E] via-yellow-400 to-[#1B6863] p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-[1.4rem] bg-[#073F3C] flex items-center justify-center text-[#F2C14E]">
                <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-[#F2C14E]" />
              </div>
            </div>
          </div>

          {/* Banner Title */}
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
              EduConnects <span className="text-[#F2C14E]">Live</span>
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-teal-100/90 tracking-wide">
              Official Grand Opening Ceremony
            </p>
          </div>

          {/* Feature Badges inside Artwork */}
          <div className="grid grid-cols-2 gap-2.5 w-full pt-2">
            <div className="p-2.5 rounded-xl bg-[#F2C14E]/10 border border-[#F2C14E]/20 backdrop-blur-sm flex items-center gap-2 text-left">
              <Video className="h-4 w-4 text-[#F2C14E] shrink-0" />
              <div>
                <p className="text-[10px] font-extrabold text-[#F2C14E] uppercase">Live Session</p>
                <p className="text-[11px] font-bold text-white leading-none">Interactive</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F2C14E]/10 border border-[#F2C14E]/20 backdrop-blur-sm flex items-center gap-2 text-left">
              <Users className="h-4 w-4 text-[#F2C14E] shrink-0" />
              <div>
                <p className="text-[10px] font-extrabold text-[#F2C14E] uppercase">Educators</p>
                <p className="text-[11px] font-bold text-white leading-none">Top Mentors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Event Tag */}
        <div className="pt-4 border-t border-[#F2C14E]/20 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 text-teal-100">
            <Calendar className="h-4 w-4 text-[#F2C14E]" />
            <span className="font-bold text-[11px] sm:text-xs">{liveEventConfig.displayDate}</span>
          </div>
          <span className="font-extrabold text-[#F2C14E] text-[11px] bg-[#F2C14E]/15 px-2.5 py-0.5 rounded-md border border-[#F2C14E]/30">
            {liveEventConfig.displayTime}
          </span>
        </div>
      </div>
    </div>
  );
}

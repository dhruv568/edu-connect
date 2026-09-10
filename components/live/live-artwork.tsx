"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Star } from "lucide-react";

export function LiveArtwork() {
  return (
    <div className="relative w-full max-w-md lg:max-w-lg mx-auto group">
      {/* Outer Golden/Festive Glow Halo */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] rounded-3xl blur-xl opacity-40 group-hover:opacity-75 transition duration-500" />

      {/* Main Poster Container Card */}
      <div className="relative rounded-3xl p-2 bg-gradient-to-br from-[#FFD700] via-[#9E1B1B] to-[#4A0000] shadow-2xl shadow-red-950/80 transition-all duration-500 border border-[#FFD700]/50 overflow-hidden">
        {/* Top Floating Badge Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-[#FFD700]/60 text-[#FFD700] text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg">
            <Sparkles className="h-3.5 w-3.5 text-[#FFD700] animate-spin" style={{ animationDuration: "10s" }} />
            <span>Ganesh Chaturthi Special</span>
          </div>

          <div className="flex items-center gap-1 text-[#FFD700] text-xs font-black bg-black/60 px-3 py-1 rounded-full border border-[#FFD700]/60 backdrop-blur-md shadow-lg">
            <Star className="h-3.5 w-3.5 fill-[#FFD700] text-[#FFD700]" />
            <span>EduConnects</span>
          </div>
        </div>

        {/* Decorative Golden Corner Elements */}
        <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-[#FFD700] rounded-tl z-20 pointer-events-none" />
        <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-[#FFD700] rounded-tr z-20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-[#FFD700] rounded-bl z-20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-[#FFD700] rounded-br z-20 pointer-events-none" />

        {/* High-Resolution Poster Image */}
        <div className="relative w-full aspect-square rounded-[1.2rem] overflow-hidden bg-slate-950 border border-[#FFD700]/30 shadow-inner">
          <Image
            src="/live-poster.jpg"
            alt="EduConnects Grand Opening on Ganesh Chaturthi with Neeraj Shrivastava"
            width={1080}
            height={1080}
            priority
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
          />
          {/* Subtle Bottom Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

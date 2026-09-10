"use client";

import React from "react";
import { Clock, Star, Sparkles, CheckCircle2, User } from "lucide-react";
import { liveEventConfig, ScheduleItem } from "@/lib/live-event-config";

export function LiveScheduleSection() {
  const schedule: ScheduleItem[] = liveEventConfig.schedule;

  return (
    <section id="schedule" className="py-16 sm:py-24 bg-[#F5F7F8] text-[#102A2A] font-sans border-b border-[#DCE5E4]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-[#0B4F4B] bg-[#0B4F4B]/10 px-3.5 py-1 rounded-full border border-[#0B4F4B]/20">
            Event Timeline
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102A2A] tracking-tight">
            Live Event Schedule
          </h2>
          <p className="text-[#5D7373] text-sm sm:text-base leading-relaxed">
            Data-driven timeline for our Grand Opening ceremony on {liveEventConfig.displayDate}.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-[#0B4F4B] pl-6 sm:pl-10 ml-4 sm:ml-8 space-y-8 sm:space-y-10">
          {schedule.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-110 ${
                  item.isHighlight
                    ? "bg-[#F2C14E] border-[#0B4F4B] text-[#102A2A] shadow-md"
                    : "bg-[#0B4F4B] border-[#DCE5E4] text-white"
                }`}
              >
                {item.isHighlight ? (
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-[#102A2A] text-[#102A2A]" />
                ) : (
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                )}
              </div>

              {/* Schedule Card */}
              <div
                className={`p-5 sm:p-7 rounded-3xl border-2 transition-all duration-300 ${
                  item.isHighlight
                    ? "bg-[#FBF7EE] border-[#F2C14E] shadow-lg"
                    : "bg-white border-[#DCE5E4] shadow-md hover:border-[#0B4F4B]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE5E4]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B4F4B] bg-[#E6F0EF] px-3 py-1 rounded-full border border-[#0B4F4B]/20">
                      {item.time}
                    </span>
                    {item.isHighlight && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#102A2A] bg-[#F2C14E] px-2.5 py-0.5 rounded-full">
                        Key Highlight
                      </span>
                    )}
                  </div>

                  {item.speaker && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#5D7373]">
                      <User className="h-3.5 w-3.5 text-[#0B4F4B]" />
                      <span>{item.speaker}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 space-y-1">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#102A2A] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5D7373] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

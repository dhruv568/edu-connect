"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassBadge } from "@/components/glass/glass-badge";
import { GlassButton } from "@/components/glass/glass-button";
import { Video, Mic, Monitor, MessageSquare, PenTool, Users, Play, ShieldCheck, Send } from "lucide-react";
import { UserRole } from "@/types/auth";

export interface LiveClassroomPreviewProps {
  onOpenAuth: (role: UserRole) => void;
}

export function LiveClassroomPreview({ onOpenAuth }: LiveClassroomPreviewProps) {
  const [activeTab, setActiveTab] = useState<"video" | "whiteboard">("video");
  const [messages, setMessages] = useState([
    { sender: "Alex", text: "Is quadratic formula applicable here?", time: "5:02 PM" },
    { sender: "Mr. Rahul", text: "Yes Alex! Let me draw the parabola on the board.", time: "5:03 PM" },
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages((prev) => [...prev, { sender: "You", text: inputMsg, time: "5:05 PM" }]);
    setInputMsg("");
  };

  return (
    <section id="classroom" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Live Classroom Integration
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Built-in Live Virtual Classroom
          </h2>
          <p className="text-base text-slate-600">
            No third-party app downloads required. EduConnect hosts seamless live classes directly on the platform.
          </p>
        </div>

        {/* Realistic Virtual Classroom Shell */}
        <GlassCard glowColor="rgba(37, 99, 235, 0.2)" className="p-6 sm:p-8 max-w-5xl mx-auto border-2 border-white/90 shadow-2xl">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500 text-white animate-pulse">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Advanced Calculus & Graphing</h3>
                  <GlassBadge variant="rose" size="sm">LIVE NOW</GlassBadge>
                </div>
                <p className="text-xs text-slate-500">Instructor: Sarah Jenkins • Room 4B</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("video")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "video" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700"
                }`}
              >
                Video Feed
              </button>
              <button
                onClick={() => setActiveTab("whiteboard")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "whiteboard" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700"
                }`}
              >
                Interactive Whiteboard
              </button>
            </div>
          </div>

          {/* Main Stage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 min-h-[380px]">
            {/* Main Stage Area */}
            <div className="lg:col-span-8 bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center p-4">
              {activeTab === "video" ? (
                <div className="relative w-full h-full flex flex-col justify-between min-h-[320px]">
                  {/* Main Video Stream Frame */}
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                    alt="Teacher Stream"
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                  <div className="relative z-10 p-3 flex justify-between items-start">
                    <span className="text-xs font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-md">
                      Instructor Stream
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> 1080p HD
                    </span>
                  </div>

                  {/* Student Avatars Overlay */}
                  <div className="relative z-10 p-3 flex items-center justify-between bg-gradient-to-t from-slate-950/90 to-transparent rounded-b-2xl">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-slate-200 font-medium">Sarah Speaking...</span>
                    </div>
                    <div className="flex items-center -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[10px] ring-2 ring-slate-900">A</div>
                      <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px] ring-2 ring-slate-900">M</div>
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] ring-2 ring-slate-900">E</div>
                      <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-[10px] ring-2 ring-slate-900">+21</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full min-h-[320px] bg-slate-950 rounded-xl p-4 flex flex-col justify-between text-white relative">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-bold">
                    <span className="flex items-center gap-2 text-indigo-400"><PenTool className="h-4 w-4" /> Live Parabola Canvas</span>
                    <span className="text-slate-500">Shared Whiteboard</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-mono text-indigo-400">y = ax² + bx + c</div>
                      <p className="text-xs text-slate-400">Teacher is drawing a quadratic curve...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Chat Panel */}
            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-blue-600" /> Class Q&A Chat
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">24 Online</span>
                </div>

                <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                  {messages.map((m, idx) => (
                    <div key={idx} className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                      <div className="flex justify-between font-bold text-[11px] mb-0.5">
                        <span className={m.sender === "Mr. Rahul" ? "text-indigo-600" : "text-blue-600"}>{m.sender}</span>
                        <span className="text-[9px] text-slate-400">{m.time}</span>
                      </div>
                      <p className="text-slate-700">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendMsg} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

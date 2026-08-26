"use client";

import React, { useState } from "react";
import { ClassroomParticipant } from "@/types/classroom";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Camera, CameraOff, Sparkles, UserX, Shield, Search, PenTool } from "lucide-react";

interface ParticipantsPanelProps {
  participants: ClassroomParticipant[];
  currentUserId: string;
  isTeacher: boolean;
  studentCanDraw: boolean;
  onToggleStudentDraw: (enabled: boolean) => void;
  onMuteStudent: (targetUserId: string) => void;
  onSpotlightParticipant: (targetUserId: string, spotlight: boolean) => void;
  onRemoveStudent: (targetUserId: string) => void;
  onClose: () => void;
}

export function ParticipantsPanel({
  participants,
  currentUserId,
  isTeacher,
  studentCanDraw,
  onToggleStudentDraw,
  onMuteStudent,
  onSpotlightParticipant,
  onRemoveStudent,
  onClose,
}: ParticipantsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden text-slate-100">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Participants</h3>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
            {participants.length}
          </Badge>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-semibold"
        >
          Close
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search participant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Teacher Control: Student Draw Permissions */}
      {isTeacher && (
        <div className="p-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-200">Allow Student Drawing</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleStudentDraw(!studentCanDraw)}
            className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
              studentCanDraw ? "bg-blue-600" : "bg-slate-800 border border-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                studentCanDraw ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      )}

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((p) => {
          const isMe = p.userId === currentUserId;
          const isTargetTeacher = p.role === "TEACHER";

          return (
            <div
              key={p.userId}
              className="bg-slate-800/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">{p.name}</span>
                    {isMe && <span className="text-[10px] text-slate-400">(You)</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant={isTargetTeacher ? "teacher" : "student"}
                      className="text-[9px] px-1.5 py-0"
                    >
                      {isTargetTeacher ? "Educator" : "Student"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Right Media Icons & Moderation Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Media indicators */}
                {p.isMicOn ? (
                  <Mic className="h-4 w-4 text-emerald-400" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-400" />
                )}
                {p.isCameraOn ? (
                  <Camera className="h-4 w-4 text-blue-400" />
                ) : (
                  <CameraOff className="h-4 w-4 text-slate-500" />
                )}

                {/* Teacher Moderation Actions */}
                {isTeacher && !isTargetTeacher && !isMe && (
                  <div className="flex items-center gap-1 ml-1 border-l border-slate-700 pl-2">
                    {/* Mute Student */}
                    <button
                      type="button"
                      onClick={() => onMuteStudent(p.userId)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400"
                      title="Mute Student"
                    >
                      <MicOff className="h-3.5 w-3.5" />
                    </button>

                    {/* Spotlight Participant */}
                    <button
                      type="button"
                      onClick={() => onSpotlightParticipant(p.userId, !p.isSpotlighted)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        p.isSpotlighted
                          ? "bg-amber-500/20 text-amber-400"
                          : "hover:bg-slate-700 text-slate-400 hover:text-amber-400"
                      }`}
                      title={p.isSpotlighted ? "Remove Spotlight" : "Spotlight Student"}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </button>

                    {/* Remove Student */}
                    <button
                      type="button"
                      onClick={() => onRemoveStudent(p.userId)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      title="Remove Student from Room"
                    >
                      <UserX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

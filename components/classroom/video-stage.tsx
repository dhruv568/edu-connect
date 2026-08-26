"use client";

import React, { useEffect, useRef } from "react";
import { ClassroomParticipant } from "@/types/classroom";
import { CameraOff, MicOff, Monitor, Sparkles, User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VideoStageProps {
  participants: ClassroomParticipant[];
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  currentUserId: string;
  isTeacher: boolean;
  spotlightUserId?: string | null;
  activeSpeakerId?: string | null;
  permissionError?: string | null;
}

export function VideoStage({
  participants,
  localStream,
  screenStream,
  currentUserId,
  isTeacher,
  spotlightUserId,
  activeSpeakerId,
  permissionError,
}: VideoStageProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Attach local media stream to local video tag
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach screen share stream to screen video tag
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const teacherParticipant = participants.find((p) => p.role === "TEACHER");
  const studentParticipants = participants.filter((p) => p.role === "STUDENT");
  const isScreenSharing = !!screenStream;

  return (
    <div className="flex-1 bg-slate-950 p-4 flex flex-col gap-4 overflow-hidden relative">
      {/* Permission Error Banner */}
      {permissionError && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-3 flex items-center gap-3 text-red-200 text-xs z-20">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Main Screen Share View */}
      {isScreenSharing && (
        <div className="relative flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-400 flex items-center gap-2">
            <Monitor className="h-4 w-4" /> Live Screen Sharing
          </div>
        </div>
      )}

      {/* Main Video Area (When not screen sharing) */}
      {!isScreenSharing && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* Main Stage Spotlight (Teacher or Spotlighted Student) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden relative flex items-center justify-center shadow-2xl group">
            {/* If Current User is Teacher & Local Stream available */}
            {isTeacher && localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            )}

            {/* If Teacher or Participant Video is turned off */}
            {(!isTeacher || !localStream) && (
              <div className="flex flex-col items-center justify-center gap-4 text-slate-400 p-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
                  {teacherParticipant ? teacherParticipant.name.charAt(0) : "T"}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">
                    {teacherParticipant ? teacherParticipant.name : "Teacher"}
                  </h3>
                  <p className="text-xs text-slate-500">Educator Stream Active</p>
                </div>
              </div>
            )}

            {/* Overlays */}
            <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-2">
              <span>{teacherParticipant ? teacherParticipant.name : "Teacher"}</span>
              <Badge variant="teacher" className="text-[10px]">Educator</Badge>
            </div>

            {/* Active Speaker / Mute Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {activeSpeakerId === (teacherParticipant?.userId || currentUserId) && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" /> Speaking
                </div>
              )}
            </div>
          </div>

          {/* Student Participant Grid Sidebar */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto max-h-[500px] lg:max-h-none pr-1">
            {studentParticipants.length > 0 ? (
              studentParticipants.map((student) => {
                const isLocalStudent = student.userId === currentUserId;
                return (
                  <div
                    key={student.userId}
                    className={`relative aspect-video bg-slate-900 border rounded-2xl overflow-hidden flex items-center justify-center shadow-md transition-all ${
                      student.isSpotlighted
                        ? "border-amber-500/80 ring-2 ring-amber-500/30"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {isLocalStudent && localStream && student.isCameraOn ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-sm font-bold border border-slate-700">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
                          {student.name}
                        </span>
                      </div>
                    )}

                    {/* Status Icons */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-medium text-slate-200 truncate max-w-[110px]">
                        {student.name} {isLocalStudent && "(You)"}
                      </span>
                      <div className="flex items-center gap-1">
                        {!student.isMicOn && (
                          <span className="bg-red-500/80 p-1 rounded-md text-white">
                            <MicOff className="h-3 w-3" />
                          </span>
                        )}
                        {!student.isCameraOn && (
                          <span className="bg-slate-800/80 p-1 rounded-md text-slate-300">
                            <CameraOff className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 text-slate-500">
                <User className="h-8 w-8 text-slate-600" />
                <p className="text-xs font-semibold">No students in room yet</p>
                <p className="text-[11px] text-slate-600">
                  Waiting for booked students to enter
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

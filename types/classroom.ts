import { UserRole } from "@/types/auth";

export type SessionStatus = "SCHEDULED" | "OPEN" | "LIVE" | "ENDED" | "CANCELLED";

export type AttendanceStatus = "PRESENT" | "PARTIAL" | "ABSENT";

export type ConnectionQuality = "CONNECTING" | "CONNECTED" | "POOR_CONNECTION" | "RECONNECTING" | "DISCONNECTED";

export interface ClassroomParticipant {
  userId: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  isMutedByTeacher: boolean;
  isSpotlighted: boolean;
  canDrawOnWhiteboard: boolean;
  connectionQuality: ConnectionQuality;
  joinedAt: string;
}

export interface ClassroomTokenPayload {
  sessionId: string;
  roomId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  isTeacher: boolean;
  expiresAt: number;
}

export interface ClassroomMessageItem {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface ClassroomFileItem {
  id: string;
  sessionId: string;
  uploadedBy: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface WhiteboardElement {
  id: string;
  type: "pen" | "eraser" | "text" | "rectangle" | "circle" | "line" | "arrow" | "highlight";
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  size: number;
}

export interface WhiteboardState {
  elements: WhiteboardElement[];
  version: number;
}

export interface LiveSessionDetails {
  id: string;
  liveClassSlotId: string;
  teacherId: string;
  roomId: string;
  status: SessionStatus;
  scheduledStartAt: string;
  scheduledEndAt: string;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  durationMinutes?: number | null;
  studentCanDraw: boolean;
  title: string;
  subject: string;
  description?: string;
  teacherName: string;
  teacherAvatarUrl?: string;
  price: number;
  maxCapacity: number;
}

export interface DeviceSelection {
  cameraId?: string;
  microphoneId?: string;
  speakerId?: string;
}

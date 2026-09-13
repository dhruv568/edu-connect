"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, Trash2, CheckCircle2, AlertCircle, Loader2, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export interface ProfilePhotoUploaderProps {
  initialAvatarUrl?: string | null;
  userName?: string;
  role?: "TEACHER" | "STUDENT" | "ADMIN" | "STAFF" | string;
  onAvatarUpdated?: (newAvatarUrl: string | null) => void;
  className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function ProfilePhotoUploader({
  initialAvatarUrl,
  userName = "User",
  role = "STUDENT",
  onAvatarUpdated,
  className = "",
}: ProfilePhotoUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentAvatar, setCurrentAvatar] = useState<string | null>(initialAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isTeacher = role === "TEACHER";

  // Role-specific theme styling
  const theme = {
    primaryBtn: isTeacher
      ? "bg-[#0B4F4B] hover:bg-[#073F3C] text-white focus:ring-[#0B4F4B]/30"
      : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/30",
    avatarRing: isTeacher ? "ring-4 ring-[#16805B]/20" : "ring-4 ring-blue-500/20",
    badgeBg: isTeacher ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-blue-50 text-blue-800 border-blue-200",
    avatarBg: isTeacher ? "bg-[#0B4F4B] text-white" : "bg-blue-600 text-white",
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Client-side MIME validation
    const cleanType = (file.type || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.includes(cleanType)) {
      setStatusMessage({
        type: "error",
        text: "Invalid file type. Please select a JPG, PNG, or WebP image.",
      });
      showToast("Invalid Format", "Only JPG, JPEG, PNG, and WebP images are allowed.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Client-side size validation
    if (file.size > MAX_FILE_SIZE) {
      setStatusMessage({
        type: "error",
        text: `Image size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 5MB limit.`,
      });
      showToast("File Too Large", "Profile photo must be under 5MB.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatusMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to upload profile photo. Please try again.");
      }

      const newUrl = json.data.avatarUrl;
      setCurrentAvatar(newUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setStatusMessage({
        type: "success",
        text: "Profile photo updated successfully.",
      });
      showToast("Profile Photo Updated", "Your profile photo has been saved successfully.", "success");

      if (onAvatarUpdated) {
        onAvatarUpdated(newUrl);
      }

      // Notify global auth listeners (updates FloatingNavbar & DashboardLayout header)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("educonnect_auth_changed"));
      }
    } catch (err: any) {
      const errorMsg = err.message || "Unable to upload profile photo. Please try again.";
      setStatusMessage({
        type: "error",
        text: errorMsg,
      });
      showToast("Upload Failed", errorMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentAvatar) return;
    setRemoving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to remove profile photo. Please try again.");
      }

      setCurrentAvatar(null);
      handleCancelPreview();

      setStatusMessage({
        type: "success",
        text: "Profile photo removed successfully.",
      });
      showToast("Photo Removed", "Your profile photo has been removed.", "info");

      if (onAvatarUpdated) {
        onAvatarUpdated(null);
      }

      // Notify global auth listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("educonnect_auth_changed"));
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Unable to remove profile photo. Please try again.",
      });
      showToast("Removal Error", err.message, "error");
    } finally {
      setRemoving(false);
    }
  };

  const displayAvatar = previewUrl || currentAvatar;
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className={`p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Profile Photo</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            JPG, PNG, or WebP • Maximum size 5MB
          </p>
        </div>
        {previewUrl && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Preview Mode
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-1">
        {/* Avatar Display Container */}
        <div className="relative shrink-0">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={userName}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-md ${theme.avatarRing} transition-all`}
              onError={(e) => {
                // Graceful fallback if image fails to load
                (e.target as HTMLImageElement).src = "";
                setCurrentAvatar(null);
              }}
            />
          ) : (
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ${theme.avatarBg} font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md ${theme.avatarRing}`}
            >
              {initials}
            </div>
          )}

          {/* Quick Camera Badge */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || removing}
            className="absolute -bottom-2 -right-2 p-2 bg-white text-slate-700 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Choose photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* If a new file is chosen for preview */}
          {selectedFile ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700">
                Selected: <span className="font-bold text-slate-900">{selectedFile.name}</span>{" "}
                <span className="text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={uploading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${theme.primaryBtn}`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Save Photo</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Replace</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelPreview}
                  disabled={uploading}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            /* Default State (no pending preview) */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || removing}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 ${theme.primaryBtn}`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{currentAvatar ? "Change Photo" : "Upload Photo"}</span>
                </button>

                {currentAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={removing || uploading}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {removing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Status Message Feedback */}
          {statusMessage && (
            <div
              className={`text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

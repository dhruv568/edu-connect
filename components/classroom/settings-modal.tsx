"use client";

import React, { useEffect, useState } from "react";
import { DeviceSelection } from "@/types/classroom";
import { Camera, Mic, Volume2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsModalProps {
  currentDevices: DeviceSelection;
  onApplyDevices: (devices: DeviceSelection) => void;
  onClose: () => void;
}

export function SettingsModal({
  currentDevices,
  onApplyDevices,
  onClose,
}: SettingsModalProps) {
  const [availableDevices, setAvailableDevices] = useState<{
    cameras: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ cameras: [], mics: [], speakers: [] });

  const [selected, setSelected] = useState<DeviceSelection>(currentDevices);

  useEffect(() => {
    async function loadDevices() {
      if (typeof window === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices({
          cameras: devices.filter((d) => d.kind === "videoinput"),
          mics: devices.filter((d) => d.kind === "audioinput"),
          speakers: devices.filter((d) => d.kind === "audiooutput"),
        });
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    }
    loadDevices();
  }, []);

  const handleSave = () => {
    onApplyDevices(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-extrabold text-white">Audio & Video Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Camera className="h-4 w-4 text-blue-400" /> Camera Source
          </label>
          <select
            className="w-full h-10 px-3 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selected.cameraId || ""}
            onChange={(e) => setSelected({ ...selected, cameraId: e.target.value })}
          >
            {availableDevices.cameras.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* Microphone Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Mic className="h-4 w-4 text-emerald-400" /> Microphone Source
          </label>
          <select
            className="w-full h-10 px-3 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selected.microphoneId || ""}
            onChange={(e) => setSelected({ ...selected, microphoneId: e.target.value })}
          >
            {availableDevices.mics.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* Speaker Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Volume2 className="h-4 w-4 text-purple-400" /> Audio Output Speaker
          </label>
          <select
            className="w-full h-10 px-3 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selected.speakerId || ""}
            onChange={(e) => setSelected({ ...selected, speakerId: e.target.value })}
          >
            {availableDevices.speakers.length > 0 ? (
              availableDevices.speakers.map((device, idx) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${idx + 1}`}
                </option>
              ))
            ) : (
              <option value="">Default System Speaker</option>
            )}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-slate-800 border-slate-700 text-slate-300 text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Save Device Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

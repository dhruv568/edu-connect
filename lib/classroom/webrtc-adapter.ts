import { ConnectionQuality, DeviceSelection } from "@/types/classroom";
import {
  ClassroomEventHandler,
  ClassroomEventType,
  ClassroomProvider,
  ClassroomProviderOptions,
} from "./classroom-provider";

export class WebRTCAdapter implements ClassroomProvider {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private connectionState: ConnectionQuality = "DISCONNECTED";
  private listeners: Map<ClassroomEventType, Set<ClassroomEventHandler>> = new Map();
  private audioAnalyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private activeSpeakerCheckInterval: NodeJS.Timeout | null = null;
  private options: ClassroomProviderOptions | null = null;
  private isAudioEnabled: boolean = true;
  private isVideoEnabled: boolean = true;

  constructor() {
    this.initListenersMap();
  }

  private initListenersMap() {
    const eventTypes: ClassroomEventType[] = [
      "local-stream-changed",
      "remote-stream-added",
      "remote-stream-removed",
      "connection-state-changed",
      "active-speaker-changed",
      "screen-share-changed",
      "device-permission-denied",
      "error",
    ];
    eventTypes.forEach((evt) => this.listeners.set(evt, new Set()));
  }

  public async connect(options: ClassroomProviderOptions): Promise<void> {
    this.options = options;
    this.setConnectionState("CONNECTING");

    try {
      // 1. Initialize local media stream (real WebRTC camera & mic)
      if (typeof window !== "undefined" && navigator.mediaDevices) {
        try {
          const constraints: MediaStreamConstraints = {
            audio: options.initialAudioEnabled !== false,
            video: options.initialVideoEnabled !== false
              ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
              : false,
          };
          this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
          this.isAudioEnabled = options.initialAudioEnabled !== false;
          this.isVideoEnabled = options.initialVideoEnabled !== false;
          this.setupAudioAnalysis(this.localStream);
        } catch (err: any) {
          console.warn("[WebRTCAdapter] Initial media permission issue:", err);
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            this.emit("device-permission-denied", {
              message: "Camera/microphone access is blocked by browser settings.",
            });
          }
          // Create fallback dummy track stream if permissions are denied so classroom UI initializes cleanly
          this.localStream = new MediaStream();
        }
      }

      this.setConnectionState("CONNECTED");
      this.emit("local-stream-changed", { stream: this.localStream });

      // Start active speaker detection
      this.startActiveSpeakerDetection();
    } catch (err: any) {
      console.error("[WebRTCAdapter] Connection error:", err);
      this.setConnectionState("DISCONNECTED");
      this.emit("error", { message: err.message || "Failed to connect to room" });
    }
  }

  public async disconnect(): Promise<void> {
    this.stopActiveSpeakerDetection();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.setConnectionState("DISCONNECTED");
    this.emit("local-stream-changed", { stream: null });
  }

  public async setAudioEnabled(enabled: boolean): Promise<boolean> {
    this.isAudioEnabled = enabled;
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = enabled;
        });
      } else if (enabled && typeof window !== "undefined" && navigator.mediaDevices) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStream.getAudioTracks().forEach((track) => this.localStream?.addTrack(track));
        } catch (err) {
          console.error("Failed to re-acquire microphone:", err);
          return false;
        }
      }
    }
    this.emit("local-stream-changed", { stream: this.localStream, isAudioOn: enabled, isVideoOn: this.isVideoEnabled });
    return enabled;
  }

  public async setVideoEnabled(enabled: boolean): Promise<boolean> {
    this.isVideoEnabled = enabled;
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = enabled;
        });
      } else if (enabled && typeof window !== "undefined" && navigator.mediaDevices) {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
          camStream.getVideoTracks().forEach((track) => this.localStream?.addTrack(track));
        } catch (err) {
          console.error("Failed to re-acquire camera:", err);
          return false;
        }
      }
    }
    this.emit("local-stream-changed", { stream: this.localStream, isAudioOn: this.isAudioEnabled, isVideoOn: enabled });
    return enabled;
  }

  public async startScreenShare(): Promise<MediaStream | null> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("Screen sharing is not supported on this device/browser.");
    }

    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Listen for when user stops screen share from browser floating toolbar
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      this.emit("screen-share-changed", { isSharing: true, stream: this.screenStream });
      return this.screenStream;
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        console.error("Screen share error:", err);
      }
      return null;
    }
  }

  public async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
    this.emit("screen-share-changed", { isSharing: false, stream: null });
  }

  public async selectDevices(devices: DeviceSelection): Promise<void> {
    if (typeof window === "undefined" || !navigator.mediaDevices) return;

    try {
      const constraints: MediaStreamConstraints = {
        audio: devices.microphoneId ? { deviceId: { exact: devices.microphoneId } } : this.isAudioEnabled,
        video: devices.cameraId ? { deviceId: { exact: devices.cameraId } } : this.isVideoEnabled,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
      }
      this.localStream = newStream;
      this.setupAudioAnalysis(newStream);
      this.emit("local-stream-changed", { stream: this.localStream });
    } catch (err: any) {
      console.error("Error changing media devices:", err);
      this.emit("error", { message: "Could not switch to selected device." });
    }
  }

  public async getAvailableDevices(): Promise<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return { cameras: [], microphones: [], speakers: [] };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        cameras: devices.filter((d) => d.kind === "videoinput"),
        microphones: devices.filter((d) => d.kind === "audioinput"),
        speakers: devices.filter((d) => d.kind === "audiooutput"),
      };
    } catch (err) {
      console.error("Error enumerating devices:", err);
      return { cameras: [], microphones: [], speakers: [] };
    }
  }

  public getConnectionState(): ConnectionQuality {
    return this.connectionState;
  }

  public on(event: ClassroomEventType, handler: ClassroomEventHandler): void {
    const set = this.listeners.get(event);
    if (set) {
      set.add(handler);
    }
  }

  public off(event: ClassroomEventType, handler: ClassroomEventHandler): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  private setConnectionState(state: ConnectionQuality) {
    this.connectionState = state;
    this.emit("connection-state-changed", { state });
  }

  private emit(event: ClassroomEventType, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(data);
        } catch (e) {
          console.error(`Error in ${event} handler:`, e);
        }
      });
    }
  }

  private setupAudioAnalysis(stream: MediaStream) {
    if (typeof window === "undefined") return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.audioAnalyser = this.audioContext.createAnalyser();
      this.audioAnalyser.fftSize = 256;
      source.connect(this.audioAnalyser);
    } catch (e) {
      console.warn("Could not set up Web Audio analyser:", e);
    }
  }

  private startActiveSpeakerDetection() {
    this.stopActiveSpeakerDetection();
    this.activeSpeakerCheckInterval = setInterval(() => {
      if (!this.audioAnalyser || !this.isAudioEnabled) return;
      const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
      this.audioAnalyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const isSpeaking = average > 15;

      if (isSpeaking && this.options) {
        this.emit("active-speaker-changed", {
          speakerId: this.options.userId,
          speakerName: this.options.userName,
          volume: average,
        });
      }
    }, 500);
  }

  private stopActiveSpeakerDetection() {
    if (this.activeSpeakerCheckInterval) {
      clearInterval(this.activeSpeakerCheckInterval);
      this.activeSpeakerCheckInterval = null;
    }
  }
}

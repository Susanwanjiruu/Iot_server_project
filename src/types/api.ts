import type { DeviceId, DeviceStatus, LedState } from "./device.js";

export interface DistanceResponse {
  deviceId: DeviceId;
  distanceCm: number;
  receivedAt: string;
}

export interface LightResponse {
  deviceId: DeviceId;
  lightLux: number;
  receivedAt: string;
}

export interface MotionResponse {
  deviceId: DeviceId;
  motionDetected: boolean;
  receivedAt: string;
}

export interface DeviceSnapshotResponse {
  deviceId: DeviceId;
  status: DeviceStatus;
  lastSeenAt: string;
  distance: DistanceResponse | null;
  light: LightResponse | null;
  motion: MotionResponse | null;
}

export interface LedCommandResponse {
  deviceId: DeviceId;
  state: LedState;
  sentAt: string;
}

export interface NotificationResponse {
  id: number;
  deviceId: DeviceId;
  level: "info" | "warning" | "critical";
  message: string;
  createdAt: string;
}

export interface ServerHealthResponse {
  status: "ok";
  uptimeSeconds: number;
}

export interface ErrorResponse {
  error: string;
}
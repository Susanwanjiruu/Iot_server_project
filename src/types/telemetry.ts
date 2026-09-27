import type { DeviceId } from "./device.js";

export type SensorKind = "distance" | "light" | "motion";

/** Raw payload shapes published by each sensor. */
export interface DistanceReading {
  distanceCm: number;
}

export interface LightReading {
  lightLux: number;
}

export interface MotionReading {
  motionDetected: boolean;
}

/** Stored/served records: payload plus who sent it and when it arrived. */
export interface DistanceRecord {
  deviceId: DeviceId;
  distanceCm: number;
  receivedAt: Date;
}

export interface LightRecord {
  deviceId: DeviceId;
  lightLux: number;
  receivedAt: Date;
}

export interface MotionRecord {
  deviceId: DeviceId;
  motionDetected: boolean;
  receivedAt: Date;
}

export type DistanceParseResult =
  | { ok: true; reading: DistanceReading }
  | { ok: false; error: string };

export type LightParseResult =
  | { ok: true; reading: LightReading }
  | { ok: false; error: string };

export type MotionParseResult =
  | { ok: true; reading: MotionReading }
  | { ok: false; error: string };

/** One combined snapshot of everything known about a device right now. */
export interface DeviceSnapshot {
  deviceId: DeviceId;
  distance: DistanceRecord | null;
  light: LightRecord | null;
  motion: MotionRecord | null;
}
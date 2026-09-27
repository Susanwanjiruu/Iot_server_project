import type { DeviceId } from "../types/index.js";

export type NotificationLevel = "info" | "warning" | "critical";

export interface Notification {
  id: number;
  deviceId: DeviceId;
  level: NotificationLevel;
  message: string;
  createdAt: Date;
}

// --- Tune these for your classroom demo -----------------------------------
export const THRESHOLDS = {
  distanceCriticalCm: 10,   // object very close
  distanceWarningCm: 30,    // object approaching
  lightDarkLux: 50,         // "too dark" warning
} as const;
// ----------------------------------------------------------------------------

const MAX_NOTIFICATIONS = 200;
const notifications: Notification[] = [];
let nextId = 1;

function push(deviceId: DeviceId, level: NotificationLevel, message: string): void {
  notifications.unshift({ id: nextId++, deviceId, level, message, createdAt: new Date() });
  if (notifications.length > MAX_NOTIFICATIONS) {
    notifications.length = MAX_NOTIFICATIONS;
  }
}

export function notifyDistance(deviceId: DeviceId, distanceCm: number): void {
  if (distanceCm <= THRESHOLDS.distanceCriticalCm) {
    push(deviceId, "critical", `Object very close: ${distanceCm.toFixed(1)} cm`);
  } else if (distanceCm <= THRESHOLDS.distanceWarningCm) {
    push(deviceId, "warning", `Object approaching: ${distanceCm.toFixed(1)} cm`);
  }
}

export function notifyLight(deviceId: DeviceId, lightLux: number): void {
  if (lightLux <= THRESHOLDS.lightDarkLux) {
    push(deviceId, "info", `Room is dark: ${lightLux.toFixed(0)} lux`);
  }
}

export function notifyMotion(deviceId: DeviceId, motionDetected: boolean): void {
  if (motionDetected) {
    push(deviceId, "warning", "Motion detected");
  }
}

export function getRecentNotifications(limit = 50): Notification[] {
  return notifications.slice(0, limit);
}
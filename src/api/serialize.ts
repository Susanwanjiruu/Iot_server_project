import type {
  DeviceHealth,
  DeviceSnapshot,
  DeviceSnapshotResponse,
  DistanceRecord,
  DistanceResponse,
  LightRecord,
  LightResponse,
  MotionRecord,
  MotionResponse,
  Notification,
  NotificationResponse,
} from "../types/index.js";

export function toDistanceResponse(r: DistanceRecord): DistanceResponse {
  return { deviceId: r.deviceId, distanceCm: r.distanceCm, receivedAt: r.receivedAt.toISOString() };
}

export function toLightResponse(r: LightRecord): LightResponse {
  return { deviceId: r.deviceId, lightLux: r.lightLux, receivedAt: r.receivedAt.toISOString() };
}

export function toMotionResponse(r: MotionRecord): MotionResponse {
  return { deviceId: r.deviceId, motionDetected: r.motionDetected, receivedAt: r.receivedAt.toISOString() };
}

export function toSnapshotResponse(
  health: DeviceHealth,
  snapshot: DeviceSnapshot
): DeviceSnapshotResponse {
  return {
    deviceId: health.deviceId,
    status: health.status,
    lastSeenAt: health.lastSeenAt.toISOString(),
    distance: snapshot.distance ? toDistanceResponse(snapshot.distance) : null,
    light: snapshot.light ? toLightResponse(snapshot.light) : null,
    motion: snapshot.motion ? toMotionResponse(snapshot.motion) : null,
  };
}

export function toNotificationResponse(n: Notification): NotificationResponse {
  return {
    id: n.id,
    deviceId: n.deviceId,
    level: n.level,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
  };
}
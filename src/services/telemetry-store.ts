import type {
  DeviceId,
  DeviceSnapshot,
  DistanceRecord,
  LightRecord,
  MotionRecord,
} from "../types/index.js";

const latestDistanceByDevice = new Map<DeviceId, DistanceRecord>();
const latestLightByDevice = new Map<DeviceId, LightRecord>();
const latestMotionByDevice = new Map<DeviceId, MotionRecord>();

export function saveLatestDistance(record: DistanceRecord): void {
  latestDistanceByDevice.set(record.deviceId, record);
}
export function saveLatestLight(record: LightRecord): void {
  latestLightByDevice.set(record.deviceId, record);
}
export function saveLatestMotion(record: MotionRecord): void {
  latestMotionByDevice.set(record.deviceId, record);
}

export function getLatestDistance(deviceId: DeviceId): DistanceRecord | null {
  return latestDistanceByDevice.get(deviceId) ?? null;
}
export function getLatestLight(deviceId: DeviceId): LightRecord | null {
  return latestLightByDevice.get(deviceId) ?? null;
}
export function getLatestMotion(deviceId: DeviceId): MotionRecord | null {
  return latestMotionByDevice.get(deviceId) ?? null;
}

/** Union of every device id seen by any of the three sensors. */
export function knownDeviceIds(): DeviceId[] {
  const ids = new Set<DeviceId>([
    ...latestDistanceByDevice.keys(),
    ...latestLightByDevice.keys(),
    ...latestMotionByDevice.keys(),
  ]);
  return Array.from(ids);
}

export function getSnapshot(deviceId: DeviceId): DeviceSnapshot {
  return {
    deviceId,
    distance: getLatestDistance(deviceId),
    light: getLatestLight(deviceId),
    motion: getLatestMotion(deviceId),
  };
}

export function getAllSnapshots(): DeviceSnapshot[] {
  return knownDeviceIds().map(getSnapshot);
}

export function deviceCount(): number {
  return knownDeviceIds().length;
}
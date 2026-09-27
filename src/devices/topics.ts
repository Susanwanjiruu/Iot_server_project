import { config } from "../config/env.js";
import type { DeviceId, SensorKind } from "../types/index.js";

const base = config.mqtt.baseTopic;
const SENSOR_KINDS: SensorKind[] = ["distance", "light", "motion"];

/** '+' matches the device id, second '+' matches the sensor kind. */
export function telemetrySubscription(): string {
  return `${base}/+/sensors/+`;
}

export function healthSubscription(): string {
  return `${base}/+/health`;
}

export function ledCommandTopic(deviceId: DeviceId): string {
  return `${base}/${deviceId}/commands/led`;
}

export function isHealthTopic(topic: string): boolean {
  return topic.endsWith("/health");
}

/** Returns which sensor a telemetry topic carries, or null if it's not one. */
export function sensorKindFromTopic(topic: string): SensorKind | null {
  for (const kind of SENSOR_KINDS) {
    if (topic.endsWith(`/sensors/${kind}`)) {
      return kind;
    }
  }
  return null;
}

export function deviceIdFromTopic(topic: string): DeviceId | null {
  const baseLength = base.split("/").length;
  const segments = topic.split("/");
  const deviceId = segments[baseLength];

  if (deviceId === undefined || deviceId === "") {
    return null;
  }

  return deviceId;
}
import type { DistanceParseResult } from "../types/index.js";

const MIN_CM = 2;
const MAX_CM = 400; // typical HC-SR04 ultrasonic range

export function parseDistancePayload(payload: string): DistanceParseResult {
  let data: unknown;

  try {
    data = JSON.parse(payload);
  } catch {
    return { ok: false, error: "payload is not valid JSON" };
  }

  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "payload is not a JSON object" };
  }

  if (!("distanceCm" in data)) {
    return { ok: false, error: "payload is missing 'distanceCm'" };
  }

  const { distanceCm } = data as { distanceCm: unknown };

  if (typeof distanceCm !== "number" || !Number.isFinite(distanceCm)) {
    return { ok: false, error: "'distanceCm' is not a finite number" };
  }

  if (distanceCm < 0 || distanceCm > MAX_CM) {
    return {
      ok: false,
      error: `'distanceCm' out of sensor range (0-${MAX_CM})`,
    };
  }

  return { ok: true, reading: { distanceCm } };
}

export { MIN_CM as DISTANCE_MIN_CM, MAX_CM as DISTANCE_MAX_CM };
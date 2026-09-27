import type { LightParseResult } from "../types/index.js";

const MIN_LUX = 0;
const MAX_LUX = 1000; // fine for an indoor LDR demo

export function parseLightPayload(payload: string): LightParseResult {
  let data: unknown;

  try {
    data = JSON.parse(payload);
  } catch {
    return { ok: false, error: "payload is not valid JSON" };
  }

  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "payload is not a JSON object" };
  }

  if (!("lightLux" in data)) {
    return { ok: false, error: "payload is missing 'lightLux'" };
  }

  const { lightLux } = data as { lightLux: unknown };

  if (typeof lightLux !== "number" || !Number.isFinite(lightLux)) {
    return { ok: false, error: "'lightLux' is not a finite number" };
  }

  if (lightLux < MIN_LUX || lightLux > MAX_LUX) {
    return { ok: false, error: `'lightLux' out of sensor range (${MIN_LUX}-${MAX_LUX})` };
  }

  return { ok: true, reading: { lightLux } };
}
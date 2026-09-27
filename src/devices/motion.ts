import type { MotionParseResult } from "../types/index.js";

export function parseMotionPayload(payload: string): MotionParseResult {
  let data: unknown;

  try {
    data = JSON.parse(payload);
  } catch {
    return { ok: false, error: "payload is not valid JSON" };
  }

  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "payload is not a JSON object" };
  }

  if (!("motionDetected" in data)) {
    return { ok: false, error: "payload is missing 'motionDetected'" };
  }

  const { motionDetected } = data as { motionDetected: unknown };

  if (typeof motionDetected !== "boolean") {
    return { ok: false, error: "'motionDetected' is not a boolean" };
  }

  return { ok: true, reading: { motionDetected } };
}
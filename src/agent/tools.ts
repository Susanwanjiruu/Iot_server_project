import { findRecentDistance, findRecentLight, findRecentMotion } from "../database/index.js";
import { getAllHealth } from "../services/device-health.js";
import { getSnapshot } from "../services/telemetry-store.js";
import { getRecentNotifications } from "../services/notifications.js";
import { describeCoverage } from "./coverage.js";
import { forecastMetric } from "./forecast.js";
import type { AgentTool, ToolResult } from "../types/index.js";

const MAX_READINGS = 500;

function asObject(args: unknown): Record<string, unknown> | null {
  if (typeof args !== "object" || args === null || Array.isArray(args)) return null;
  return args as Record<string, unknown>;
}
function readString(args: Record<string, unknown>, key: string): string | null {
  const value = args[key];
  return typeof value === "string" && value.trim() !== "" ? value : null;
}
function readNumber(args: Record<string, unknown>, key: string, fallback: number): number {
  const value = args[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function clampLimit(value: number): number {
  return Math.min(MAX_READINGS, Math.max(1, Math.floor(value)));
}

const listDevices: AgentTool = {
  name: "list_devices",
  description:
    "List every device the server has heard from, with online status and the " +
    "latest distance/light/motion snapshot. Call this first when the user does " +
    "not name a device.",
  parameters: { type: "object", properties: {}, required: [] },
  run: async (): Promise<ToolResult> => {
    const devices = getAllHealth().map((health) => {
      const snapshot = getSnapshot(health.deviceId);
      return {
        deviceId: health.deviceId,
        status: health.status,
        lastSeenAt: health.lastSeenAt.toISOString(),
        distanceCm: snapshot.distance?.distanceCm ?? null,
        lightLux: snapshot.light?.lightLux ?? null,
        motionDetected: snapshot.motion?.motionDetected ?? null,
      };
    });
    return { ok: true, data: { devices, count: devices.length } };
  },
};

function makeHistoryTool(
  sensor: "distance" | "light" | "motion",
  fetcher: (deviceId: string, limit: number) => Promise<{ receivedAt: Date }[]>
): AgentTool {
  return {
    name: `get_${sensor}_readings`,
    description: `Fetch stored ${sensor} readings for one device, newest first.`,
    parameters: {
      type: "object",
      properties: {
        deviceId: { type: "string", description: "Exact device id" },
        limit: { type: "number", description: `How many readings, 1 to ${MAX_READINGS}. Defaults to 50.` },
      },
      required: ["deviceId"],
    },
    run: async (args: unknown): Promise<ToolResult> => {
      const object = asObject(args);
      if (object === null) return { ok: false, error: "arguments must be an object" };
      const deviceId = readString(object, "deviceId");
      if (deviceId === null) return { ok: false, error: "'deviceId' is required" };
      const limit = clampLimit(readNumber(object, "limit", 50));
      const readings = await fetcher(deviceId, limit);
      if (readings.length === 0) {
        return { ok: false, error: `no stored ${sensor} readings for device '${deviceId}'` };
      }
      return {
        ok: true,
        data: {
          deviceId,
          count: readings.length,
          coverage: sensor === "motion" ? undefined : describeCoverage(readings as never),
          readings,
        },
      };
    },
  };
}

const getDistanceReadings = makeHistoryTool("distance", findRecentDistance);
const getLightReadings = makeHistoryTool("light", findRecentLight);
const getMotionReadings = makeHistoryTool("motion", findRecentMotion);

const forecast: AgentTool = {
  name: "forecast",
  description:
    "Fit a straight line through recent distance or light readings and extend it " +
    "forwards. Never use this for motion (it is boolean, not continuous).",
  parameters: {
    type: "object",
    properties: {
      deviceId: { type: "string" },
      metric: { type: "string", enum: ["distance", "light"] },
      horizonMinutes: { type: "number", description: "How far ahead to predict. Defaults to 30." },
    },
    required: ["deviceId", "metric"],
  },
  run: async (args: unknown): Promise<ToolResult> => {
    const object = asObject(args);
    if (object === null) return { ok: false, error: "arguments must be an object" };
    const deviceId = readString(object, "deviceId");
    if (deviceId === null) return { ok: false, error: "'deviceId' is required" };
    const metric = object["metric"] === "light" ? "light" : "distance";
    const horizonMinutes = Math.min(1440, Math.max(1, readNumber(object, "horizonMinutes", 30)));

    const readings =
      metric === "light"
        ? await findRecentLight(deviceId, 200)
        : await findRecentDistance(deviceId, 200);

    const result = forecastMetric(
      readings.map((r) => ({
        receivedAt: r.receivedAt,
        value: metric === "light" ? (r as { lightLux: number }).lightLux : (r as { distanceCm: number }).distanceCm,
      })),
      horizonMinutes
    );

    if (result === null) {
      return { ok: false, error: "not enough readings to fit a trend (need at least 3, spread over time)" };
    }
    return { ok: true, data: { ...result, metric, coverage: describeCoverage(readings as never) } };
  },
};

const getNotifications: AgentTool = {
  name: "get_notifications",
  description: "List recent alerts (object too close, motion detected, room too dark).",
  parameters: {
    type: "object",
    properties: { limit: { type: "number", description: "How many, defaults to 20" } },
    required: [],
  },
  run: async (args: unknown): Promise<ToolResult> => {
    const object = asObject(args) ?? {};
    const limit = clampLimit(readNumber(object, "limit", 20));
    return { ok: true, data: { notifications: getRecentNotifications(limit) } };
  },
};

const makeChart: AgentTool = {
  name: "make_chart",
  description:
    "Build a chart of a device's distance or light readings for the user to look " +
    "at. Returns a confirmation, not an image; the dashboard draws it.",
  parameters: {
    type: "object",
    properties: {
      deviceId: { type: "string" },
      metric: { type: "string", enum: ["distance", "light"] },
      title: { type: "string" },
      limit: { type: "number" },
    },
    required: ["deviceId", "metric", "title"],
  },
  run: async (args: unknown): Promise<ToolResult> => {
    const object = asObject(args);
    if (object === null) return { ok: false, error: "arguments must be an object" };
    const deviceId = readString(object, "deviceId");
    if (deviceId === null) return { ok: false, error: "'deviceId' is required" };
    const metric = object["metric"] === "light" ? "light" : "distance";
    const title = readString(object, "title") ?? `${metric} readings from ${deviceId}`;
    const limit = clampLimit(readNumber(object, "limit", 100));

    const readings =
      metric === "light"
        ? await findRecentLight(deviceId, limit)
        : await findRecentDistance(deviceId, limit);

    if (readings.length === 0) {
      return { ok: false, error: `no stored ${metric} readings for device '${deviceId}'` };
    }

    const key = metric === "light" ? "lightLux" : "distanceCm";
    const data = [...readings].reverse().map((r) => ({
      t: r.receivedAt.getTime(),
      time: r.receivedAt.toISOString(),
      value: (r as Record<string, number>)[key],
    }));

    const values = data.map((d) => d.value);
    const plotted = {
      first: values[0],
      last: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    };

    return {
      ok: true,
      data: {
        created: true,
        pointCount: data.length,
        plotted,
        note: "The chart is shown to the user; describe it using 'plotted' only.",
      },
      chart: { title, type: "line", xKey: "t", series: [{ key: "value", label: metric }], data },
    };
  },
};

export const agentTools: AgentTool[] = [
  listDevices,
  getDistanceReadings,
  getLightReadings,
  getMotionReadings,
  forecast,
  getNotifications,
  makeChart,
];
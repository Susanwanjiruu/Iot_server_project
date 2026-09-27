import type { FastifyInstance } from "fastify";

import { findRecentDistance, findRecentLight, findRecentMotion } from "../../database/index.js";
import { getAllSnapshots, getSnapshot } from "../../services/telemetry-store.js";
import { getAllHealth, getHealth } from "../../services/device-health.js";
import {
  toDistanceResponse,
  toLightResponse,
  toMotionResponse,
  toSnapshotResponse,
} from "../serialize.js";
import { parseLimit } from "../../database/parse-query.js";

interface DeviceParams {
  deviceId: string;
}
interface LimitQuery {
  limit?: string;
}

export function registerTelemetryRoutes(app: FastifyInstance): void {
  // Combined "everything I know about every device right now" — what the dashboard polls.
  app.get("/api/telemetry/latest", () => {
    return getAllHealth().map((health) => toSnapshotResponse(health, getSnapshot(health.deviceId)));
  });

  app.get<{ Params: DeviceParams }>("/api/telemetry/latest/:deviceId", (request, reply) => {
    const health = getHealth(request.params.deviceId);
    if (health === null) {
      return reply.code(404).send({ error: `Unknown device ${request.params.deviceId}` });
    }
    return toSnapshotResponse(health, getSnapshot(request.params.deviceId));
  });

  app.get<{ Params: DeviceParams; Querystring: LimitQuery }>(
    "/api/telemetry/history/distance/:deviceId",
    async (request, reply) => {
      const parsed = parseLimit(request.query.limit);
      if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
      const records = await findRecentDistance(request.params.deviceId, parsed.limit);
      return records.map(toDistanceResponse);
    }
  );

  app.get<{ Params: DeviceParams; Querystring: LimitQuery }>(
    "/api/telemetry/history/light/:deviceId",
    async (request, reply) => {
      const parsed = parseLimit(request.query.limit);
      if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
      const records = await findRecentLight(request.params.deviceId, parsed.limit);
      return records.map(toLightResponse);
    }
  );

  app.get<{ Params: DeviceParams; Querystring: LimitQuery }>(
    "/api/telemetry/history/motion/:deviceId",
    async (request, reply) => {
      const parsed = parseLimit(request.query.limit);
      if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
      const records = await findRecentMotion(request.params.deviceId, parsed.limit);
      return records.map(toMotionResponse);
    }
  );
}
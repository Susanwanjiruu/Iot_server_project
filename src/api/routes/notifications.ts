import type { FastifyInstance } from "fastify";
import { getRecentNotifications } from "../../services/notifications.js";
import { toNotificationResponse } from "../serialize.js";

interface LimitQuery {
  limit?: string;
}

export function registerNotificationRoutes(app: FastifyInstance): void {
  app.get<{ Querystring: LimitQuery }>("/api/notifications", (request) => {
    const limit = Number(request.query.limit ?? 50);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 50;
    return getRecentNotifications(safeLimit).map(toNotificationResponse);
  });
}
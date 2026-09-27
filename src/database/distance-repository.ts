import { db } from "../prisma/db.js";
import type { DeviceId, DistanceRecord } from "../types/index.js";
import { fromTimestamptz, toTimestamptz } from "./timestamps.js";

interface Row {
  deviceId: string;
  distanceCm: number;
  receivedAt: string;
}

function toRecord(row: Row): DistanceRecord {
  return {
    deviceId: row.deviceId,
    distanceCm: row.distanceCm,
    receivedAt: fromTimestamptz(row.receivedAt),
  };
}

export async function saveDistanceReading(record: DistanceRecord): Promise<void> {
  await db.orm.public.DistanceReading.create({
    deviceId: record.deviceId,
    distanceCm: record.distanceCm,
    receivedAt: toTimestamptz(record.receivedAt),
  });
}

export async function findRecentDistance(deviceId: DeviceId, limit: number): Promise<DistanceRecord[]> {
  const rows = await db.orm.public.DistanceReading
    .where({ deviceId })
    .orderBy((r) => r.receivedAt.desc())
    .limit(limit)
    .all();
  return rows.map(toRecord);
}
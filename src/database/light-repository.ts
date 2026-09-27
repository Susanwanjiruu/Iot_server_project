import { db } from "../prisma/db.js";
import type { DeviceId, LightRecord } from "../types/index.js";
import { fromTimestamptz, toTimestamptz } from "./timestamps.js";

interface Row {
  deviceId: string;
  lightLux: number;
  receivedAt: string;
}

function toRecord(row: Row): LightRecord {
  return {
    deviceId: row.deviceId,
    lightLux: row.lightLux,
    receivedAt: fromTimestamptz(row.receivedAt),
  };
}

export async function saveLightReading(record: LightRecord): Promise<void> {
  await db.orm.public.LightReading.create({
    deviceId: record.deviceId,
    lightLux: record.lightLux,
    receivedAt: toTimestamptz(record.receivedAt),
  });
}

export async function findRecentLight(deviceId: DeviceId, limit: number): Promise<LightRecord[]> {
  const rows = await db.orm.public.LightReading
    .where({ deviceId })
    .orderBy((r) => r.receivedAt.desc())
    .limit(limit)
    .all();
  return rows.map(toRecord);
}
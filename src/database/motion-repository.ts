import { db } from "../prisma/db.js";
import type { DeviceId, MotionRecord } from "../types/index.js";
import { fromTimestamptz, toTimestamptz } from "./timestamps.js";

interface Row {
  deviceId: string;
  motionDetected: boolean;
  receivedAt: string;
}

function toRecord(row: Row): MotionRecord {
  return {
    deviceId: row.deviceId,
    motionDetected: row.motionDetected,
    receivedAt: fromTimestamptz(row.receivedAt),
  };
}

export async function saveMotionEvent(record: MotionRecord): Promise<void> {
  await db.orm.public.MotionEvent.create({
    deviceId: record.deviceId,
    motionDetected: record.motionDetected,
    receivedAt: toTimestamptz(record.receivedAt),
  });
}

export async function findRecentMotion(deviceId: DeviceId, limit: number): Promise<MotionRecord[]> {
  const rows = await db.orm.public.MotionEvent
    .where({ deviceId })
    .orderBy((r) => r.receivedAt.desc())
    .limit(limit)
    .all();
  return rows.map(toRecord);
}
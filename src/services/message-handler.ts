import { parseDistancePayload } from "../devices/distance.js";
import { parseLightPayload } from "../devices/light.js";
import { parseMotionPayload } from "../devices/motion.js";
import {
  deviceIdFromTopic,
  isHealthTopic,
  sensorKindFromTopic,
} from "../devices/topics.js";
import { logger } from "../utils/logger.js";
import { recordSeen } from "./device-health.js";
import {
  deviceCount,
  saveLatestDistance,
  saveLatestLight,
  saveLatestMotion,
} from "./telemetry-store.js";
import { notifyDistance, notifyLight, notifyMotion } from "./notifications.js";
import {
  saveDistanceReading,
  saveLightReading,
  saveMotionEvent,
} from "../database/index.js";

export async function handleMessage(topic: string, payload: string): Promise<void> {
  const deviceId = deviceIdFromTopic(topic);

  if (deviceId === null) {
    logger.warn(`Could not read a device id from topic ${topic}`);
    return;
  }

  const receivedAt = new Date();
  recordSeen(deviceId, receivedAt);

  const kind = sensorKindFromTopic(topic);

  if (kind === "distance") {
    const result = parseDistancePayload(payload);
    if (!result.ok) {
      logger.warn(`Discarded distance payload from ${deviceId}: ${result.error}`, payload);
      return;
    }
    const record = { deviceId, distanceCm: result.reading.distanceCm, receivedAt };
    saveLatestDistance(record);
    await saveDistanceReading(record);
    notifyDistance(deviceId, record.distanceCm);
    logger.info(`Stored distance ${record.distanceCm}cm from ${deviceId}, ${deviceCount()} device(s) tracked`);
    return;
  }

  if (kind === "light") {
    const result = parseLightPayload(payload);
    if (!result.ok) {
      logger.warn(`Discarded light payload from ${deviceId}: ${result.error}`, payload);
      return;
    }
    const record = { deviceId, lightLux: result.reading.lightLux, receivedAt };
    saveLatestLight(record);
    await saveLightReading(record);
    notifyLight(deviceId, record.lightLux);
    logger.info(`Stored light ${record.lightLux}lux from ${deviceId}`);
    return;
  }

  if (kind === "motion") {
    const result = parseMotionPayload(payload);
    if (!result.ok) {
      logger.warn(`Discarded motion payload from ${deviceId}: ${result.error}`, payload);
      return;
    }
    const record = { deviceId, motionDetected: result.reading.motionDetected, receivedAt };
    saveLatestMotion(record);
    await saveMotionEvent(record);
    notifyMotion(deviceId, record.motionDetected);
    logger.info(`Stored motion=${record.motionDetected} from ${deviceId}`);
    return;
  }

  if (isHealthTopic(topic)) {
    logger.info(`Heartbeat from ${deviceId}`);
    return;
  }

  logger.warn(`No handler for topic ${topic}`);
}
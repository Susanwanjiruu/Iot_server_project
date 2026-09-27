
export type DeviceId = string;


export type LedState = "ON" | "OFF";

export type DeviceStatus = "online" | "offline";

export interface DeviceHealth {
  deviceId: DeviceId;
  status: DeviceStatus;
  lastSeenAt: Date;
}

export interface LedCommand {
  deviceId: DeviceId;
  state: LedState;
}

export type LedCommandParseResult =
  | { ok: true; state: LedState }
  | { ok: false; error: string };
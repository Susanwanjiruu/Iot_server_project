import type { DeviceId } from "./device.js";


export interface ToolCall {
  id: string;
  name: string;
  argumentsJson: string;
}

export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; toolCalls: ToolCall[] }
  | { role: "tool"; toolCallId: string; content: string };

export interface AssistantTurn {
  text: string | null;
  toolCalls: ToolCall[];
}

export type ChatFn = (messages: ChatMessage[]) => Promise<AssistantTurn>;

 

export type ToolResult =
  | { ok: true; data: unknown; chart?: ChartSpec }
  | { ok: false; error: string };

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  run: (args: unknown) => Promise<ToolResult>;
}


export interface ChartSeries {
  key: string;
  label: string;
}


export interface ChartSpec {
  title: string;
  type: "line" | "bar";
  xKey: string;
  series: ChartSeries[];
  data: Record<string, string | number>[];
}


export interface AgentStep {
  tool: string;
  arguments: string;
  ok: boolean;
  summary: string;
}

export interface AgentAnswer {
  question: string;
  answer: string;
  charts: ChartSpec[];
  steps: AgentStep[];
  truncated: boolean;
}

export interface Forecast {
  deviceId: DeviceId;
  metric: "temperature" | "humidity";
  currentValue: number;
  predictedValue: number;
  horizonMinutes: number;
  changePerHour: number;
  rSquared: number;
  sampleCount: number;
}
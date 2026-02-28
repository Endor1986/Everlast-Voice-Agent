export type Mode = "browser" | "pro";

export type AgentStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

export type FlowState =
  | "WELCOME"
  | "ASK_GOAL"
  | "ASK_TOPIC"
  | "ASK_NAME"
  | "ASK_CONTACT"
  | "ASK_TIMEWINDOW"
  | "CONFIRM"
  | "DONE";

export type Slots = {
  goal?: "booking" | "info" | "callback";
  topic?: string;
  name?: string;
  contact?: string;
  timewindow?: string;
};

export type ChatRole = "user" | "agent";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
};

export type AgentTurnInput = {
  userText: string;
  state: FlowState;
  slots: Slots;
};

export type AgentTurnOutput = {
  reply: string;
  nextState: FlowState;
  nextSlots: Slots;
  isDone: boolean;
  summary?: string;
};


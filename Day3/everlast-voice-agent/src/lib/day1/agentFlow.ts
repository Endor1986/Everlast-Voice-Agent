import type { FlowState, Slots } from "@/lib/day1/types";

export const FLOW_BUILD_ID = "DAY3_PRO_VOICE_2026_02_28";

type AgentResult = {
  reply: string;
  nextState: FlowState;
  nextSlots: Slots;
  isDone: boolean;
  summary?: string;
};

type TurnInput = {
  userText: string;
  state: FlowState;
  slots: Slots;
};

function safeText(v: unknown): string {
  return (v ?? "").toString();
}

function normBasic(s: string): string {
  return safeText(s)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normLower(s: string): string {
  return normBasic(s).toLowerCase();
}

function isYes(t: string): boolean {
  return /\b(ja|jup|jo|yes|passt|korrekt|genau)\b/.test(t);
}
function isNo(t: string): boolean {
  return /\b(nein|no|nop|falsch|nicht|stimmt nicht)\b/.test(t);
}

function makeSummary(slots: Slots): string {
  const parts: string[] = [];
  if (slots.goal) parts.push(`Anliegen: ${slots.goal}`);
  if (slots.topic) parts.push(`Thema: ${slots.topic}`);
  if (slots.name) parts.push(`Name: ${slots.name}`);
  if (slots.contact) parts.push(`Kontakt: ${slots.contact}`);
  if (slots.timewindow) parts.push(`Zeitfenster: ${slots.timewindow}`);
  return parts.join("\n");
}

export function runAgentTurn(input: TurnInput): AgentResult {
  const state = input?.state ?? "WELCOME";
  const slots: Slots = { ...(input?.slots ?? {}) };
  const userText = safeText(input?.userText);
  const t = normLower(userText);

  if (state === "WELCOME") {
    return {
      reply: "Hi, ich bin dein Everlast Voice Agent. Willst du einen Termin buchen, Infos bekommen oder einen Rückruf anlegen?",
      nextState: "ASK_GOAL",
      nextSlots: slots,
      isDone: false,
    };
  }

  if (state === "ASK_GOAL") {
    if (t.length < 2) {
      return {
        reply: "Sag bitte: Termin, Infos oder Rückruf.",
        nextState: "ASK_GOAL",
        nextSlots: slots,
        isDone: false,
      };
    }

    if (/\btermin\b/.test(t)) slots.goal = "booking";
    else if (/\binfos?\b/.test(t)) slots.goal = "info";
    else if (/\brückruf\b/.test(t) || /\brueckruf\b/.test(t) || /\bcallback\b/.test(t)) slots.goal = "callback";
    else slots.goal = "info";

    return {
      reply: "Alles klar. Worum geht es konkret, also welches Thema oder Anliegen?",
      nextState: "ASK_TOPIC",
      nextSlots: slots,
      isDone: false,
    };
  }

  if (state === "ASK_TOPIC") {
    const cleaned = normBasic(userText);
    if (cleaned.length < 3) {
      return {
        reply: "Nenn mir bitte ein kurzes Thema. Zum Beispiel: Beratung, Angebot, Support.",
        nextState: "ASK_TOPIC",
        nextSlots: slots,
        isDone: false,
      };
    }
    slots.topic = cleaned;

    return {
      reply: "Wie ist dein Name?",
      nextState: "ASK_NAME",
      nextSlots: slots,
      isDone: false,
    };
  }

  if (state === "ASK_NAME") {
    const cleaned = normBasic(userText);
    if (cleaned.length < 2) {
      return {
        reply: "Sag bitte deinen Namen nochmal.",
        nextState: "ASK_NAME",
        nextSlots: slots,
        isDone: false,
      };
    }
    slots.name = cleaned;

    return {
      reply: "Bitte gib jetzt deine E-Mail oder Telefonnummer in das Eingabefeld ein. Sprache ist hier deaktiviert.",
      nextState: "ASK_CONTACT",
      nextSlots: slots,
      isDone: false,
    };
  }

  if (state === "ASK_CONTACT") {
    return {
      reply: "Bitte gib deine E-Mail oder Telefonnummer in das Eingabefeld ein. Sprache ist hier deaktiviert.",
      nextState: "ASK_CONTACT",
      nextSlots: slots,
      isDone: false,
    };
  }

  if (state === "ASK_TIMEWINDOW") {
    const cleaned = normBasic(userText);
    if (cleaned.length < 3) {
      return {
        reply: "Nenn mir bitte ein grobes Zeitfenster, zum Beispiel Montag Vormittag.",
        nextState: "ASK_TIMEWINDOW",
        nextSlots: slots,
        isDone: false,
      };
    }
    slots.timewindow = cleaned;

    const summary = makeSummary(slots);
    return {
      reply: `Kurz zur Bestätigung:\n${summary}\n\nPasst das so? Sag ja oder nein.`,
      nextState: "CONFIRM",
      nextSlots: slots,
      isDone: false,
      summary,
    };
  }

  if (state === "CONFIRM") {
    if (isYes(t)) {
      const summary = makeSummary(slots);
      return {
        reply: "Perfekt. Ich habe es aufgenommen. Du kannst die Zusammenfassung kopieren und intern weitergeben.",
        nextState: "DONE",
        nextSlots: slots,
        isDone: true,
        summary,
      };
    }
    if (isNo(t)) {
      return {
        reply: "Alles klar. Dann starten wir beim Thema neu. Worum geht es konkret?",
        nextState: "ASK_TOPIC",
        nextSlots: { ...slots, topic: undefined, timewindow: undefined },
        isDone: false,
      };
    }
    return {
      reply: "Sag bitte ja oder nein. Passt die Zusammenfassung so?",
      nextState: "CONFIRM",
      nextSlots: slots,
      isDone: false,
    };
  }

  if (state === "DONE") {
    return {
      reply: "Wenn du noch etwas brauchst, sag einfach: neuer Termin.",
      nextState: "DONE",
      nextSlots: slots,
      isDone: true,
      summary: makeSummary(slots),
    };
  }

  return {
    reply: "Lass uns neu starten. Willst du Termin, Infos oder Rückruf?",
    nextState: "ASK_GOAL",
    nextSlots: {},
    isDone: false,
  };
}










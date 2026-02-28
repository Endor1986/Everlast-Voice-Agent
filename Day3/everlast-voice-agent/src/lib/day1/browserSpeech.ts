"use client";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;

  const w = window as Window;
  return ((w.SpeechRecognition as SpeechRecognitionCtor | undefined) ?? (w.webkitSpeechRecognition as SpeechRecognitionCtor | undefined) ?? null);
}

function localeBase(locale: string) {
  return String(locale || "").toLowerCase().split("-")[0];
}

function preferredSpeechRate(locale: string) {
  const base = localeBase(locale);

  // Slightly slower than default for cleaner, less robotic prompts.
  if (base === "de") return 0.94;
  if (base === "en") return 0.96;

  return 0.95;
}

function pickVoiceForLocale(locale: string, preferredVoiceName?: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const wanted = localeBase(locale);

  if (preferredVoiceName) {
    const wantedName = preferredVoiceName.toLowerCase();
    const byName = voices.find((v) => String(v.name || "").toLowerCase().includes(wantedName));
    if (byName) return byName;
  }
  const exact = voices.find((v) => String(v.lang || "").toLowerCase() === String(locale || "").toLowerCase());
  if (exact) return exact;

  const languageMatch = voices.find((v) => String(v.lang || "").toLowerCase().startsWith(`${wanted}-`));
  if (languageMatch) return languageMatch;

  return voices[0] ?? null;
}

export type RecognitionHandlers = {
  onInterimText?: (text: string) => void;
  onFinalText?: (text: string) => void;
  onError?: (message: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
};

export function isBrowserRecognitionSupported() {
  return Boolean(getSpeechRecognitionCtor());
}

export function createBrowserRecognition(locale: string, handlers: RecognitionHandlers) {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    throw new Error("SpeechRecognition wird in diesem Browser nicht unterstützt. Nutze Chrome oder Edge.");
  }

  const rec = new Ctor();
  rec.lang = locale;
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 3;

  rec.onstart = () => handlers.onStart?.();
  rec.onend = () => handlers.onEnd?.();

  rec.onerror = (evt: unknown) => {
    const e = evt as { error?: unknown; message?: unknown };
    const msg = e?.error ? String(e.error) : (e?.message ? String(e.message) : "SpeechRecognition error");
    handlers.onError?.(msg);
  };

  rec.onresult = (evt: SpeechRecognitionEvent) => {
    let interim = "";
    let finalText = "";

    for (let i = evt.resultIndex; i < evt.results.length; i++) {
      const res = evt.results[i];
      const txt = res[0]?.transcript ?? "";
      if (res.isFinal) finalText += txt;
      else interim += txt;
    }

    const interimClean = interim.trim();
    const finalClean = finalText.trim();

    if (interimClean) handlers.onInterimText?.(interimClean);
    if (finalClean) handlers.onFinalText?.(finalClean);
  };

  return rec;
}

export function speakBrowser(
  text: string,
  locale: string,
  options?: { preferredVoiceName?: string }
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      reject(new Error("speechSynthesis wird in diesem Browser nicht unterstützt."));
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = locale;
    utter.rate = preferredSpeechRate(locale);
    utter.pitch = 1.0;

    const voice = pickVoiceForLocale(locale, options?.preferredVoiceName);
    if (voice) utter.voice = voice;

    utter.onend = () => resolve();
    utter.onerror = () => {
      console.warn("TTS Fehler (ignored)");
      resolve();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
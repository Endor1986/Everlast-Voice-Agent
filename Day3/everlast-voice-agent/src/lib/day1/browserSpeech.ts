"use client";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as Window;
  return ((w.SpeechRecognition as SpeechRecognitionCtor | undefined) ?? (w.webkitSpeechRecognition as SpeechRecognitionCtor | undefined) ?? null);
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
    throw new Error("SpeechRecognition wird in diesem Browser nicht unterstÃ¼tzt. Nutze Chrome oder Edge.");
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

export function speakBrowser(text: string, locale: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("speechSynthesis wird in diesem Browser nicht unterstÃ¼tzt."));
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = locale;
    utter.rate = 1.0;
    utter.pitch = 1.0;

    utter.onend = () => resolve();
    utter.onerror = () => { console.warn("TTS Fehler (ignored)"); resolve(); };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}











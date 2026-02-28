# Everlast Voice Agent

Browserbasierter Voice Agent zur strukturierten Terminaufnahme. Proof of Concept für ein sprachgesteuertes Termin und Anfrage System.

Status: Day 3 abgeschlossen (Voice Input und Voice Output in Free und Pro)

## Hinweis zum Scope

Dieses Projekt ist bewusst ein Lernprojekt und Proof of Concept. Die Architektur ist offen gehalten, damit später Erweiterungen möglich sind (zum Beispiel UI, Flow Logik, Persistenz, Backend Anbindung, Prompting, weitere Voices). Für Day 3 bleibt der Umfang absichtlich kompakt, damit der Kontext nicht ausufert.

## Projektziel

Der Everlast Voice Agent erfasst Termine und Anfragen über Sprache oder Texteingabe, strukturiert die Informationen und kann später an ein Backend übergeben werden. Das System wird schrittweise aufgebaut und bewusst iterativ erweitert.

## Features

### Free (Browser Mode)

- Spracheingabe über SpeechRecognition
- Sprachausgabe über Browser TTS
- Dialoglogik über den bestehenden Day 1 Flow (AgentFlow)
- Kontakt bleibt im Free Flow per Eingabefeld (Voice ist dort bewusst gesperrt)

### Pro (API Mode)

- Spracheingabe über denselben Start Button (SpeechRecognition)
- Antworten kommen über `/api/pro` (lokales Ollama) und werden vorgelesen
- Eigener Pro Starttext beim Umschalten oder Reset:
  „Das ist der Pro Modus von Everlast. Was kann ich für dich tun?“
- Pro bevorzugt die Stimme „Katja“, Free bleibt unverändert

## Projektstruktur

- `src/app/page.tsx`  
  UI, Mode Switch, Voice Start Stop, Pro Init, Pro TTS

- `src/lib/day1/agentFlow.ts`  
  Dialog Logik und Zustandsmaschine

- `src/lib/day1/browserSpeech.ts`  
  SpeechRecognition Wrapper und Browser TTS, inklusive Sprach Rate (de, en) und optionaler bevorzugter Voice

- `src/app/api/pro/route.ts`  
  Pro API Route, Verbindung zu Ollama

- `next.config.ts`  
  Windows Fix: `distDir: ".next-local"` und `outputFileTracingRoot`

## Development

```bash
npm install
npm run dev
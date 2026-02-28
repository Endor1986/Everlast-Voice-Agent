# Everlast Voice Agent

Browserbasierter Voice-Agent zur strukturierten Terminaufnahme.  
Proof-of-Concept für ein sprachgesteuertes Termin- und Anfrage-System.

Status: Day-1 MVP stabil

---

## Projektziel

Der Everlast Voice Agent soll Termine und Anfragen über Sprache erfassen, strukturieren und später an ein Backend übergeben.  
Das System wird bewusst schrittweise aufgebaut, um jeden Entwicklungstag sauber nachvollziehen zu können.

---

## Funktionen (Day 1)

- Browser SpeechRecognition ohne API Keys
- Browser Text-to-Speech Ausgabe
- Geführter Dialog-Flow
- Anliegen → Thema → Name → Kontakt → Termin
- Kontakt nur per Eingabefeld (kein Voice-Kontakt mehr)
- Telefonnummern werden für TTS korrekt einzeln vorgelesen
- Datum / Wochentag / Uhrzeit frei formulierbar
- Automatische Zusammenfassung
- Stabiler Produktions-Build möglich

---

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- React Hooks State Flow
- Browser Speech API
- Lokale Flow-State-Machine

---

## Projektstruktur

src/
 ├── app/page.tsx
 │   UI, Voice Control, Flow Rendering
 │
 ├── lib/day1/agentFlow.ts
 │   Dialog-Logik / Zustandsmaschine
 │
 ├── lib/day1/browserSpeech.ts
 │   SpeechRecognition Wrapper
 │
 ├── types/
 │   Typdefinitionen

---

## Development

npm install  
npm run dev  

Dann öffnen:  
http://localhost:3000

---

## Build

npm run build  
npm start  

---

## Roadmap

Day 2
- Server Speech-to-Text (Whisper)
- API Route
- Termin als JSON exportieren
- Logging

Day 3
- Persistenz der Anfragen
- Admin-View
- Backend-Integration vorbereiten

---

## Author

Phillip Kley  
Everlast Voice Agent Prototype

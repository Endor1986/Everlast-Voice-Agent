# Everlast Voice Agent

Browserbasierter Voice-Agent zur strukturierten Terminaufnahme.  
Proof of Concept für ein sprachgesteuertes Termin- und Anfrage-System.

Status: Day 2 MVP stabil (Local AI Integration)

## Projektziel

Der Everlast Voice Agent soll Termine und Anfragen über Sprache erfassen, strukturieren und später an ein Backend übergeben.  
Das System wird bewusst schrittweise aufgebaut, um jeden Entwicklungstag sauber nachvollziehen zu können.

## Funktionen (Day 1)

- Browser SpeechRecognition ohne API Keys
- Browser Text-to-Speech Ausgabe
- Geführter Dialog-Flow
- Anliegen → Thema → Name → Kontakt → Termin
- Kontakt nur per Eingabefeld (kein Voice-Kontakt mehr)
- Telefonnummern werden für TTS korrekt einzeln vorgelesen
- Datum, Wochentag, Uhrzeit frei formulierbar
- Automatische Zusammenfassung
- Stabiler Produktions-Build möglich

## Funktionen (Day 2)

- Local AI Integration via Ollama
- Eigene API Route zum lokalen Sprachmodell
- Offline Gesprächskern ohne Cloud-Abhängigkeit
- Keine API Keys erforderlich
- Kostenlos betreibbare KI-Grundlage
- Basis für Voice-Agent-Logik

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- React Hooks State Flow
- Browser Speech API
- Lokale Flow-State-Machine
- Local LLM (Ollama)

## Projektstruktur

```text
src/
├── app/
│   ├── page.tsx
│   │   UI, Voice Control, Flow Rendering
│   └── api/
│       └── pro/
│           └── route.ts
│               Local AI Verbindung (Ollama)
├── lib/
│   └── day1/
│       ├── agentFlow.ts
│       │   Dialog-Logik, Zustandsmaschine
│       └── browserSpeech.ts
│           SpeechRecognition Wrapper, Browser TTS
└── types/
    Typdefinitionen
```

## Development

npm install  
npm run dev  

Dann öffnen:  
http://localhost:3000

## Build

npm run build  
npm start  

## Roadmap (Day 3)

- Voice Layer Integration (Speech-to-Text und TTS)
- Sprachgesteuerte Dialogsteuerung
- Übergabe an Local AI
- Antwort als Sprache ausgeben

## Author

Phillip Kley  
Everlast Voice Agent Prototype

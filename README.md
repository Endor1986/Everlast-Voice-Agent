<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5%2B-3178C6?logo=typescript&logoColor=white">
  <img alt="Voice" src="https://img.shields.io/badge/Voice-Browser%20Speech-ff9800">
  <img alt="AI" src="https://img.shields.io/badge/AI-Local%20or%20Cloud-6a5acd">
  <img alt="Provider" src="https://img.shields.io/badge/Provider-Env%20Switch-success">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-lightgrey.svg">
</p>

# Everlast Voice Agent

Browserbasierter Voice Agent zur strukturierten Terminaufnahme.  
Proof of Concept für ein sprachgesteuertes Termin und Anfrage System.

Status: **Day 3 abgeschlossen (Voice Input und Voice Output in Free und Pro)**

Hinweis zum Scope: Dieses Projekt ist bewusst ein Lernprojekt und Proof of Concept. Die Architektur ist offen gehalten, damit später Erweiterungen möglich sind (UI, Flow Logik, Persistenz, Backend Anbindung, Prompting, weitere Voices). Für Day 3 bleibt der Umfang bewusst kompakt, damit der Kontext nicht ausufert.

## Projektziel

Der Everlast Voice Agent soll Termine und Anfragen per Sprache erfassen, strukturieren und später an ein Backend übergeben.

Das System wird schrittweise aufgebaut, damit jeder Entwicklungstag nachvollziehbar dokumentiert ist.

Day 0 beschreibt die technische Grundlage. Day 1 bis Day 3 bauen darauf auf und bringen den Voice Agent bis zum ersten End to End Setup (Free und Pro).

## Architekturentscheidung und Scope

Ursprünglich war geplant, den Agent mit **GPT** als LLM und **Whisper** für Speech to Text umzusetzen, also Cloud basiert.

Für den aktuellen Proof of Concept Scope liegt der Schwerpunkt auf **lokaler KI**, weil sie schneller testbar ist und ohne externe Abhängigkeiten läuft. Entsprechend ist im Repo aktuell ein **Local Provider Pfad** vorbereitet, zum Beispiel über Ollama.

Die finale Entscheidung, ob der produktive Betrieb später lokal oder online läuft, ist noch offen. Die Architektur bleibt bewusst flexibel, damit Cloud Varianten später ergänzt oder ausgetauscht werden können.

## Day 0, Projektbasis

- Next.js Projektstruktur eingerichtet
- Voice UI Grundgerüst vorbereitet
- Dialog Flow und Zustände als Basis definiert
- Browser Speech APIs angebunden
- Lokale Entwicklungsumgebung eingerichtet
- Provider Schnittstelle vorbereitet, um Local oder Cloud per Environment zu wählen

## Day 1, Free Mode MVP

- **Projektbasis eingerichtet** mit Next.js und grundlegender Struktur.
- **Voice UI Grundgerüst** vorbereitet, einschließlich der grundlegenden Eingabefelder und Steuerungselemente.
- **SpeechRecognition** für **Voice Input** integriert.
- **Browser TTS (Text-to-Speech)** für **Voice Output** aktiviert.
- **Free Mode MVP** entwickelt, um Sprach-Input und -Output direkt im Browser zu ermöglichen.
- **Lokale Entwicklungsumgebung** eingerichtet und getestet.

## Day 2, Pro Mode, Local AI Integration

- **Pro Mode** aktiviert mit Nutzung von `/api/pro` für Local AI (z. B. Ollama).
- **Antworten aus der lokalen KI** werden nun per API verarbeitet.
- **Sprachausgabe** im **Pro Mode** mit der `speak(...)`-Methode hinzugefügt, um Antworten direkt vorzulesen.
- **Fehlerbehandlung und Stabilität** im Pro Mode verbessert, damit auch Fehlermeldungen laut ausgesprochen werden.
- **Test der Pro-Modus-Integration** mit Ollama, um AI-basierte Dialoge zu ermöglichen.

## Day 3, Voice End to End

- **Voice Input** ist aktiv (SpeechRecognition)
- **Voice Output** ist aktiv (Browser TTS)
- **Free Mode** nutzt den bestehenden Flow (AgentFlow)
- **Pro Mode** nutzt `/api/pro` für Local AI (z. B. Ollama) und liest Antworten vor

## Tech Stack

- Next.js 15, App Router
- TypeScript
- React Hooks State Flow
- Browser Speech API
- Flow State Machine
- AI Provider Konzept über `.env.local`, Local Default, Cloud optional

## Projektstruktur

src/  
├── app/page.tsx  
│   UI, Mode Switch, Voice Control, Free Flow und Pro Flow  
│  
├── lib/day1/agentFlow.ts  
│   Dialog Logik und Zustandsmaschine (Free)  
│  
├── lib/day1/browserSpeech.ts  
│   SpeechRecognition Wrapper und Browser TTS  
│  
├── app/api/pro/route.ts  
│   Pro API Route, lokale KI über Ollama  
│  
├── lib/day1/types.ts  
│   Typdefinitionen


## Environment

Die Auswahl des AI Providers erfolgt über `.env.local`.

Standard ist Local.  
Wenn später Online genutzt werden soll, wird das über einen Env Key umgestellt, ohne dass die restliche Architektur geändert werden muss.

## Development

npm install  
npm run dev  

Dann öffnen:  
http://localhost:3000  

## Build

npm run build  
npm start  

## Nächste Schritte

Day 1  
erledigt: Voice UI aktivieren  

Day 2  
erledigt: Provider Anbindung, zuerst Local  

Day 3  
erledigt: Voice Agent Verbindung und erstes End to End  


## Videos

Day 1  
https://youtu.be/cIXShDP3qwU

Day 2  
https://youtu.be/u3Sspg0-WH4

Day 3  
https://youtu.be/obD8Jlf9nw4

## Author

Phillip Kley  
Everlast Voice Agent Prototype
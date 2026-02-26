# Everlast Voice Agent

Browserbasierter Voice Agent zur strukturierten Terminaufnahme.  
Proof of Concept für ein sprachgesteuertes Termin und Anfrage System.

Status: **Day 0, Projektbasis und Architektur**

## Projektziel

Der Everlast Voice Agent soll Termine und Anfragen per Sprache erfassen, strukturieren und später an ein Backend übergeben.

Das System wird schrittweise aufgebaut, damit jeder Entwicklungstag nachvollziehbar dokumentiert ist.

Day 0 beschreibt die technische Grundlage vor der eigentlichen Agent Logik.

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
│   UI, Voice Control, Flow Rendering  
│  
├── lib/day1/agentFlow.ts  
│   Dialog Logik und Zustandsmaschine  
│  
├── lib/day1/browserSpeech.ts  
│   SpeechRecognition Wrapper  
│  
├── app/api/pro/route.ts  
│   Provider Endpoint, Routing über `.env.local`  
│  
├── types/  
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
Voice UI aktivieren  

Day 2  
Provider Anbindung, zuerst Local  

Day 3  
Voice Agent Verbindung und erstes End to End

## Author

Phillip Kley  
Everlast Voice Agent Prototype
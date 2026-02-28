"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AgentStatus, ChatMessage, FlowState, Mode, Slots } from "@/lib/day1/types";
import { createBrowserRecognition, isBrowserRecognitionSupported, speakBrowser, stopSpeaking } from "@/lib/day1/browserSpeech";
import { runAgentTurn, FLOW_BUILD_ID } from "@/lib/day1/agentFlow";

function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function formatTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Page() {
    const locale = "de-DE";

    const [mode, setMode] = useState<Mode>("browser");
    const [status, setStatus] = useState<AgentStatus>("idle");
    const [isRecording, setIsRecording] = useState(false);

    const [interim, setInterim] = useState("");
    const [transcript, setTranscript] = useState("");


    const [typedText, setTypedText] = useState('');
    const [flowState, setFlowState] = useState<FlowState>("WELCOME");
    const [slots, setSlots] = useState<Slots>({});
    const [summary, setSummary] = useState<string>("");

    const [chat, setChat] = useState<ChatMessage[]>([]);

    const recRef = useRef<SpeechRecognition | null>(null);
    const finalTextRef = useRef<string>("");

    const [browserSupported, setBrowserSupported] = useState(false);
    useEffect(() => {
        setBrowserSupported(isBrowserRecognitionSupported());
    }, []);

    const proDisabled = false;

    const flowStateRef = useRef<FlowState>("WELCOME");
    const slotsRef = useRef<Slots>({});
    const statusRef = useRef<AgentStatus>("idle");
    const modeRef = useRef<Mode>("browser");
    const transcriptRef = useRef<string>("");
    const interimRef = useRef<string>("");

    useEffect(() => {
        flowStateRef.current = flowState;
    }, [flowState]);

    useEffect(() => {
        slotsRef.current = slots;
    }, [slots]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    useEffect(() => {
        interimRef.current = interim;
    }, [interim]);

    const [contactDraft, setContactDraft] = useState("");
    const contactInputRef = useRef<HTMLInputElement | null>(null);

    function push(role: "user" | "agent", text: string) {
        setChat((prev) => [...prev, { id: uid(), role, text, ts: Date.now() }]);
    }

    function submitTypedText() {
        const v = (typedText ?? "").toString().trim();
        if (!v) return;

        stopSpeaking();
        setTypedText("");
        push("user", v);
        void handleAgentTurn(v);
    }

    async function speakText(text: string) {
        const digitWord = (ch: string) => {
            switch (ch) {
                case "0":
                    return "null";
                case "1":
                    return "eins";
                case "2":
                    return "zwei";
                case "3":
                    return "drei";
                case "4":
                    return "vier";
                case "5":
                    return "fünf";
                case "6":
                    return "sechs";
                case "7":
                    return "sieben";
                case "8":
                    return "acht";
                case "9":
                    return "neun";
                default:
                    return ch;
            }
        };

        const speakDigits = (digits: string) => digits.split("").map(digitWord).join(", ");

        const fixPhoneForTTS = (s: string) => {
            s = s.replace(/\+49\d{6,}/g, (m) => {
                const digits = m.replace(/[^\d]/g, "");
                const rest = digits.slice(2);
                return `plus neunundvierzig, ${speakDigits(rest)}`;
            });

            s = s.replace(/\b\d{10,}\b/g, (m) => speakDigits(m));
            return s;
        };

        const spoken = fixPhoneForTTS(text);

        try {
            setStatus("speaking");

            await new Promise((r) => setTimeout(r, 220));

            await speakBrowser(spoken, locale);

            const low = spoken.toLowerCase();
            if (low.includes("datum") || low.includes("uhrzeit") || low.includes("tageszeit")) {
                await new Promise((r) => setTimeout(r, 900));
            } else {
                await new Promise((r) => setTimeout(r, 320));
            }
        } finally {
            setStatus("idle");
        }
    }

    useEffect(() => {
        const first = runAgentTurn({ userText: "", state: "WELCOME", slots: {} });
        setFlowState(first.nextState);
        setSlots(first.nextSlots);
        setSummary(first.summary ?? "");
        setChat([{ id: uid(), role: "agent", text: first.reply, ts: Date.now() }]);
        void speakText(first.reply);
    }, []);

    useEffect(() => {
        if (flowState === "ASK_CONTACT") {
            try {
                recRef.current?.stop();
            } catch { }
            setIsRecording(false);

            setTimeout(() => {
                contactInputRef.current?.focus();
                contactInputRef.current?.select();
            }, 0);
        }
    }, [flowState]);

    async function runProTurn(userText: string) {
        const res = await fetch("/api/pro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userText }),
        });

        const data = await res.json().catch(() => ({} as any));
        if (!res.ok || !data?.ok) {
            throw new Error(data?.error || "Pro API Fehler");
        }
        return String(data.reply ?? "");
    }

    async function handleAgentTurn(userText: string) {
        setStatus("thinking");

        // Pro Mode: über API Endpoint
        if (modeRef.current === "pro") {
            try {
                const reply = await runProTurn(userText);
                push("agent", reply);

                await speakText(reply);
                return;
            } catch (err: any) {
                const msg = "Pro Fehler: " + String(err?.message ?? "unknown");
                push("agent", msg);
                await speakText(msg);
                setStatus("idle");
                return;
            }
        }

        // Browser Mode: lokaler Day1 Flow
        const out = runAgentTurn({
            userText,
            state: flowStateRef.current,
            slots: slotsRef.current,
        });

        setFlowState(out.nextState);
        setSlots(out.nextSlots);
        setSummary(out.summary ?? (out.isDone ? out.summary ?? summary : summary));

        push("agent", out.reply);

        if (modeRef.current === "browser") {
            await speakText(out.reply);
        } else {
            setStatus("idle");
        }
    }

    function submitTypedContact() {
        const raw = (contactDraft ?? "").toString();
        const v = raw.trim();
        if (!v) return;

        stopSpeaking();
        setInterim("");
        setTranscript(v);

        const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

        const normalizePhone = (s: string) => {
            let p = s.replace(/[^\d+]/g, "");
            if (p.startsWith("00")) p = "+" + p.slice(2);
            if (/^49\d+/.test(p)) p = "+49" + p.slice(2);
            if (/^0\d+/.test(p)) p = "+49" + p.slice(1);

            if (!p.startsWith("+49")) return null;

            const digits = p.replace(/[^\d]/g, "");
            if (digits.length < 11) return null;

            return p;
        };

        let contact: string | null = null;

        if (v.includes("@")) {
            const email = v.replace(/\s+/g, "");
            contact = isEmail(email) ? email : null;
            if (!contact) {
                const msg = "Bitte gib eine gültige E-Mail-Adresse ein.";
                push("agent", msg);
                void speakText(msg);
                return;
            }
        } else {
            const phone = normalizePhone(v);
            if (!phone) {
                const msg = "Bitte gib eine deutsche Telefonnummer im Format +49 ein.";
                push("agent", msg);
                void speakText(msg);
                return;
            }
            contact = phone;
        }

        push("user", contact);

        const nextSlots = { ...slotsRef.current, contact };
        setSlots(nextSlots);
        setContactDraft("");

        setFlowState("ASK_TIMEWINDOW");

        const reply = "Danke dir. Nenn mir bitte zuerst ein Datum oder einen Wochentag und danach die passende Uhrzeit oder Tageszeit.";
        push("agent", reply);
        void speakText(reply);
    }

    function startRecognition() {
        if (modeRef.current !== "browser") return;

        if (flowStateRef.current === "ASK_CONTACT") {
            void speakText("Bitte gib jetzt deine E-Mail oder Telefonnummer in das Eingabefeld ein. Sprache ist hier deaktiviert.");
            return;
        }

        stopSpeaking();
        setInterim("");
        setTranscript("");
        finalTextRef.current = "";

        try {
            const rec = createBrowserRecognition(locale, {
                onStart: () => {
                    setStatus("listening");
                    setIsRecording(true);
                },
                onInterimText: (txt) => setInterim(txt),
                onFinalText: (txt) => {
                    finalTextRef.current = txt;
                    setTranscript(txt);
                },
                onError: (msg) => {
                    setStatus("error");
                    setIsRecording(false);
                    console.error("SpeechRecognition error:", msg);
                    alert("SpeechRecognition Fehler: " + msg);
                },
                onEnd: () => {
                    setIsRecording(false);
                    if (statusRef.current !== "error") setStatus("idle");

                    const finalText = (finalTextRef.current || transcriptRef.current || interimRef.current).trim();
                    setInterim("");

                    if (flowStateRef.current === "ASK_CONTACT") {
                        finalTextRef.current = "";
                        setTranscript("");
                        void speakText("Bitte gib jetzt deine E-Mail oder Telefonnummer in das Eingabefeld ein. Sprache ist hier deaktiviert.");
                        return;
                    }

                    if (finalText) {
                        push("user", finalText);
                        void handleAgentTurn(finalText);
                    }
                },
            });

            recRef.current = rec;
            rec.start();
        } catch (e: unknown) {
            setStatus("error");
            setIsRecording(false);
            alert((e instanceof Error ? e.message : "SpeechRecognition Fehler"));
        }
    }

    function stopRecognition() {
        try {
            recRef.current?.stop();
        } catch { }
    }

    function resetConversation() {
        stopSpeaking();
        try {
            recRef.current?.abort();
        } catch { }
        recRef.current = null;

        setIsRecording(false);
        setStatus("idle");
        setInterim("");
        setTranscript("");
        setSlots({});
        setSummary("");
        setContactDraft("");

        const first = runAgentTurn({ userText: "", state: "WELCOME", slots: {} });
        setFlowState(first.nextState);
        setSlots(first.nextSlots);
        setSummary(first.summary ?? "");
        setChat([{ id: uid(), role: "agent", text: first.reply, ts: Date.now() }]);
        void speakText(first.reply);
    }

    async function copySummary() {
        const txt = summary.trim();
        if (!txt) return;
        try {
            await navigator.clipboard.writeText(txt);
            alert("Zusammenfassung kopiert");
        } catch {
            alert("Kopieren hat nicht geklappt");
        }
    }

    const card: React.CSSProperties = {
        background: "#fafafa",
        border: "1px solid #e7e7e7",
        borderRadius: 14,
        padding: "18px 18px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.06)",
    };

    const pill: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #e7e7e7",
        background: "#fff",
        color: "#111",
        caretColor: "#111",
        fontSize: 13,
        boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    };

    const controlCard: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid #e7e7e7",
        background: "#fff",
        color: "#111",
        caretColor: "#111",
        boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
    };

    const selectStyle: React.CSSProperties = {
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #dcdcdc",
        background: "#fff",
        color: "#111",
        caretColor: "#111",
        color: "#111",
        fontWeight: 800,
        fontSize: 15,
        minWidth: 220,
        outline: "none",
    };

    const button: React.CSSProperties = {
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #dcdcdc",
        background: "#fff",
        color: "#111",
        caretColor: "#111",
        color: "#111",
        fontWeight: 800,
        lineHeight: 1,
        minWidth: 92,
        userSelect: "none",
        cursor: "pointer",
    };

    const buttonDisabled: React.CSSProperties = {
        ...button,
        background: "#f3f3f3",
        color: "#777",
        cursor: "not-allowed",
        opacity: 0.85,
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "11px 12px",
        borderRadius: 12,
        border: "1px solid #dcdcdc",
        background: "#fff",
        color: "#111",
        caretColor: "#111",
        color: "#111",
        fontWeight: 700,
        fontSize: 16,
        outline: "none",
    };

    return (
        <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 18px 60px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: 0.2, textAlign: "center", marginBottom: 8 }}>Everlast Voice Agent</h1>

            <p style={{ textAlign: "center", color: "#444", marginTop: 0, marginBottom: 18, lineHeight: 1.55 }}>
                Tag 1. Browser Mode MVP ohne API Keys. Pro Mode kommt an Tag 2.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={controlCard}>
                    <label style={{ fontWeight: 900, fontSize: 15, color: "#111" }}>Mode</label>
                    <select
                        value={mode}
                        onChange={(e) => {
                            const v = e.target.value as Mode;
                            setMode(v);
                        }}
                        style={selectStyle}
                    >
                        <option value="browser">Browser (Free)</option>
                        <option value="pro">Pro (API)</option>
                    </select>

                    <button onClick={resetConversation} style={button}>Reset</button>

                    <span style={pill}>Build: <b>{FLOW_BUILD_ID}</b></span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                <div style={card}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Voice Control</h3>
                            <p style={{ margin: "6px 0 0 0", color: "#444", lineHeight: 1.55, fontSize: 15.5 }}>
                                SpeechRecognition + Browser TTS. Bei Kontakt ist Sprache deaktiviert.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {!isRecording ? (
                                <button
                                    onClick={startRecognition}
                                    disabled={!browserSupported || mode !== "browser" || flowState === "ASK_CONTACT"}
                                    style={!browserSupported || mode !== "browser" || flowState === "ASK_CONTACT" ? buttonDisabled : button}
                                >
                                    Start
                                </button>
                            ) : (
                                <button onClick={stopRecognition} style={button}>Stop</button>
                            )}

                            <button onClick={() => stopSpeaking()} style={button}>Stop Voice</button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                        <div style={{
                            background: "#fff",
                            color: "#111",
                            caretColor: "#111", border: "1px solid #e7e7e7", borderRadius: 12, padding: 12
                        }}>
                            <div style={{ fontWeight: 900, marginBottom: 6 }}>Interim</div>
                            <div style={{ color: "#444", lineHeight: 1.55, fontSize: 15.5, minHeight: 48 }}>{interim || " "}</div>
                        </div>

                        <div style={{
                            background: "#fff",
                            color: "#111",
                            caretColor: "#111", border: "1px solid #e7e7e7", borderRadius: 12, padding: 12
                        }}>
                            <div style={{ fontWeight: 900, marginBottom: 6 }}>Final</div>
                            <div style={{ color: "#444", lineHeight: 1.55, fontSize: 15.5, minHeight: 48 }}>{transcript || " "}</div>
                        </div>
                    </div >

                    {flowState === "ASK_CONTACT" && (
                        <div style={{
                            marginTop: 14, background: "#fff",
                            color: "#111",
                            caretColor: "#111", border: "1px solid #e7e7e7", borderRadius: 12, padding: 12
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                                <div style={{ fontWeight: 900 }}>Kontakt eingeben</div>
                                <span style={pill}>E-Mail oder Telefon (+49)</span>
                            </div>

                            <p style={{ margin: "8px 0 10px 0", color: "#444", lineHeight: 1.55, fontSize: 15.5 }}>
                                Bitte hier tippen. Enter sendet sofort.
                            </p>

                            <input
                                ref={contactInputRef}
                                value={contactDraft}
                                onChange={(e) => setContactDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") submitTypedContact(); }}
                                placeholder="E-Mail oder Telefonnummer eingeben, z.B. name@firma.de oder +49..."
                                inputMode="text"
                                style={inputStyle}
                            />

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                                <button onClick={submitTypedContact} style={!contactDraft.trim() ? buttonDisabled : button} disabled={!contactDraft.trim()}>
                                    Senden
                                </button>
                            </div>
                        </div >
                    )}
                </div >

                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Conversation</h3>
                        <span style={pill}>Messages: <b>{chat.length}</b></span>
                    </div>


                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                        <input
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    submitTypedText();
                                }
                            }}
                            placeholder={mode === "pro" ? "Tippe an Pro (API)..." : "Tippe eine Nachricht..."}
                            style={{
                                flex: 1,
                                minWidth: 240,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid #e7e7e7",
                                background: "#fff",
                                color: "#111",
                                caretColor: "#111",
                                fontSize: 15.5,
                                outline: "none",
                            }}
                        />
                        <button
                            onClick={submitTypedText}
                            style={!typedText.trim() ? buttonDisabled : button}
                            disabled={!typedText.trim()}
                        >
                            Senden
                        </button>
                    </div>
                    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                        {chat.map((m) => (
                            <div
                                key={m.id}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "90px 1fr",
                                    gap: 10,
                                    padding: 12,
                                    borderRadius: 12,
                                    border: "1px solid #e7e7e7",
                                    background: m.role === "agent" ? "#fff" : "#fdfdfd",
                                }}
                            >
                                <div style={{ fontSize: 13, color: "#555" }}>
                                    <div style={{ fontWeight: 900 }}>{m.role === "agent" ? "Agent" : "You"}</div>
                                    <div>{formatTime(m.ts)}</div>
                                </div>
                                <div style={{ fontSize: 15.5, lineHeight: 1.55, color: "#222", whiteSpace: "pre-wrap" }}>{m.text}</div>
                            </div>
                        ))}
                    </div >
                </div >

                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Summary</h3>
                        <button onClick={copySummary} style={!summary.trim() ? buttonDisabled : button} disabled={!summary.trim()}>
                            Copy
                        </button>
                    </div>

                    <div style={{
                        marginTop: 12, background: "#fff",
                        color: "#111",
                        caretColor: "#111", border: "1px solid #e7e7e7", borderRadius: 12, padding: 12
                    }}>
                        <div style={{ fontSize: 15.5, lineHeight: 1.55, color: "#222", whiteSpace: "pre-wrap", minHeight: 84 }}>
                            {summary.trim() || "Noch keine Zusammenfassung. Sobald du den Confirm Step erreichst, erscheint sie hier."}
                        </div>
                    </div>

                    <p style={{ margin: "12px 0 0 0", color: "#444", lineHeight: 1.55, fontSize: 15.5 }}>
                        Hinweis: Pro Mode bleibt in Tag 1 deaktiviert. Tag 2 bringt Whisper, GPT und optional API TTS.
                    </p>
                </div >
            </div >
        </main >
    );
}

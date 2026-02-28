"use client";
import React from "react";
import type { ChatMessage } from "@/lib/day1/types";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatView({ chat }: { chat: ChatMessage[] }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
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
          <div style={{ fontSize: 15.5, lineHeight: 1.55, color: "#222", whiteSpace: "pre-wrap" }}>
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}

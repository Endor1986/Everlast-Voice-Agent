import { NextResponse } from "next/server";
import { runAgentTurn } from "@/lib/day1/agentFlow";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = runAgentTurn({
      userText: body.userText ?? "",
      state: body.state ?? "WELCOME",
      slots: body.slots ?? {}
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({
      reply: "Server Fehler",
      nextState: "ASK_GOAL",
      nextSlots: {},
      isDone: false
    });
  }
}

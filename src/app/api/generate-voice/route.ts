import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import { EdgeTTS } from "node-edge-tts";
import { findHaramTerm } from "@/lib/halal";
import { ensureDirs, voicePath } from "@/lib/storage";
import { DEFAULT_VOICE, findVoice } from "@/lib/voices";

export const runtime = "nodejs";
export const maxDuration = 60;

// Tiny in-memory rate limit (per client id): 20 voice requests / minute.
const hits = new Map<string, number[]>();
function limited(id: string) {
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(id, recent);
  return recent.length > 20;
}

/** POST { text, voiceId } -> audio/mpeg. The saved file id is returned in the X-Voice-Id header. */
export async function POST(req: NextRequest) {
  try {
    const clientId = req.headers.get("x-client-id") || "anon";
    if (limited(clientId)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

    const { text, voiceId = DEFAULT_VOICE } = await req.json();
    const clean = String(text ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
    if (!clean) return NextResponse.json({ error: "Text is required." }, { status: 400 });

    const voice = findVoice(String(voiceId));
    if (!voice) return NextResponse.json({ error: "Unknown voice." }, { status: 400 });
    if (findHaramTerm(clean)) return NextResponse.json({ error: "haram" }, { status: 422 });

    ensureDirs();
    const id = crypto.randomUUID();
    const file = voicePath(id);

    const tts = new EdgeTTS({
      voice: voice.id,
      lang: voice.lang,
      outputFormat: "audio-24khz-96kbitrate-mono-mp3",
      rate: "+10%", // hook-style pacing
      timeout: 20_000,
    });
    await tts.ttsPromise(clean, file);

    const buf = fs.readFileSync(file);
    return new Response(buf, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buf.length),
        "X-Voice-Id": id,
        "Access-Control-Expose-Headers": "X-Voice-Id",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: `Voice generation failed: ${(e as Error).message}` }, { status: 500 });
  }
}

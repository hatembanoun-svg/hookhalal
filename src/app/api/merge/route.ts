import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import { spawn } from "child_process";
import { UUID_RE, ensureDirs, videoPath, voicePath } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 120;

function runFfmpeg(args: string[]): Promise<{ ok: boolean; err: string }> {
  return new Promise((resolve) => {
    const p = spawn("ffmpeg", args); // no shell: args are passed as an array
    let err = "";
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("error", (e) => resolve({ ok: false, err: e.message }));
    p.on("close", (code) => resolve({ ok: code === 0, err: err.slice(-400) }));
  });
}

/**
 * POST { videoId, voiceId, whoosh? } -> { url }
 * Core command:  ffmpeg -i video.mp4 -i voice.mp3 -c:v copy -c:a aac -shortest output.mp4
 * `apad` pads a short voice with silence so the clip keeps its full 5s (-shortest then stops at the video).
 * `whoosh` mixes a short synthesized noise sweep at the start. It is NOT music.
 */
export async function POST(req: NextRequest) {
  const { videoId, voiceId, whoosh = false } = await req.json();
  if (!UUID_RE.test(videoId ?? "") || !UUID_RE.test(voiceId ?? ""))
    return NextResponse.json({ error: "Bad ids." }, { status: 400 });

  const video = videoPath(videoId);
  const voice = voicePath(voiceId);
  if (!fs.existsSync(video) || !fs.existsSync(voice))
    return NextResponse.json({ error: "Video or voice file not found (expired?)." }, { status: 404 });

  ensureDirs();
  const outId = crypto.randomUUID();
  const out = videoPath(outId);

  const args = whoosh
    ? [
        "-y", "-i", video, "-i", voice,
        "-f", "lavfi", "-i", "anoisesrc=d=0.7:c=pink:a=0.35",
        "-filter_complex",
        "[2:a]highpass=f=400,lowpass=f=5000,afade=t=in:d=0.3,afade=t=out:st=0.3:d=0.4[w];" +
          "[1:a][w]amix=inputs=2:duration=first:normalize=0,apad[a]",
        "-map", "0:v", "-map", "[a]",
        "-c:v", "copy", "-c:a", "aac", "-shortest", out,
      ]
    : ["-y", "-i", video, "-i", voice, "-map", "0:v", "-map", "1:a", "-af", "apad", "-c:v", "copy", "-c:a", "aac", "-shortest", out];

  const r = await runFfmpeg(args);
  if (!r.ok) return NextResponse.json({ error: `ffmpeg failed: ${r.err}` }, { status: 500 });
  return NextResponse.json({ url: `/api/videos/${outId}` });
}

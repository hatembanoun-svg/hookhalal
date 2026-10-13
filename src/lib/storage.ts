import fs from "fs";
import path from "path";

export const DATA_DIR = process.env.DATA_DIR || "/tmp/hookhalal";
export const VIDEO_DIR = path.join(DATA_DIR, "videos");
export const VOICE_DIR = path.join(DATA_DIR, "voices");

export function ensureDirs() {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  fs.mkdirSync(VOICE_DIR, { recursive: true });
}

export function videoPath(id: string) {
  return path.join(VIDEO_DIR, `${id}.mp4`);
}

export function voicePath(id: string) {
  return path.join(VOICE_DIR, `${id}.mp3`);
}

export const UUID_RE = /^[a-f0-9-]{36}$/;

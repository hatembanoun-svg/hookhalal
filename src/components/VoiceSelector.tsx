"use client";
import { useRef, useState } from "react";
import { VOICES } from "@/lib/voices";
import { generateVoice } from "@/lib/voice-client";
import type { Dict } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export default function VoiceSelector({
  selectedText, voiceId, onVoiceChange, onVoiceGenerated, clientId, lang, t,
}: {
  selectedText: string;
  voiceId: string;
  onVoiceChange: (id: string) => void;
  /** Called with a playable blob URL and the server-side voice file id. */
  onVoiceGenerated: (url: string, fileId: string) => void;
  clientId: string;
  lang: Lang;
  t: Dict;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);

  async function preview() {
    if (!selectedText.trim()) return;
    setBusy(true); setErr("");
    try {
      const { url, id } = await generateVoice(selectedText, voiceId, clientId);
      onVoiceGenerated(url, id);
      audio.current?.pause();
      audio.current = new Audio(url);
      await audio.current.play();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <select
          value={voiceId}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs"
          aria-label={t.voice}
        >
          {VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.flag} {lang === "ar" ? v.labelAr : v.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={preview}
          disabled={busy || !selectedText.trim()}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700 disabled:opacity-50"
        >
          {busy ? "…" : `▶ ${t.preview}`}
        </button>
      </div>
      {err && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}

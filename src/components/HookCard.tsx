"use client";
import { useEffect, useRef, useState } from "react";
import type { Hook, Lang, VideoState } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { DEFAULT_VOICE } from "@/lib/voices";
import { generateVoice } from "@/lib/voice-client";
import VoiceSelector from "./VoiceSelector";

export default function HookCard({
  index, hook, video, selected, onSelect, halal, lang, clientId, t,
}: {
  index: number; hook: Hook; video?: VideoState; selected: boolean; onSelect: () => void;
  halal: boolean; lang: Lang; clientId: string; t: Dict;
}) {
  const v = video ?? { status: "idle" as const };
  const overlayText = v.textOverlay || hook.overlay;

  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE);
  const [voiceText, setVoiceText] = useState(overlayText);
  const [voice, setVoice] = useState<{ url: string; id: string } | null>(null);
  const [whoosh, setWhoosh] = useState(false);
  const [busy, setBusy] = useState<"" | "voice" | "merge">("");
  const [err, setErr] = useState("");

  const vref = useRef<HTMLVideoElement>(null);
  const aref = useRef<HTMLAudioElement>(null);

  // Keep the voice text in sync with the overlay returned by /api/generate-videos.
  useEffect(() => { setVoiceText(overlayText); setVoice(null); }, [overlayText]);
  // A changed voice or text invalidates the attached voiceover.
  useEffect(() => { setVoice(null); }, [voiceId, voiceText]);

  // ---- video <-> audio sync ----
  const syncStart = () => {
    const a = aref.current, vid = vref.current;
    if (!a || !vid) return;
    a.currentTime = vid.currentTime;
    a.play().catch(() => {});
  };
  const syncPause = () => aref.current?.pause();
  const syncSeek = () => {
    if (aref.current && vref.current) aref.current.currentTime = vref.current.currentTime;
  };
  const syncTick = () => {
    const a = aref.current, vid = vref.current;
    if (!a || !vid || vid.paused) return;
    if (Math.abs(a.currentTime - vid.currentTime) > 0.35) a.currentTime = vid.currentTime; // drift / loop restart
    if (a.paused) a.play().catch(() => {});
  };

  async function addVoice() {
    setBusy("voice"); setErr("");
    try {
      setVoice(await generateVoice(voiceText, voiceId, clientId));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function downloadWithVoice() {
    if (!voice || !v.videoId) return;
    setBusy("merge"); setErr("");
    try {
      const r = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: v.videoId, voiceId: voice.id, whoosh }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Merge failed");
      const a = document.createElement("a");
      a.href = `${j.url}?dl=1`;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  const words = voiceText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-4 ${selected ? "border-brand" : "border-zinc-800"} bg-zinc-900`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-brand">#{index + 1}</span>
        {halal && <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] text-brand">{t.halalBadge}</span>}
      </div>

      <p className="text-lg font-bold leading-snug">{hook.stopScroll}</p>

      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black">
        {v.status === "done" && v.url ? (
          <>
            <video
              ref={vref}
              src={v.url}
              controls loop muted playsInline
              className="h-full w-full object-cover"
              onPlay={syncStart} onPause={syncPause} onSeeked={syncSeek} onTimeUpdate={syncTick}
            />
            {voice && <audio ref={aref} src={voice.url} preload="auto" />}
            <div className="pointer-events-none absolute inset-x-0 top-6 px-4 text-center text-lg font-extrabold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              {overlayText}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-sm text-zinc-400">
            {v.status === "running" && <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-brand" />}
            <span>{v.status === "running" ? t.running : v.status === "error" ? `${t.error}: ${v.error ?? ""}` : hook.overlay}</span>
          </div>
        )}
      </div>

      <dl className="space-y-1 text-xs text-zinc-400">
        <div><dt className="inline font-semibold text-zinc-300">{t.stop}: </dt><dd className="inline">{hook.stopScroll}</dd></div>
        <div><dt className="inline font-semibold text-zinc-300">{t.proof}: </dt><dd className="inline">{hook.proof}</dd></div>
        <div><dt className="inline font-semibold text-zinc-300">{t.bridge}: </dt><dd className="inline">{hook.bridge}</dd></div>
      </dl>

      {v.status === "done" && (
        <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-xs font-semibold text-zinc-300">🎙 {t.voice}</div>
          <textarea
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            rows={2}
            maxLength={300}
            aria-label={t.voiceText}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs outline-none focus:border-brand"
          />
          {words > 16 && <p className="text-[11px] text-amber-400">{t.tooLong}</p>}

          <VoiceSelector
            selectedText={voiceText}
            voiceId={voiceId}
            onVoiceChange={setVoiceId}
            onVoiceGenerated={(url, id) => setVoice({ url, id })}
            clientId={clientId}
            lang={lang}
            t={t}
          />

          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input type="checkbox" checked={whoosh} onChange={(e) => setWhoosh(e.target.checked)} />
            {t.whoosh}
          </label>

          <div className="flex gap-2">
            <button
              onClick={addVoice}
              disabled={busy !== "" || !voiceText.trim()}
              className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold hover:bg-zinc-700 disabled:opacity-50"
            >
              {busy === "voice" ? t.working : voice ? t.voiceAdded : t.addVoice}
            </button>
            <button
              onClick={downloadWithVoice}
              disabled={busy !== "" || !voice}
              className="flex-1 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-black disabled:opacity-40"
            >
              {busy === "merge" ? t.working : `⬇ ${t.downloadVoice}`}
            </button>
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <button
          onClick={onSelect}
          disabled={v.status !== "done"}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-40 ${
            selected ? "bg-brand text-black" : "bg-zinc-800 hover:bg-zinc-700"
          }`}
        >
          {selected ? t.selected : t.select}
        </button>
        {v.status === "done" && v.url && (
          <a href={`${v.url}?dl=1`} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700" download>
            ⬇ {t.download}
          </a>
        )}
      </div>
    </div>
  );
}

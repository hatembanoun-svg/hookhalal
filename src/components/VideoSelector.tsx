"use client";
import { useState } from "react";
import type { Hook, Lang, VideoState } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import HookCard from "./HookCard";

export default function VideoSelector({
  hooks, videos, halal, lang, clientId, t,
}: { hooks: Hook[]; videos: VideoState[]; halal: boolean; lang: Lang; clientId: string; t: Dict }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {hooks.map((h, i) => (
        <HookCard key={i} index={i} hook={h} video={videos[i]} selected={sel === i} onSelect={() => setSel(i)}
          halal={halal} lang={lang} clientId={clientId} t={t} />
      ))}
    </div>
  );
}

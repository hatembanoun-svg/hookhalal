// Browser helper: calls /api/generate-voice and caches results per (voice, text).
const cache = new Map<string, { url: string; id: string }>();

export async function generateVoice(text: string, voiceId: string, clientId: string) {
  const key = `${voiceId}::${text}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const r = await fetch("/api/generate-voice", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-client-id": clientId },
    body: JSON.stringify({ text, voiceId }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || `Voice failed (${r.status})`);
  }
  const id = r.headers.get("X-Voice-Id") || "";
  const url = URL.createObjectURL(await r.blob());
  const out = { url, id };
  cache.set(key, out);
  return out;
}

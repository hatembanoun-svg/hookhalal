import type { Hook, Lang } from "./types";
import { buildSafePrompt } from "./halal";

type Cfg = { baseUrl: string; model: string; key?: string };

function systemPrompt(halal: boolean) {
  return `You are a short-form video hook strategist (TikTok / Reels / Shorts).
Create exactly 3 DIFFERENT hooks (different angles) for a 5-second video, using this structure:
- stopScroll (0-1s): shocking, curiosity-driven on-screen text, max 8 words
- proof (1-3s): what the close-up shows to create tension/proof, one sentence
- bridge (3-5s): bridge to the product, one sentence
- overlay: the short text overlay for the video (max 10 words)
- visualPrompt: ENGLISH text-to-video prompt describing ONLY the physical scene (product, surface, lighting, camera move). ${
    halal
      ? "HALAL MODE: product and hands only. Never mention faces, people, music, or singing."
      : "Never mention music."
  }
Write stopScroll, proof, bridge and overlay in the SAME language as the user's idea (Arabic stays Arabic).
Answer with ONLY valid JSON: {"hooks":[{"stopScroll":"","proof":"","bridge":"","overlay":"","visualPrompt":""},{...},{...}]}`;
}

async function callChat(cfg: Cfg, product: string, idea: string, halal: boolean) {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.key ? { Authorization: `Bearer ${cfg.key}` } : {}),
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt(halal) },
        { role: "user", content: `Product: ${product}\nIdea / angle: ${idea}` },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

function parse(text: string, halal: boolean): Hook[] {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  const json = JSON.parse(text.slice(s, e + 1));
  const hooks = (json.hooks as any[]).slice(0, 3);
  if (hooks.length < 3) throw new Error("LLM returned fewer than 3 hooks");
  return hooks.map((h) => ({
    stopScroll: String(h.stopScroll ?? ""),
    proof: String(h.proof ?? ""),
    bridge: String(h.bridge ?? ""),
    overlay: String(h.overlay ?? h.stopScroll ?? ""),
    visualPrompt: buildSafePrompt(String(h.visualPrompt ?? ""), halal),
  }));
}

export async function generateHooks(opts: {
  product: string;
  idea: string;
  halal: boolean;
  groqKey?: string;
  lang?: Lang;
}): Promise<Hook[]> {
  const groqKey = opts.groqKey || process.env.GROQ_KEY;
  const providers: Cfg[] = [];
  if (groqKey)
    providers.push({
      baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      key: groqKey,
    });
  providers.push({
    baseUrl: process.env.OLLAMA_URL || "http://localhost:11434/v1",
    model: process.env.OLLAMA_MODEL || "llama3.1",
  });

  let lastErr: unknown;
  for (const cfg of providers) {
    try {
      const text = await callChat(cfg, opts.product, opts.idea, opts.halal);
      return parse(text, opts.halal);
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `No LLM available. Add a free Groq key or start Ollama. (${(lastErr as Error)?.message ?? ""})`
  );
}

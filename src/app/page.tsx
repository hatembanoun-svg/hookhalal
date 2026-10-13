"use client";
import { useCallback, useEffect, useState } from "react";
import { dict } from "@/lib/i18n";
import type { Hook, Lang, VideoState } from "@/lib/types";
import HalalToggle from "@/components/HalalToggle";
import VideoSelector from "@/components/VideoSelector";
import Pricing from "@/components/Pricing";
import FormulaLibrary from "@/components/FormulaLibrary";

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const t = dict[lang];
  const [clientId, setClientId] = useState("");
  const [product, setProduct] = useState("");
  const [idea, setIdea] = useState("");
  const [halal, setHalal] = useState(true);
  const [falKey, setFalKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [engine, setEngine] = useState<"fal" | "comfy">("fal");
  const [credits, setCredits] = useState<number | null>(null);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [videos, setVideos] = useState<VideoState[]>([]);
  const [busy, setBusy] = useState<"" | "hooks" | "videos">("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"gen" | "lib">("gen");

  useEffect(() => {
    let id = ls.get("hh_client");
    if (!id) { id = crypto.randomUUID(); ls.set("hh_client", id); }
    setClientId(id);
    setFalKey(ls.get("hh_fal"));
    setGroqKey(ls.get("hh_groq"));
    const l = (ls.get("hh_lang") as Lang) || "en";
    setLang(l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    ls.set("hh_lang", lang);
  }, [lang]);

  const refreshCredits = useCallback(async (id: string) => {
    if (!id) return;
    const r = await fetch("/api/credits", { headers: { "x-client-id": id } });
    if (r.ok) setCredits((await r.json()).credits);
  }, []);
  useEffect(() => { refreshCredits(clientId); }, [clientId, refreshCredits]);

  const byok = engine === "fal" && !!falKey.trim();

  function genHooks(e: React.FormEvent) {
    e.preventDefault();
    return runHooks(product, idea);
  }

  async function runHooks(p: string, i: string) {
    setError(""); setHooks([]); setVideos([]); setBusy("hooks");
    try {
      const r = await fetch("/api/generate-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(groqKey ? { "x-groq-key": groqKey } : {}) },
        body: JSON.stringify({ product: p, idea: i, halal }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error === "haram" ? t.haram : j.error);
      setHooks(j.hooks);
      setVideos(j.hooks.map(() => ({ status: "idle" })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function genVideos() {
    setError(""); setBusy("videos");
    setVideos(hooks.map(() => ({ status: "running" })));
    try {
      const r = await fetch("/api/generate-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientId,
          ...(byok ? { "x-fal-key": falKey.trim() } : {}),
        },
        body: JSON.stringify({ prompts: hooks.map((h) => h.visualPrompt), overlays: hooks.map((h) => h.overlay), halal, engine }),
      });
      if (!r.ok || !r.body) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error === "no_credits" ? "No credits left — buy a pack or paste your own fal.ai key." : j.error || "Failed");
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const m = JSON.parse(line);
          if (m.type === "end") { if (m.credits !== undefined) setCredits(m.credits); continue; }
          setVideos((prev) => prev.map((v, i) => (i === m.i ? { status: m.status, url: m.url, error: m.error, watermarked: m.watermarked, videoId: m.videoId, textOverlay: m.textOverlay } : v)));
        }
      }
    } catch (err) {
      setError((err as Error).message);
      setVideos(hooks.map(() => ({ status: "idle" })));
    } finally {
      setBusy("");
    }
  }

  const input = "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-brand";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">☪ {t.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{t.subtitle}</p>
        </div>
        <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-900">
          {lang === "en" ? "العربية" : "English"}
        </button>
      </header>

      <nav className="mb-6 flex justify-center gap-2">
        {(["gen", "lib"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === k ? "bg-brand text-black" : "border border-zinc-800 hover:bg-zinc-900"}`}>
            {k === "gen" ? t.tabGen : t.tabLib}
          </button>
        ))}
      </nav>

      {tab === "lib" && (
        <FormulaLibrary
          lang={lang} t={t} product={product} onProductChange={setProduct}
          onUse={({ product: p, idea: i }) => { setProduct(p); setIdea(i); setTab("gen"); runHooks(p, i); }}
        />
      )}

      <form onSubmit={genHooks} className={`mx-auto max-w-xl space-y-3 ${tab === "gen" ? "" : "hidden"}`}>
        <label className="block text-sm">{t.product}
          <input className={`${input} mt-1`} value={product} onChange={(e) => setProduct(e.target.value)} placeholder={t.productPh} required />
        </label>
        <label className="block text-sm">{t.idea}
          <textarea className={`${input} mt-1`} rows={2} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={t.ideaPh} required />
        </label>
        <HalalToggle on={halal} onChange={setHalal} t={t} />

        <details className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm">
          <summary className="cursor-pointer font-semibold">⚙ {t.settings}</summary>
          <div className="mt-3 space-y-3">
            <label className="block">{t.engine}
              <select className={`${input} mt-1`} value={engine} onChange={(e) => setEngine(e.target.value as "fal" | "comfy")}>
                <option value="fal">fal.ai (cloud)</option>
                <option value="comfy">ComfyUI + Wan 2.1 1.3B (local, free)</option>
              </select>
            </label>
            <label className="block">{t.falKey}
              <input type="password" autoComplete="off" className={`${input} mt-1`} value={falKey} placeholder="key_id:key_secret"
                onChange={(e) => { setFalKey(e.target.value); ls.set("hh_fal", e.target.value); }} />
            </label>
            <label className="block">{t.groqKey}
              <input type="password" autoComplete="off" className={`${input} mt-1`} value={groqKey} placeholder="gsk_..."
                onChange={(e) => { setGroqKey(e.target.value); ls.set("hh_groq", e.target.value); }} />
            </label>
            <p className="text-xs text-zinc-500">{t.keyTip}</p>
          </div>
        </details>

        <button disabled={busy !== ""} className="w-full rounded-xl bg-brand px-4 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-50">
          {busy === "hooks" ? t.generating : t.generate}
        </button>
        <p className="text-center text-xs text-zinc-500">
          {byok ? t.byok : credits !== null ? `${t.credits}: ${credits}` : ""}
        </p>
      </form>

      {error && <p className="mx-auto mt-4 max-w-xl rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">{error}</p>}

      {hooks.length > 0 && tab === "gen" && (
        <section className="mt-10">
          <div className="mb-4 flex justify-center">
            <button onClick={genVideos} disabled={busy !== ""} className="rounded-xl bg-zinc-100 px-6 py-3 font-bold text-black disabled:opacity-50">
              {busy === "videos" ? t.makingVideos : `🎬 ${t.makeVideos}`}
            </button>
          </div>
          <VideoSelector hooks={hooks} videos={videos} halal={halal} lang={lang} clientId={clientId} t={t} />
        </section>
      )}

      {clientId && <Pricing clientId={clientId} t={t} />}
    </main>
  );
}

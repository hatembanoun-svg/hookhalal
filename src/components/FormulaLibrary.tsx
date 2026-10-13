"use client";
import { useMemo, useState } from "react";
import { triggers, formulas, type Formula } from "@/data/hooks100";
import { findHaramTerm } from "@/lib/halal";
import type { Dict } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

type Vars = { product: string; benefit: string; mistake: string; number: string };
const PH = /\{(product|benefit|mistake|number)\}/g;

const fill = (text: string, v: Vars) => text.replace(PH, (m, k: keyof Vars) => v[k].trim() || m);
const missing = (text: string, v: Vars) => {
  const out = new Set<keyof Vars>();
  for (const m of text.matchAll(PH)) if (!v[m[1] as keyof Vars].trim()) out.add(m[1] as keyof Vars);
  return Array.from(out);
};

const BADGE = process.env.NEXT_PUBLIC_LIBRARY_BADGE; // optional override, e.g. once you can truthfully claim a user count

export default function FormulaLibrary({
  lang, t, product, onProductChange, onUse,
}: {
  lang: Lang; t: Dict; product: string; onProductChange: (v: string) => void;
  onUse: (r: { product: string; idea: string }) => void;
}) {
  const [fl, setFl] = useState<Lang>(lang); // formula language (also the language hooks are written in)
  const [trigger, setTrigger] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [benefit, setBenefit] = useState("");
  const [mistake, setMistake] = useState("");
  const [number, setNumber] = useState("7");
  const [error, setError] = useState("");

  const vars: Vars = { product, benefit, mistake, number };
  const labels: Record<keyof Vars, string> = { product: t.product, benefit: t.benefit, mistake: t.mistake, number: t.number };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    formulas.forEach((f) => (c[f.trigger] = (c[f.trigger] ?? 0) + 1));
    return c;
  }, []);

  const list: Formula[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return formulas.filter((f) => {
        const tr = triggers.find((x) => x.id === f.trigger);
        return `${f.ar} ${f.en} ${tr?.name} ${tr?.nameEn}`.toLowerCase().includes(q);
      });
    }
    return trigger ? formulas.filter((f) => f.trigger === trigger) : [];
  }, [query, trigger]);

  function use(f: Formula) {
    setError("");
    if (findHaramTerm(`${product} ${benefit} ${mistake}`)) return setError(t.haram);
    if (!product.trim()) return setError(t.needProduct);
    const text = f[fl];
    const miss = missing(text, vars);
    if (miss.length) return setError(`${t.fillMissing}: ${miss.map((k) => labels[k]).join("، ")}`);
    onUse({ product: product.trim(), idea: fill(text, vars) });
  }

  const input = "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-brand";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-brand/15 px-3 py-1 text-xs text-brand">★ {BADGE || t.libBadge}</span>
        <div className="flex overflow-hidden rounded-lg border border-zinc-800 text-xs">
          {(["ar", "en"] as const).map((l) => (
            <button key={l} onClick={() => setFl(l)} className={`px-3 py-1.5 ${fl === l ? "bg-brand text-black" : "hover:bg-zinc-900"}`}>
              {l === "ar" ? "العربية" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        <input className={input} value={product} onChange={(e) => onProductChange(e.target.value)} placeholder={`${t.product}: ${t.productPh}`} aria-label={t.product} />
        <input className={input} value={benefit} onChange={(e) => setBenefit(e.target.value)} placeholder={`${t.benefit}: ${t.benefitPh}`} aria-label={t.benefit} />
        <input className={input} value={mistake} onChange={(e) => setMistake(e.target.value)} placeholder={`${t.mistake}: ${t.mistakePh}`} aria-label={t.mistake} />
        <input className={input} value={number} onChange={(e) => setNumber(e.target.value)} placeholder={t.number} aria-label={t.number} inputMode="numeric" />
      </div>

      <input className={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`🔍 ${t.libSearch}`} />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {triggers.map((tr) => (
          <button
            key={tr.id}
            onClick={() => { setTrigger(trigger === tr.id ? null : tr.id); setQuery(""); }}
            className={`rounded-xl border p-3 text-center transition ${trigger === tr.id && !query ? "border-brand bg-brand/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"}`}
          >
            <div className="text-2xl">{tr.icon}</div>
            <div className="mt-1 text-sm font-semibold">{lang === "ar" ? tr.name : tr.nameEn}</div>
            <div className="text-xs text-zinc-500">{counts[tr.id]} {t.formulas}</div>
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">{error}</p>}

      {list.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">{t.libPick}</p>
      ) : (
        <ul className="space-y-2">
          {list.map((f, i) => {
            const text = f[fl];
            return (
              <li key={`${f.trigger}-${i}`} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                <div className="min-w-0" dir={fl === "ar" ? "rtl" : "ltr"}>
                  <p className="font-semibold leading-snug">
                    {text.split(/(\{\w+\})/).map((part, k) => {
                      const m = /^\{(\w+)\}$/.exec(part);
                      if (!m) return <span key={k}>{part}</span>;
                      const val = vars[m[1] as keyof Vars]?.trim();
                      return <span key={k} className={val ? "text-brand" : "text-amber-400"}>{val || part}</span>;
                    })}
                  </p>
                  {f.claim && <p className="mt-1 text-[11px] text-amber-400">⚠ {t.claimWarn}</p>}
                </div>
                <button onClick={() => use(f)} className="shrink-0 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-black hover:bg-green-400">
                  {t.fill}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

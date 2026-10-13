"use client";
import type { Dict } from "@/lib/i18n";

export default function HalalToggle({ on, onChange, t }: { on: boolean; onChange: (v: boolean) => void; t: Dict }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start transition ${
        on ? "border-brand/50 bg-brand/10" : "border-zinc-800 bg-zinc-900"
      }`}
      aria-pressed={on}
    >
      <span>
        <span className="block font-semibold">☪ {t.halal}</span>
        <span className="block text-xs text-zinc-400">{t.halalDesc}</span>
      </span>
      <span className={`h-6 w-11 rounded-full p-0.5 transition ${on ? "bg-brand" : "bg-zinc-700"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition ${on ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

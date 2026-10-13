"use client";
import type { Dict } from "@/lib/i18n";

const PLANS = [
  { name: "Basic", price: 12, gens: 30, link: process.env.NEXT_PUBLIC_LS_CHECKOUT_BASIC, note: "" },
  { name: "Pro", price: 29, gens: 100, link: process.env.NEXT_PUBLIC_LS_CHECKOUT_PRO, note: "" },
  { name: "Premium", price: 69, gens: 300, link: process.env.NEXT_PUBLIC_LS_CHECKOUT_PREMIUM, note: "No watermark · HD" },
];

export default function Pricing({ clientId, t }: { clientId: string; t: Dict }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-center text-lg font-bold">{t.pricing}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <div className="font-bold">{p.name}</div>
            <div className="my-1 text-3xl font-extrabold">${p.price}</div>
            <div className="text-sm text-zinc-400">{p.gens} × 3 videos</div>
            {p.note && <div className="text-xs text-brand">{p.note}</div>}
            <a
              href={p.link ? `${p.link}?checkout[custom][client_id]=${clientId}` : "#"}
              target="_blank"
              rel="noreferrer"
              className={`mt-3 block rounded-lg px-3 py-2 text-sm font-semibold ${p.link ? "bg-brand text-black" : "pointer-events-none bg-zinc-800 text-zinc-500"}`}
            >
              {t.buy}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

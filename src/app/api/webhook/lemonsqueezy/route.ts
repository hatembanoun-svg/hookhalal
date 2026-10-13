import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { addPlan } from "@/lib/credits";
import type { Plan } from "@/lib/types";

export const runtime = "nodejs";

// LemonSqueezy -> Settings -> Webhooks: event "order_created", URL https://YOUR-DOMAIN/api/webhook/lemonsqueezy
export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 501 });

  const raw = await req.text();
  const sig = req.headers.get("x-signature") || "";
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return NextResponse.json({ error: "bad signature" }, { status: 401 });

  const evt = JSON.parse(raw);
  if (evt.meta?.event_name !== "order_created") return NextResponse.json({ ok: true });

  const clientId: string | undefined = evt.meta?.custom_data?.client_id;
  const variant = String(evt.data?.attributes?.first_order_item?.variant_id ?? "");
  const map: Record<string, Plan> = {
    [process.env.LS_VARIANT_BASIC || "_"]: "basic",
    [process.env.LS_VARIANT_PRO || "_"]: "pro",
    [process.env.LS_VARIANT_PREMIUM || "_"]: "premium",
  };
  const plan = map[variant];
  if (!clientId || !plan) return NextResponse.json({ error: "unmapped order" }, { status: 400 });

  addPlan(clientId, plan);
  return NextResponse.json({ ok: true });
}

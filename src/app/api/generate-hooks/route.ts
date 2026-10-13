import { NextRequest, NextResponse } from "next/server";
import { findHaramTerm } from "@/lib/halal";
import { generateHooks } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  try {
    const { product, idea, halal = true } = await req.json();
    if (!product?.trim() || !idea?.trim())
      return NextResponse.json({ error: "Product and idea are required." }, { status: 400 });

    const bad = findHaramTerm(`${product} ${idea}`);
    if (bad) return NextResponse.json({ error: "haram", term: bad }, { status: 422 });

    const hooks = await generateHooks({
      product: product.trim().slice(0, 200),
      idea: idea.trim().slice(0, 400),
      halal: !!halal,
      groqKey: req.headers.get("x-groq-key") || undefined,
    });
    return NextResponse.json({ hooks });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

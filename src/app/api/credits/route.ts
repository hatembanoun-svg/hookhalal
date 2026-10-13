import { NextRequest, NextResponse } from "next/server";
import { getAccount } from "@/lib/credits";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const acc = getAccount(req.headers.get("x-client-id") || "");
    return NextResponse.json(acc);
  } catch {
    return NextResponse.json({ error: "Invalid client id." }, { status: 400 });
  }
}

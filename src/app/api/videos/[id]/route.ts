import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { videoPath } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!/^[a-f0-9-]{36}$/.test(params.id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const file = videoPath(params.id);
  if (!fs.existsSync(file)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const buf = fs.readFileSync(file);
  const range = req.headers.get("range");
  const headers: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Content-Disposition": req.nextUrl.searchParams.has("dl")
      ? `attachment; filename="hookhalal-${params.id.slice(0, 8)}.mp4"`
      : "inline",
  };
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m && m[1] ? parseInt(m[1], 10) : 0;
    const end = m && m[2] ? Math.min(parseInt(m[2], 10), buf.length - 1) : buf.length - 1;
    return new Response(buf.subarray(start, end + 1), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${buf.length}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new Response(buf, { headers: { ...headers, "Content-Length": String(buf.length) } });
}

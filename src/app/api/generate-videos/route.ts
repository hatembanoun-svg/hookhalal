import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import { buildSafePrompt, findHaramTerm } from "@/lib/halal";
import { consume, getAccount, refund } from "@/lib/credits";
import { falVideo, downloadTo } from "@/lib/fal";
import { comfyVideo } from "@/lib/comfy";
import { ensureDirs, videoPath } from "@/lib/storage";
import { watermark } from "@/lib/watermark";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Streams NDJSON: {i,status:"running"|"done"|"error",url?,error?} per video, then {type:"end"}. */
export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-client-id") || "";
  const userFalKey = req.headers.get("x-fal-key") || "";
  const body = await req.json();
  const halal: boolean = body.halal !== false;
  const engine: "fal" | "comfy" = body.engine === "comfy" ? "comfy" : "fal";
  const prompts: string[] = (body.prompts || []).slice(0, 3);
  // Overlay texts are echoed back per video (as `textOverlay`) so the voiceover can use them.
  const overlays: string[] = (body.overlays || []).slice(0, 3).map((o: unknown) => String(o ?? "").slice(0, 200));

  if (prompts.length === 0) return NextResponse.json({ error: "No prompts." }, { status: 400 });
  if (prompts.some((p) => findHaramTerm(p)))
    return NextResponse.json({ error: "haram" }, { status: 422 });

  const byok = engine === "fal" && !!userFalKey;
  const falKey = userFalKey || process.env.FAL_KEY || "";
  if (engine === "fal" && !falKey)
    return NextResponse.json(
      { error: "No fal.ai key. Paste your own key (BYOK) in settings." },
      { status: 400 }
    );

  let plan = "free";
  try {
    plan = getAccount(clientId).plan;
  } catch {
    return NextResponse.json({ error: "Invalid client id." }, { status: 400 });
  }

  // Credits are only charged when using the server's key. BYOK and local ComfyUI are free.
  const charged = !byok && engine === "fal";
  if (charged && !consume(clientId))
    return NextResponse.json({ error: "no_credits" }, { status: 402 });

  ensureDirs();
  const enc = new TextEncoder();
  const premium = plan === "premium";
  const addWatermark = charged && !premium;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: object) => controller.enqueue(enc.encode(JSON.stringify(o) + "\n"));
      let ok = 0;

      await Promise.all(
        prompts.map(async (raw, i) => {
          try {
            send({ i, status: "running" });
            const prompt = buildSafePrompt(raw, halal);
            const id = crypto.randomUUID();
            const file = videoPath(id);

            if (engine === "comfy") {
              fs.writeFileSync(file, await comfyVideo(prompt));
            } else {
              const url = await falVideo({ prompt, key: falKey, halal, premium });
              fs.writeFileSync(file, await downloadTo(url));
            }

            let watermarked = false;
            if (addWatermark) {
              const tmp = file.replace(".mp4", ".wm.mp4");
              if (await watermark(file, tmp)) {
                fs.renameSync(tmp, file);
                watermarked = true;
              }
            }
            ok++;
            send({
              i,
              status: "done",
              url: `/api/videos/${id}`,
              videoId: id,
              textOverlay: overlays[i] ?? "",
              watermarked: watermarked || addWatermark,
            });
          } catch (e) {
            send({ i, status: "error", error: (e as Error).message });
          }
        })
      );

      if (charged && ok === 0) refund(clientId);
      send({ type: "end", credits: charged ? getAccount(clientId).credits : undefined });
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson" } });
}

import { createFalClient } from "@fal-ai/client";
import { NEGATIVE_PROMPT, NEGATIVE_PROMPT_HALAL } from "./halal";

export async function falVideo(opts: {
  prompt: string;
  key: string;
  halal: boolean;
  premium: boolean;
}): Promise<string> {
  const client = createFalClient({ credentials: opts.key });
  const model = process.env.FAL_MODEL || "fal-ai/wan-t2v";
  const resolution = opts.premium
    ? process.env.FAL_RESOLUTION_PREMIUM || "720p"
    : process.env.FAL_RESOLUTION || "480p";

  const input: Record<string, unknown> = model.includes("veo3")
    ? {
        prompt: opts.prompt,
        aspect_ratio: "9:16",
        duration: "4s", // Veo's minimum
        generate_audio: false, // halal: no audio / music
        resolution: opts.premium ? "1080p" : "720p",
      }
    : {
        prompt: opts.prompt,
        negative_prompt: opts.halal ? NEGATIVE_PROMPT_HALAL : NEGATIVE_PROMPT,
        aspect_ratio: "9:16",
        resolution,
        num_frames: 81, // 81 frames @ 16fps ≈ 5s
        frames_per_second: 16,
        enable_safety_checker: true,
      };

  const result: any = await client.subscribe(model, { input, logs: false });
  const url = result?.data?.video?.url;
  if (!url) throw new Error("fal.ai returned no video URL");
  return url as string;
}

export async function downloadTo(url: string): Promise<Buffer> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download failed (${r.status})`);
  return Buffer.from(await r.arrayBuffer());
}

import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Local fallback: ComfyUI + Wan 2.1 1.3B.
 * Export your workflow with "Save (API Format)" and put the string __PROMPT__
 * where the positive prompt text goes. See README.
 */
export async function comfyVideo(prompt: string): Promise<Buffer> {
  const base = (process.env.COMFYUI_URL || "http://127.0.0.1:8188").replace(/\/$/, "");
  const wfPath = path.resolve(process.env.COMFYUI_WORKFLOW_PATH || "./workflows/wan21-1.3b-t2v.api.json");
  if (!fs.existsSync(wfPath)) throw new Error(`ComfyUI workflow not found: ${wfPath}`);

  const escaped = JSON.stringify(prompt).slice(1, -1);
  const workflow = JSON.parse(fs.readFileSync(wfPath, "utf8").replace(/__PROMPT__/g, escaped));

  const q = await fetch(`${base}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: crypto.randomUUID() }),
  });
  if (!q.ok) throw new Error(`ComfyUI rejected workflow: ${(await q.text()).slice(0, 200)}`);
  const { prompt_id } = await q.json();

  const deadline = Date.now() + 15 * 60_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2500));
    const h = await (await fetch(`${base}/history/${prompt_id}`)).json();
    const entry = h[prompt_id];
    if (!entry) continue;
    for (const out of Object.values<any>(entry.outputs ?? {})) {
      const file = (out.gifs || out.videos || out.images || [])[0];
      if (file) {
        const params = new URLSearchParams({
          filename: file.filename,
          subfolder: file.subfolder ?? "",
          type: file.type ?? "output",
        });
        const f = await fetch(`${base}/view?${params}`);
        if (!f.ok) throw new Error("Could not fetch ComfyUI output");
        return Buffer.from(await f.arrayBuffer());
      }
    }
    if (entry.status?.status_str === "error") throw new Error("ComfyUI generation failed");
  }
  throw new Error("ComfyUI timed out");
}

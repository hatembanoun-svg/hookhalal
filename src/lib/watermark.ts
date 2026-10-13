import { spawn } from "child_process";
import fs from "fs";

/** Burns a small "HookHalal" watermark with ffmpeg. Returns false if ffmpeg is unavailable. */
export function watermark(input: string, output: string): Promise<boolean> {
  const font = process.env.WATERMARK_FONT || "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
  const fontPart = fs.existsSync(font) ? `fontfile=${font}:` : "";
  const vf = `drawtext=${fontPart}text='HookHalal':fontcolor=white@0.75:fontsize=h/28:x=w-tw-24:y=h-th-48`;
  return new Promise((resolve) => {
    const p = spawn("ffmpeg", ["-y", "-i", input, "-vf", vf, "-an", "-c:v", "libx264", "-preset", "veryfast", output]);
    p.on("error", () => resolve(false));
    p.on("close", (code) => resolve(code === 0));
  });
}

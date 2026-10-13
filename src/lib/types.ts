export type Lang = "en" | "ar";
export type Plan = "free" | "basic" | "pro" | "premium";

export type Hook = {
  stopScroll: string; // 0-1s
  proof: string; // 1-3s
  bridge: string; // 3-5s
  visualPrompt: string;
  overlay: string;
};

export type VideoState = {
  status: "idle" | "running" | "done" | "error";
  url?: string;
  error?: string;
  watermarked?: boolean;
  videoId?: string; // server file id (for /api/merge)
  textOverlay?: string; // returned by /api/generate-videos, used for voiceover
};

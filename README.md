# ☪ HookHalal — 3×5s Video Hook Generator

Open-source, halal-first alternative to text-only hook tools. Enter a product + angle → get **3 hooks** → render **3 real 5-second 9:16 videos** → pick one and download it.

- **Halal Mode (ON by default):** no music ever, product/hands only, "no face / no person" enforced server-side on every prompt, haram-keyword blocking (EN/AR/FR).
- **Free to run:** Groq (free LLM) or local Ollama for hooks; your own fal.ai key (BYOK) for video, or local ComfyUI + Wan 2.1 1.3B.
- **Stack:** Next.js 14 App Router · TypeScript · Tailwind · fal.ai · LemonSqueezy · Docker.

## Run locally (no Docker)

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:3000
```

1. Open the app → **⚙ Keys & engine** → paste your **fal.ai key** (https://fal.ai/dashboard/keys). It stays in your browser and is sent only with your own requests. BYOK generations don't use credits.
2. For hooks, either paste a free **Groq key** (https://console.groq.com) in the same panel / `.env` (`GROQ_KEY`), or run Ollama locally (`ollama pull llama3.1`) — it is the automatic fallback.

## Run with Docker

```bash
cp .env.example .env
docker compose up --build
```
Open http://localhost:3000. The image includes ffmpeg (used for the free-tier watermark). Ollama on your host is reachable via `host.docker.internal`.

## Local video (free): ComfyUI + Wan 2.1 1.3B

1. Install ComfyUI and the Wan 2.1 1.3B text-to-video model (≈8 GB VRAM is enough).
2. Export your workflow in **API format**, put `__PROMPT__` where the positive prompt goes, save as `workflows/wan21-1.3b-t2v.api.json` (details in `workflows/README.md`).
3. Start ComfyUI (`http://127.0.0.1:8188`), choose **ComfyUI (local)** in the engine dropdown.

## Voiceover (edge-tts, free, no API key)

Under each finished video: edit the voice text (defaults to the text overlay), pick a voice, **▶ Preview**, **Add Voiceover**, then **Download with Voice**.

- `POST /api/generate-voice` `{ text, voiceId }` → `audio/mpeg` (rate +10%, file saved in `DATA_DIR/voices`, id in the `X-Voice-Id` header).
- `POST /api/merge` `{ videoId, voiceId, whoosh? }` → ffmpeg `-c:v copy -c:a aac -shortest`. A short voice is padded with silence (`apad`) so the clip keeps its full 5s.
- Voices: `ar-DZ-IsmaelNeural` (default), `ar-SA-ZariyahNeural`, `ar-EG-ShakirNeural`, `en-US-GuyNeural`, `en-US-JennyNeural`, `fr-FR-HenriNeural`, `fr-CA-AntoineNeural`.
- Halal: voice only. The optional **Whoosh SFX** is a short synthesized noise sweep, never music.
- edge-tts uses Microsoft's online Edge service through the `node-edge-tts` package, so the server needs internet access. It is an unofficial endpoint and could change.

## 100 Formula Library

Second tab on the homepage: **📚 100 Formula Library** — 100 hook formulas in 10 psychological triggers (Curiosity, FOMO, Social Proof, Scarcity, Authority, Pain Point, Transformation, Secret, Challenge, Easy), written for beauty / hair / skin products (argan oil, shampoo, serums, creams).

- Data: `src/data/hooks100.ts`. Placeholders: `{product}` `{benefit}` `{mistake}` `{number}`. Add your own by appending `f("trigger", "عربي", "English")`.
- UI: `src/components/FormulaLibrary.tsx` — trigger cards, search, AR/EN toggle, **Fill & Generate** (fills the placeholders, switches to the generator tab and creates 3 hooks).
- Halal: your product/benefit/mistake inputs go through the same haram-keyword filter as the generator (client and server), and the built-in formulas are checked clean.
- Formulas marked **⚠ Use only if it's true** make a factual claim (stock, deadline, results, personal experience). Don't publish them unless they are real.
- Set `NEXT_PUBLIC_LIBRARY_BADGE` to change the badge text (for example, once you can truthfully state a user count).

## Credits & monetization

| Plan | Price | Generations (3 videos each) |
|---|---|---|
| Free | $0 | 1, watermarked |
| Basic | $12 | 30 |
| Pro | $29 | 100 |
| Premium | $69 | 300, no watermark, higher resolution |

- Credits are checked in `/api/generate-videos` **only when the server's `FAL_KEY` is used**. BYOK and local ComfyUI are free and unwatermarked.
- Create 3 products in LemonSqueezy, copy each **variant ID** to `LS_VARIANT_*` and each checkout URL to `NEXT_PUBLIC_LS_CHECKOUT_*`.
- Add a webhook (event `order_created`) → `https://YOUR-DOMAIN/api/webhook/lemonsqueezy` with the secret in `LEMONSQUEEZY_WEBHOOK_SECRET`. The checkout link carries the buyer's `client_id`, which the webhook credits.

## Structure

```
src/app/api/generate-hooks    LLM hooks (Groq → Ollama fallback)
src/app/api/generate-videos   3 parallel renders, NDJSON progress stream, credits
src/app/api/generate-voice    edge-tts voiceover (mp3)
src/app/api/merge             ffmpeg video + voice
src/app/api/videos/[id]       serves videos from DATA_DIR (default /tmp/hookhalal)
src/app/api/webhook/lemonsqueezy
src/data/hooks100.ts          100 formulas / 10 triggers
src/components                FormulaLibrary, HookCard, VideoSelector, VoiceSelector, HalalToggle, Pricing
src/lib                       halal.ts, llm.ts, fal.ts, comfy.ts, credits.ts, watermark.ts
```

## Known limits (v0.1)

- Accounts are anonymous (a UUID in localStorage) and credits live in a JSON file — fine for a first launch; move to a real DB + auth (Supabase/Postgres) before scaling.
- Text overlay is shown over the video in the UI; it is not burned into the downloaded file (Arabic shaping in ffmpeg needs extra setup).
- Videos in `/tmp` are ephemeral; add a cleanup job or object storage for production.
- Verify model IDs/parameters in the fal.ai gallery; set `FAL_MODEL` if they change.

MIT License.

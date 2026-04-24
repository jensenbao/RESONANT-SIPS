# Network Setup for Mainland China / Hong Kong

This guide provides `.env.local` profile templates to reduce VPN dependency **without changing gameplay logic**.

## Why VPN Is Sometimes Needed

Default project routes may access:

- `openrouter.ai` (LLM/TTS default in `.env.example`)
- `generativelanguage.googleapis.com` (Gemini native)
- `api.github.com`, `raw.githubusercontent.com` (Storyworld YAML fallback)
- `huggingface.co` (portrait dataset fallback)

In some CN/HK networks, these domains are unstable or blocked.

## Preset A: Full Features (Global Network / VPN Available)

```env
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=YOUR_KEY
VITE_GEMINI_MODEL=google/gemini-2.5-flash
VITE_GEMINI_ENDPOINT=https://openrouter.ai/api/v1
VITE_IMAGE_GEN_MODEL=google/gemini-3.1-flash-image-preview
VITE_IMAGE_GEN_ENDPOINT=https://openrouter.ai/api/v1

VITE_ENABLE_REMOTE_TTS=1
VITE_TTS_STRICT_TEXT_SYNC=1
VITE_REMOTE_TTS_ENDPOINT=https://openrouter.ai/api/v1
VITE_REMOTE_TTS_MODEL=openai/gpt-audio-mini
VITE_REMOTE_TTS_VOICE=alloy
VITE_REMOTE_TTS_FORMAT=pcm16

VITE_DISABLE_REMOTE_STORYWORLD_FALLBACK=0
VITE_DISABLE_REMOTE_PORTRAIT_FALLBACK=0
```

## Preset B: CN/HK Stable (Prefer Local + DeepSeek)

```env
VITE_AI_PROVIDER=deepseek
VITE_DEEPSEEK_API_KEY=YOUR_KEY
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_DEEPSEEK_ENDPOINT=https://api.deepseek.com

VITE_ENABLE_REMOTE_TTS=0
VITE_TTS_STRICT_TEXT_SYNC=1

VITE_DISABLE_REMOTE_STORYWORLD_FALLBACK=1
VITE_DISABLE_REMOTE_PORTRAIT_FALLBACK=1
```

Run once:

```bash
git submodule update --init --recursive
```

This ensures local Storyworld assets are available when remote fallback is disabled.

Profile switch command:

```bash
npm run env:cnhk
```

## Preset C: Hybrid (OpenAI-Compatible Regional Gateway)

If your team has a regional OpenAI-compatible gateway:

```env
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=YOUR_KEY
VITE_GEMINI_MODEL=google/gemini-2.5-flash
VITE_GEMINI_ENDPOINT=https://YOUR_GATEWAY_DOMAIN/v1
VITE_IMAGE_GEN_MODEL=google/gemini-3.1-flash-image-preview
VITE_IMAGE_GEN_ENDPOINT=https://YOUR_GATEWAY_DOMAIN/v1
```

## Profile Switching Commands

- CN/HK profile:

```bash
npm run env:cnhk
```

- Global/full profile:

```bash
npm run env:global
```

These commands overwrite `.env.local` while preserving existing key values when possible.

## Validation Checklist

1. `npm run dev` starts both client and save server.
2. New game can load existing local role IDs.
3. Dialogue responds normally.
4. If TTS disabled, gameplay still works (audio only is skipped).
5. If remote fallback disabled, role loading still works from local seeds/submodule.

## Notes

- GitHub-public resources still require attribution in class demos.
- Keep references in `ASSET_ATTRIBUTION.md`.
- Do not commit real keys in `.env.local`.

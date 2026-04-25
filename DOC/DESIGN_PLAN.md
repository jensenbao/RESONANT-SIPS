# Resonant Sips: Design Plan (Implementation-Aligned, 2026-04)

**Team:** Resonant Sips  
**Project Category:** AI-driven interactive narrative game  
**Document status:** This file reflects the current implementation in this repository. Earlier brainstorms that mentioned Python/Pygame/ComfyUI as the main runtime are treated as exploratory ideas, not the production baseline.

## 1. Core Concept

- **Worldview:** In a cyberpunk city, emotional dissonance appears as social and personal instability.
- **Player role:** The player is a bartender who reads customer signals and restores resonance through conversation and drinks.
- **Core loop:** Character selection -> dialogue and emotion inference -> three-axis cocktail mixing -> service outcome and trust progression.
- **Design goal:** Merge narrative, emotion modeling, and interactive mixing into one playable system instead of isolated demos.

## 2. Current Technical Baseline (What Is Actually Running)

- **Frontend:** React 18 + Vite 5
- **Interactive rendering:** Pixi.js 8 (mixing board and ambient canvas)
- **Server:** Node.js HTTP service (`server/save-server.mjs`)
- **Persistence:** Local file-based saves (`saves/`, `seeds/`)
- **AI integration:** Multi-provider LLM/TTS through configurable endpoints
- **Character parsing:** YAML + local JSON profile cache

This means the repository's primary implementation is JavaScript/Node, not Python/Pygame.

## 3. Implementation Alignment

### 3.1 Integrated Technical Novelty

Implemented novelty in this repo:

1. Storyworld character YAML ingestion with local-first and remote fallback.
2. 8-emotion analysis integrated into playable runtime state.
3. Dialogue + trust + mixing outcome tied into one feedback loop.
4. Optional remote TTS with strict transcript/text synchronization guard.
5. MCP-style character and emotion APIs used by game logic.

### 3.2 Repository Engineering Evidence

Repository evidence:

1. Runnable scripts (`npm run dev`, `dev:client`, `dev:server`, `build`, `preview`).
2. Environment template (`.env.example`) and secure local secret workflow.
3. Gameplay/video workflow reference (`public/preview/gameplay-voiceover-guide-en.md`).
4. Save and MCP-style API server with documented endpoints.

### 3.3 Storyworld / MCP Integration

1. `venetanji/polyu-storyworld` is included as submodule and remote fallback source.
2. HTTP MCP-style routes are implemented under `/api/mcp/...` for character search/get and emotion analysis.
3. Frontend repositories and customer generation pipeline call these interfaces directly.

## 4. Implemented Workflow

1. **Character source layer**
   - Local seeds (`seeds/characters/presets`, `seeds/characters/added`)
   - Optional submodule (`polyu-storyworld`)
   - Remote fallback (GitHub raw / dataset path)
2. **Character normalization**
   - YAML/JSON parsed to a unified profile object
3. **Emotion analysis**
   - 8-emotion weights + top3 + confidence with safety post-processing
4. **Gameplay runtime**
   - Player infers emotions, then mixes in Body/Sweetness/Strength-like axes
5. **Persistence**
   - Save slots and per-day progression stored locally through save APIs
6. **Demo output**
   - Voiceover/script guide supports presentation and video walkthrough

## 5. Evidence Paths

- `src/game/pixi/`
- `src/hooks/useDialogue.js`
- `src/hooks/useTTS.js`
- `src/utils/ai/customerGeneration.js`
- `src/utils/storyworldRepository.js`
- `server/save-server.mjs`
- `server/storyworld-service.mjs`
- `server/emotion-service.mjs`
- `public/preview/gameplay-voiceover-guide-en.md`
- `.env.example`

## 6. Validation Plan (Current)

Manual validation checklist:

1. Start with `npm run dev` and confirm client + server are reachable.
2. Verify `/health` endpoint and `/api/mcp/...` routes respond.
3. Create new game and load Storyworld-linked character.
4. Complete dialogue -> emotion interaction -> mixing -> serve flow.
5. Confirm saves are written and reloadable.

## 7. Known Gaps and Next Iteration

1. Add automated tests and CI workflow for regression coverage.
2. Continue reducing mismatch between historical planning docs and current runtime.
3. Optional future branch: external asset-generation workflow (e.g., ComfyUI) as an auxiliary pipeline, not a dependency for core gameplay execution.

## 8. Document Cross-Reference

Use this document together with:

- `README.md`
- `README.zh-CN.md`
- `DOC/流程-v1.md`
- `ASSET_ATTRIBUTION.md`
- `ETHICS_AND_USE.md`

These files now present a consistent story: state-of-the-art AI + emotion + interaction integration, runnable repository workflow, concrete Storyworld/MCP linkage, and ID-level attribution disclosure for presentation assets.

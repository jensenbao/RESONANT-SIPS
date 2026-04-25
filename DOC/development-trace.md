# Development Trace

This document records repository-visible collaboration signals and where to inspect implementation work across the team.

## Contributor activity snapshot

Latest `git shortlog -sne --all` snapshot:

- BAO-Hongzhen — 74 commits
- tangjian89757 — 43 commits
- ZHANG Mingzhi — 9 commits
- emo / emovon-123 / Bao.hz — 8 commits combined (same contributor identity across account names)

## How work is distributed in the codebase

### Core gameplay and flow control

- `src/pages/GamePage.jsx`
- `src/hooks/gameHandlers/`
- `src/hooks/useGameInit.js`
- `src/hooks/useCustomerFlow.js`

### AI integration and runtime behavior

- `src/config/api.js`
- `src/utils/aiService.js`
- `src/utils/ai/customerGeneration.js`
- `src/hooks/useDialogue.js`
- `src/hooks/useTTS.js`

### Storyworld and backend services

- `server/storyworld-service.mjs`
- `server/emotion-service.mjs`
- `server/save-server.mjs`
- `src/utils/storyworldRepository.js`

### UI, assets, and presentation polish

- `src/components/Chat/`
- `src/pages/HomePage.jsx`
- `src/pages/GamePage.overlays.css`
- `scripts/sync-art-assets-to-public.mjs`

### Documentation and delivery support

- `README.md`
- `README.zh-CN.md`
- `DOC/DESIGN_PLAN.md`
- `DOC/流程-v1.md`
- `public/preview/gameplay-voiceover-guide-en.md`
- `ASSET_ATTRIBUTION.md`
- `ETHICS_AND_USE.md`

## Reproducible verification commands

Run these commands from the repository root:

```bash
git shortlog -sne --all
git log --pretty=format:"%an" | sort | uniq -c | sort -nr
git log --name-only --pretty=format: | sort | uniq -c | sort -nr | head -20
```

These outputs provide auditable evidence of multi-author contributions over time and across repository areas.

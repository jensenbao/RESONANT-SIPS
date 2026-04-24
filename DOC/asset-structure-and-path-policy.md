# Asset Structure and Path Policy

This policy is designed to keep the project tidy **without breaking runtime paths**.

## Current Runtime Asset Sources

1. `Art-assets/Art assets/...` (authoring source for art team)
   - Team places new assets here first.
   - This is the canonical source directory for production assets.
2. `public/asset/...` (runtime serving source)
   - Used by runtime URL references like `/asset/角色/...`.
   - Synced from authoring source for runtime safety (`npm run assets:sync`).
   - Includes compatibility mapping (example: `UI/开始界面/*` -> `/asset/按钮/*`).
   - Sync script removes stale generated files to keep `public/asset` clean.
3. `seeds/characters/...`
   - Used for role metadata, profiles, and optional portraits.

## Safe Rules (Do Not Break Paths)

- Do not move/rename files under `public/asset/` unless all references are updated.
- Do not move/rename files under `Art-assets/Art assets/` unless sync + path checks pass.
- Keep role IDs stable (`xxxxg`) across seeds, cutouts, and attribution tables.
- Prefer additive changes (new files + new references) over in-place path rewrites.

## Recommended Hygiene Workflow

1. Add/modify assets in `Art-assets/Art assets/...`.
2. Run:

```bash
npm run assets:sync
npm run check:paths
```

3. Run:

```bash
npm run build
```

4. Only commit when commands pass.

## Structural Notes

- Current repository contains historical naming conventions (`Art-assets/Art assets/...`).
- This is acceptable because the sync layer now handles runtime compatibility.
- Team workflow is now single-source: only maintain `Art-assets/Art assets/...`.
- Non-runtime reference folders (for example concept-only materials) are intentionally not mirrored to `public/asset`.

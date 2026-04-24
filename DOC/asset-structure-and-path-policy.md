# Asset Structure and Path Policy

This policy is designed to keep the project tidy **without breaking runtime paths**.

## Current Runtime Asset Sources

1. `public/asset/...`
   - Used by runtime URL references like `/asset/角色/...`.
   - Any rename/move here can break UI/media loading.
2. `Art-assets/Art assets/...`
   - Used by direct module imports in `src/data/*.js`.
   - Any rename/move can break build-time imports.
3. `seeds/characters/...`
   - Used for role metadata, profiles, and optional portraits.

## Safe Rules (Do Not Break Paths)

- Do not move/rename files under `public/asset/` unless all references are updated.
- Do not move/rename files under `Art-assets/Art assets/` unless all import paths are updated.
- Keep role IDs stable (`xxxxg`) across seeds, cutouts, and attribution tables.
- Prefer additive changes (new files + new references) over in-place path rewrites.

## Recommended Hygiene Workflow

1. Add/modify assets.
2. Run:

```bash
npm run check:paths
```

3. Run:

```bash
npm run build
```

4. Only commit when both commands pass.

## Structural Notes

- Current repository contains historical naming conventions (`Art-assets/Art assets/...`).
- This is acceptable for now because code references are aligned.
- If you want future normalization (single canonical directory), do it as a dedicated migration PR with automatic path rewrite + validation.

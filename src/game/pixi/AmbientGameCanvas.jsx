import React from 'react';
import './AmbientGameCanvas.css';

const resolvePortraitSrc = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:image/')) return raw;
  return `data:image/png;base64,${raw}`;
};

const resolveCutoutSrc = (characterId) => {
  const id = String(characterId || '').trim();
  if (!id) return '';
  return `/asset/角色/cutouts/${encodeURIComponent(id)}-cutout.png`;
};

const AmbientGameCanvas = ({ viewModel = null, customerPortraitSrc = '', customerCharacterId = '' }) => {
  const resolvedPortrait = resolvePortraitSrc(customerPortraitSrc);
  const resolvedCutout = resolveCutoutSrc(customerCharacterId);

  // Dual-track source:
  // 1) Prefer manually prepared cutout by character ID.
  // 2) Fallback to runtime portrait (avatarBase64).
  // 3) Final fallback remains the default CSS stage character.
  const portraitLayers = [resolvedCutout, resolvedPortrait]
    .filter(Boolean)
    .map((src) => `url("${src}")`)
    .join(', ');

  const style = portraitLayers
    ? { '--npc-stage-portrait': portraitLayers }
    : undefined;

  return <div className="pixi-game-canvas" style={style} aria-hidden="true" />;
};

export default AmbientGameCanvas;

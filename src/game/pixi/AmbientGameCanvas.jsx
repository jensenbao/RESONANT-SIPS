import React, { useEffect, useMemo, useState } from 'react';
import './AmbientGameCanvas.css';

const HARDCODED_CUTOUT_BINDINGS = Object.freeze({
  '0613g': {
    src: '/asset/角色/cutout/0613g_cutout.png',
    stageScale: 1.42,
    stageBottom: '-16%',
    stageRight: '2%',
    useRawSource: true,
  },
  '2928g': {
    src: '/asset/角色/cutout/2928g_cutout.png',
    stageScale: 2.4,
    stageBottom: '-12%',
    stageRight: '-12%',
    useRawSource: true,
  },
  '1601': {
    src: '/asset/角色/cutout/1601_cutout.png',
    stageScale: 0.82,
    stageBottom: '-9%',
    stageRight: '7%',
    useRawSource: false,
  },
  '1601g': {
    src: '/asset/角色/cutout/1601_cutout.png',
    stageScale: 0.82,
    stageBottom: '-9%',
    stageRight: '7%',
    useRawSource: false,
  },
});

const DEFAULT_STAGE_PROFILE = Object.freeze({
  stageScale: 1,
  stageBottom: '',
  stageRight: '',
  useRawSource: false,
});

const normalizeCharacterId = (value) => String(value || '').trim().toLowerCase();

const resolveHardcodedBinding = (characterId) => {
  const normalized = normalizeCharacterId(characterId);
  if (!normalized) return null;
  return HARDCODED_CUTOUT_BINDINGS[normalized] || null;
};

const resolvePortraitSrc = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:image/')) return raw;
  return `data:image/png;base64,${raw}`;
};

const buildCutoutCandidates = (characterId) => {
  const rawId = String(characterId || '').trim();
  if (!rawId) return [];

  const normalizedRaw = rawId.toLowerCase();
  const fixedBinding = resolveHardcodedBinding(normalizedRaw);
  const fixedCandidates = fixedBinding?.src ? [fixedBinding.src] : [];
  const strippedRaw = normalizedRaw.replace(/g$/i, '');
  const idVariants = new Set([normalizedRaw, strippedRaw]);
  if (/^\d+$/.test(strippedRaw)) {
    idVariants.add(`${strippedRaw}g`);
  }

  const fileVariants = [];
  Array.from(idVariants).filter(Boolean).forEach((id) => {
    fileVariants.push(`${id}-cutout.png`);
    fileVariants.push(`${id}_cutout.png`);
    fileVariants.push(`${id}.png`);
    fileVariants.push(`${id}-cutout.webp`);
    fileVariants.push(`${id}_cutout.webp`);
    fileVariants.push(`${id}.webp`);
    fileVariants.push(`${id}-cutout.jpg`);
    fileVariants.push(`${id}_cutout.jpg`);
    fileVariants.push(`${id}.jpg`);
    fileVariants.push(`${id}-cutout.jpeg`);
    fileVariants.push(`${id}_cutout.jpeg`);
    fileVariants.push(`${id}.jpeg`);
  });

  const dirVariants = ['/asset/角色/cutout', '/asset/角色/cutouts'];
  const candidates = [];
  dirVariants.forEach((dir) => {
    fileVariants.forEach((fileName) => {
      candidates.push(`${dir}/${encodeURIComponent(fileName)}`);
    });
  });
  return Array.from(new Set([...fixedCandidates, ...candidates]));
};

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(`image_load_failed:${src}`));
  image.src = src;
});

const measureOpaqueBounds = (image, padding = 2) => {
  const width = image.naturalWidth || image.width || 0;
  const height = image.naturalHeight || image.height || 0;
  if (!width || !height) {
    return { width: 0, height: 0 };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { width, height };
  }

  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { width, height };
  }

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  return {
    width: cropWidth + padding * 2,
    height: cropHeight + padding * 2,
  };
};

const trimTransparentBounds = (image, padding = 2) => {
  const width = image.naturalWidth || image.width || 0;
  const height = image.naturalHeight || image.height || 0;
  if (!width || !height) return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return '';

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropWidth + padding * 2;
  outCanvas.height = cropHeight + padding * 2;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return '';

  outCtx.drawImage(
    image,
    minX,
    minY,
    cropWidth,
    cropHeight,
    padding,
    padding,
    cropWidth,
    cropHeight
  );

  return outCanvas.toDataURL('image/png');
};

const AmbientGameCanvas = ({ viewModel = null, customerPortraitSrc = '', customerCharacterId = '' }) => {
  const resolvedPortrait = resolvePortraitSrc(customerPortraitSrc);
  const normalizedCharacterId = normalizeCharacterId(customerCharacterId);
  const stageProfile = resolveHardcodedBinding(normalizedCharacterId) || DEFAULT_STAGE_PROFILE;
  const [resolvedCutout, setResolvedCutout] = useState('');
  const [matchedCutoutPath, setMatchedCutoutPath] = useState('');
  const [cutoutAspectRatio, setCutoutAspectRatio] = useState('');
  const cutoutCandidates = useMemo(
    () => buildCutoutCandidates(customerCharacterId),
    [customerCharacterId]
  );
  const isDev = Boolean(import.meta.env.DEV);

  useEffect(() => {
    let cancelled = false;
    setResolvedCutout('');
    setMatchedCutoutPath('');
    setCutoutAspectRatio('');
    const debug = isDev;

    if (!cutoutCandidates.length) return () => {
      cancelled = true;
    };

    const pickFirstAvailableCutout = async () => {
      if (debug) {
        console.info('[stage-portrait] resolving cutout', {
          customerCharacterId,
          candidates: cutoutCandidates
        });
      }
      for (const candidate of cutoutCandidates) {
        const encodedCandidate = encodeURI(candidate);
        try {
          const image = await loadImage(encodedCandidate);
          const measured = measureOpaqueBounds(image);
          const ratioWidth = Number(measured?.width || image.naturalWidth || image.width || 0);
          const ratioHeight = Number(measured?.height || image.naturalHeight || image.height || 0);
          const trimmedDataUrl = stageProfile.useRawSource ? '' : trimTransparentBounds(image);
          if (!cancelled) {
            setResolvedCutout(trimmedDataUrl || encodedCandidate);
            setMatchedCutoutPath(encodedCandidate);
            setCutoutAspectRatio(ratioWidth > 0 && ratioHeight > 0 ? `${ratioWidth} / ${ratioHeight}` : '');
          }
          if (debug) {
            console.info('[stage-portrait] cutout hit', {
              customerCharacterId,
              matchedPath: encodedCandidate
            });
          }
          return;
        } catch {
          // continue trying next naming/path candidate
        }
      }
      if (debug) {
        console.warn('[stage-portrait] no cutout matched, fallback to avatar/default', {
          customerCharacterId
        });
      }
    };

    pickFirstAvailableCutout().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [cutoutCandidates, customerCharacterId, isDev]);

  // Priority:
  // 1) Manual cutout by ID (trimmed at runtime for consistent stage framing).
  // 2) Runtime portrait (avatarBase64).
  // 3) CSS default stage character.
  const stagePortrait = resolvedCutout || resolvedPortrait;
  const portraitSource = resolvedCutout
    ? `cutout(${matchedCutoutPath.split('/').pop() || matchedCutoutPath})`
    : (resolvedPortrait ? 'avatar' : 'default');
  const debugLabel = `portrait: ${portraitSource} | id: ${String(customerCharacterId || '-')}`;

  const style = stagePortrait
    ? {
      '--npc-stage-portrait': `url("${stagePortrait}")`,
      '--npc-stage-portrait-ratio': cutoutAspectRatio || undefined,
      '--npc-stage-portrait-scale': Number(stageProfile.stageScale) > 0 ? String(stageProfile.stageScale) : undefined,
      '--npc-stage-portrait-bottom': stageProfile.stageBottom || undefined,
      '--npc-stage-portrait-right': stageProfile.stageRight || undefined,
    }
    : undefined;

  void viewModel;
  return (
    <div className="pixi-game-canvas" style={style} aria-hidden="true">
      {isDev && (
        <div className="pixi-game-canvas__debug-tag" aria-hidden="true">
          {debugLabel}
        </div>
      )}
    </div>
  );
};

export default AmbientGameCanvas;

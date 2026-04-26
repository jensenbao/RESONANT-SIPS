const request = async (method, url, body) => {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || `${response.status}`;
    throw new Error(message);
  }

  return data || {};
};

const HF_DATASET_API_ROOT = 'https://huggingface.co/api/datasets/venetanji/polyu-storyworld-characters/tree/main';
const HF_DATASET_RESOLVE_ROOT = 'https://huggingface.co/datasets/venetanji/polyu-storyworld-characters/resolve/main';
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp)$/i;

const scorePortraitCandidate = (name) => {
  const text = String(name || '').toLowerCase();
  let score = 0;
  if (text.startsWith('portrait')) score += 100;
  if (/^1(\.|$)/.test(text)) score += 60;
  if (/^(a|cover|main)(\.|$)/.test(text)) score += 40;
  if (text.includes('character')) score += 20;
  if (text.endsWith('.png')) score += 8;
  if (text.endsWith('.jpg') || text.endsWith('.jpeg')) score += 6;
  if (text.endsWith('.webp')) score += 4;
  return score;
};

const selectPreferredImage = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  const sorted = [...items].sort((a, b) => {
    const scoreDiff = scorePortraitCandidate(b?.name || b?.path) - scorePortraitCandidate(a?.name || a?.path);
    if (scoreDiff !== 0) return scoreDiff;
    const sizeDiff = Number(b?.size || 0) - Number(a?.size || 0);
    if (sizeDiff !== 0) return sizeDiff;
    return String(a?.name || a?.path || '').localeCompare(String(b?.name || b?.path || ''));
  });
  return sorted[0] || null;
};

const blobToDataUrl = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('failed_to_read_blob'));
    reader.readAsDataURL(blob);
  });
};

export const getStoryworldCharacterByName = async (query, options = {}) => {
  const data = await request('POST', '/api/mcp/character/get_by_name', {
    query,
    cacheRemote: Boolean(options?.cacheRemote),
  });
  return data.character || null;
};

export const ensureStoryworldCharacterCached = async (query) => {
  const data = await request('POST', '/api/mcp/character/get_by_name', {
    query,
    cacheRemote: true,
    inferPortraitGender: false,
  });
  return data.character || null;
};

export const ensureStoryworldCharacterPortraitCached = async (characterOrCode) => {
  const code = String(
    typeof characterOrCode === 'string'
      ? characterOrCode
      : characterOrCode?.code || characterOrCode?.id || ''
  ).trim().toLowerCase();
  if (!code) {
    throw new Error('invalid_character_code');
  }

  const existingDataUrl = String(characterOrCode?.portrait?.dataUrl || '').trim();
  if (existingDataUrl.startsWith('data:image/')) {
    return {
      ok: true,
      skipped: true,
      portrait: characterOrCode.portrait,
    };
  }

  const indexResponse = await fetch(`${HF_DATASET_API_ROOT}/${code}?recursive=true&expand=false`, {
    headers: { Accept: 'application/json' },
  });
  if (!indexResponse.ok) {
    throw new Error(`hf_portrait_index_failed:${indexResponse.status}`);
  }

  const list = await indexResponse.json();
  const candidates = Array.isArray(list)
    ? list
      .filter((item) => item?.type === 'file' && IMAGE_EXT_RE.test(item?.path || ''))
      .map((item) => ({
        name: String(item?.path || '').split('/').pop() || '',
        path: item.path,
        size: item.size || 0,
        url: `${HF_DATASET_RESOLVE_ROOT}/${item.path}`,
      }))
    : [];
  const preferred = selectPreferredImage(candidates);
  if (!preferred?.url) {
    throw new Error('hf_portrait_not_found');
  }

  const imageResponse = await fetch(preferred.url);
  if (!imageResponse.ok) {
    throw new Error(`hf_portrait_download_failed:${imageResponse.status}`);
  }

  const dataUrl = await blobToDataUrl(await imageResponse.blob());
  return request('POST', '/api/mcp/character/cache_portrait', {
    code,
    fileName: preferred.name,
    dataUrl,
    sourceUrl: preferred.url,
  });
};

export const generateStoryworldCharacterImages = async (query, options = {}) => {
  return request('POST', '/api/mcp/character/generate_images', {
    code: query,
    force: Boolean(options?.force),
  });
};

export const removeStoryworldCharacterAssets = async (query) => {
  return request('POST', '/api/mcp/character/remove_assets', {
    code: query,
  });
};

export const searchStoryworldCharacters = async (query, limit = 20) => {
  const data = await request('POST', '/api/mcp/character/search', { query, limit });
  return Array.isArray(data.results) ? data.results : [];
};

export const analyzeStoryworldCharacterEmotion = async (payload = {}) => {
  const data = await request('POST', '/api/mcp/emotion/analyze_character', payload);
  return data?.emotion || null;
};

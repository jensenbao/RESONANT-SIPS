import { EMOTION_IDS_8 } from '../utils/emotionSchema.js';
import martiniGlassIcon from '../../Art-assets/Art assets/道具/杯型/martini.png';
import highballGlassIcon from '../../Art-assets/Art assets/道具/杯型/highball.png';
import rockGlassIcon from '../../Art-assets/Art assets/道具/杯型/rock.png';

export const EMOTIONS = {
  joy: { id: 'joy', name: '喜悦', color: '#FFD166', icon: '😊' },
  trust: { id: 'trust', name: '信任', color: '#06D6A0', icon: '🤝' },
  fear: { id: 'fear', name: '恐惧', color: '#7B2CBF', icon: '😨' },
  surprise: { id: 'surprise', name: '惊讶', color: '#4CC9F0', icon: '😮' },
  sadness: { id: 'sadness', name: '悲伤', color: '#4361EE', icon: '😢' },
  disgust: { id: 'disgust', name: '厌恶', color: '#6A994E', icon: '🤢' },
  anger: { id: 'anger', name: '愤怒', color: '#E63946', icon: '😠' },
  anticipation: { id: 'anticipation', name: '期待', color: '#F77F00', icon: '✨' },
};

export const INITIAL_UNLOCKED_EMOTIONS = [...EMOTION_IDS_8];

export const EMOTION_HINTS = {
  low: {
    joy: '顾客语气里有一点轻快。',
    trust: '顾客开始愿意靠近你。',
    fear: '顾客似乎在担心什么。',
    surprise: '顾客对某件事显得意外。',
    sadness: '顾客情绪里有一丝低落。',
    disgust: '顾客对某些话题有明显排斥。',
    anger: '顾客压着一股火气。',
    anticipation: '顾客对接下来的事有期待。',
  },
  medium: {
    joy: '顾客眼神里有亮光，语气也更松弛了。',
    trust: '顾客开始透露更私人、更真实的信息。',
    fear: '顾客说话有迟疑，像在反复确认安全感。',
    surprise: '顾客会突然停顿，像被记忆或消息击中。',
    sadness: '顾客提到过去时会明显放慢语速。',
    disgust: '顾客在某些描述上明显不愿继续。',
    anger: '顾客对某些人和事的措辞变得锋利。',
    anticipation: '顾客会主动谈到计划、可能性与下一步。',
  },
  high: {
    joy: '顾客的开心已经不再掩饰，连呼吸都轻了。',
    trust: '顾客明显在把你当成可以依靠的人。',
    fear: '顾客内心的恐惧已浮到表层，需要被接住。',
    surprise: '顾客情绪波动明显，像刚经历突发转折。',
    sadness: '顾客正在触碰最脆弱的悲伤，防线很薄。',
    disgust: '顾客的厌恶很强，几乎不愿再回看那段经历。',
    anger: '顾客的愤怒已接近爆发边缘。',
    anticipation: '顾客对未来有强烈期待，正在等待一个答案。',
  },
};

export const EMOTION_COMPATIBILITY = {
  compatible: [
    ['joy', 'trust'],
    ['anticipation', 'joy'],
    ['surprise', 'anticipation'],
    ['sadness', 'trust'],
  ],
  conflict: [
    ['joy', 'sadness'],
    ['trust', 'disgust'],
    ['fear', 'anger'],
    ['anticipation', 'disgust'],
  ],
};

export const GLASS_TYPES = {
  martini: {
    id: 'martini',
    name: '马提尼杯',
    icon: '🍸',
    iconImage: martiniGlassIcon,
    bonus: ['trust', 'joy'],
    description: '经典优雅，适合平衡型情绪',
    maxPortions: 3,
    feeling: '这种杯子要求你直视它，没有地方躲。',
  },
  highball: {
    id: 'highball',
    name: '高球杯',
    icon: '🥃',
    iconImage: highballGlassIcon,
    bonus: ['joy', 'anticipation'],
    description: '轻松随意，适合积极情绪',
    maxPortions: 3,
    feeling: '这种杯子不急，慢慢喝，慢慢说。',
  },
  rock: {
    id: 'rock',
    name: '古典杯',
    icon: '🥛',
    iconImage: rockGlassIcon,
    bonus: ['sadness', 'fear'],
    description: '沉稳厚重，适合复杂情绪',
    maxPortions: 3,
    feeling: '这种杯子像一个承诺，重量扎实而克制。',
  },
};
export const EMOTION_TARGETS = {
  joy: {
    hint: '轻盈、偏甜、不过分刺激。',
    description: '用明亮口感放大积极情绪。',
    conditions: [
      { attr: 'thickness', op: '>=', value: 1 },
      { attr: 'sweetness', op: '>=', value: 2 },
      { attr: 'strength', op: '<=', value: 2 },
    ],
  },
  trust: {
    hint: '口感平衡、层次稳定。',
    description: '给人可依靠的感觉。',
    conditions: [
      { attr: 'thickness', op: '>=', value: 1 },
      { attr: 'sweetness', op: '>=', value: 1 },
      { attr: 'strength', op: '<=', value: 2 },
    ],
  },
  fear: {
    hint: '别太烈，先稳住情绪。',
    description: '降低攻击性，强调安定。',
    conditions: [
      { attr: 'thickness', op: '>=', value: 1 },
      { attr: 'sweetness', op: '>=', value: 1 },
      { attr: 'strength', op: '<=', value: 2 },
    ],
  },
  surprise: {
    hint: '带一点跳跃感和反差。',
    description: '在可控范围内制造变化。',
    conditions: [
      { attr: 'thickness', op: '=', value: 1 },
      { attr: 'sweetness', op: '>=', value: 1 },
      { attr: 'strength', op: '>=', value: 2 },
    ],
  },
  sadness: {
    hint: '更温和、更包裹感。',
    description: '允许悲伤被看见，但不被淹没。',
    conditions: [
      { attr: 'thickness', op: '>=', value: 2 },
      { attr: 'sweetness', op: '>=', value: 1 },
      { attr: 'strength', op: '<=', value: 2 },
    ],
  },
  disgust: {
    hint: '保持干净利落，减少甜腻。',
    description: '避免黏滞感，突出克制。',
    conditions: [
      { attr: 'thickness', op: '<=', value: 1 },
      { attr: 'sweetness', op: '<=', value: 1 },
      { attr: 'strength', op: '>=', value: 2 },
    ],
  },
  anger: {
    hint: '有力度，但别失控。',
    description: '承接愤怒并导向可表达状态。',
    conditions: [
      { attr: 'thickness', op: '<=', value: 1 },
      { attr: 'sweetness', op: '<=', value: 1 },
      { attr: 'strength', op: '>=', value: 3 },
    ],
  },
  anticipation: {
    hint: '有上扬感和延展感。',
    description: '把期待推向积极行动。',
    conditions: [
      { attr: 'thickness', op: '>=', value: 1 },
      { attr: 'sweetness', op: '>=', value: 2 },
      { attr: 'strength', op: '>=', value: 2 },
    ],
  },
};

export const EMOTION_TASTE_PROTOTYPES = {
  joy: { thickness: 1, sweetness: 2, strength: 1 },
  trust: { thickness: 2, sweetness: 1, strength: 1 },
  fear: { thickness: 0, sweetness: 0, strength: 2 },
  surprise: { thickness: 1, sweetness: 1, strength: 2 },
  sadness: { thickness: 2, sweetness: 0, strength: 1 },
  disgust: { thickness: 1, sweetness: 0, strength: 2 },
  anger: { thickness: 0, sweetness: 0, strength: 3 },
  anticipation: { thickness: 1, sweetness: 2, strength: 2 },
};

export const getHintLevel = (trustLevel) => {
  if (trustLevel >= 0.7) return 'high';
  if (trustLevel >= 0.5) return 'medium';
  if (trustLevel >= 0.3) return 'low';
  return null;
};

export const getEmotionHint = (emotionId, trustLevel) => {
  const level = getHintLevel(trustLevel);
  if (!level) return null;
  return EMOTION_HINTS[level][emotionId] || null;
};

export const checkEmotionCompatibility = (emotions) => {
  if (emotions.length < 2) return 'neutral';

  const emotionIds = emotions.map((emotion) => emotion.id).sort();

  for (const pair of EMOTION_COMPATIBILITY.compatible) {
    const sortedPair = [...pair].sort();
    if (
      emotionIds.length === 2 &&
      emotionIds[0] === sortedPair[0] &&
      emotionIds[1] === sortedPair[1]
    ) {
      return 'compatible';
    }
  }

  for (const pair of EMOTION_COMPATIBILITY.conflict) {
    const sortedPair = [...pair].sort();
    if (
      emotionIds.length === 2 &&
      emotionIds[0] === sortedPair[0] &&
      emotionIds[1] === sortedPair[1]
    ) {
      return 'conflict';
    }
  }

  return 'neutral';
};

export const generateTargetFromEmotion = (emotionId, variance = 1, atmosphereShift = null) => {
  const base = EMOTION_TARGETS[emotionId];
  if (!base) return null;

  const conditions = base.conditions.map((condition) => {
    const actualVariance = condition.op === '=' ? Math.floor(variance / 2) : variance;
    const randomOffset = Math.floor(Math.random() * (actualVariance * 2 + 1)) - actualVariance;

    let value = condition.value + randomOffset;

    if (atmosphereShift && atmosphereShift[condition.attr] !== undefined) {
      value += atmosphereShift[condition.attr];
    }

    return {
      ...condition,
      value
    };
  });

  return {
    emotionId,
    conditions,
    hint: base.hint,
    description: base.description
  };
};

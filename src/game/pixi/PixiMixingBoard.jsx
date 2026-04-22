import React, { useMemo } from 'react';
import { GLASS_TYPES } from '../../data/emotions.js';
import { ICE_TYPES, DECORATION_TYPES } from '../../data/addons.js';
import {
  INGREDIENTS,
  INGREDIENT_CATEGORIES,
  getIngredientsByCategory,
  MAX_PORTIONS_PER_INGREDIENT,
  MAX_TOTAL_PORTIONS
} from '../../data/ingredients.js';
import { getTotalPortions } from '../../utils/cocktailMixing.js';
import './PixiMixingBoard.css';

const STEP_COPY = {
  glass: {
    icon: '🍸',
    subtitle: '先定杯型，让酒先有轮廓。',
    title: 'Step 1 · 杯型'
  },
  ice: {
    icon: '🧊',
    subtitle: '冰决定这杯酒开口时的温度。',
    title: 'Step 2 · 冰块'
  },
  ingredient: {
    icon: '🥃',
    subtitle: '原液配比会直接改写这杯酒的性格。',
    title: 'Step 3 · 原液'
  },
  decoration: {
    icon: '✨',
    subtitle: '装饰决定顾客第一眼看到什么。',
    title: 'Step 4 · 装饰'
  },
  preview: {
    icon: '🫗',
    subtitle: '如果这杯酒已经站稳，就递出去。',
    title: 'Step 5 · 递酒'
  }
};

const STEP_SEQUENCE = ['glass', 'ice', 'ingredient', 'decoration', 'preview'];

const MODE_COPY = {
  expressive: {
    badge: 'Expressive',
    briefLabel: '回应草图',
    emptyBody: '第三章以后，材料的 feeling 比数字更值得听。',
    emptyTitle: '先让酒开口',
    eyebrow: 'Chapter III-IV · Resonance',
    hintLabel: '情绪方向',
    manifesto: '你调的不是答案，是回应。',
    previewLabel: '酒的态度',
    progressLabel: '共鸣草图',
    showHint: true,
    showMetrics: false,
    showNumericProgress: false,
    showSignals: true,
    showSuggestions: false,
    signalLabel: '当前质地'
  },
  master: {
    badge: 'Master',
    briefLabel: '静默判断',
    emptyBody: '这里只留下手感、沉默和你的判断。',
    emptyTitle: '没有标准答案',
    eyebrow: 'Chapter V · Intuition',
    hintLabel: '残响方向',
    manifesto: '别被配方牵走，去听沉默本身。',
    previewLabel: '余味感应',
    progressLabel: '直觉回声',
    showHint: true,
    showMetrics: false,
    showNumericProgress: false,
    showSignals: true,
    showSuggestions: false,
    signalLabel: '只剩手感'
  },
  strict: {
    badge: 'Strict',
    briefLabel: '校准建议',
    emptyBody: '第一章先学会调准，容量与三维决定这杯酒是否成立。',
    emptyTitle: '先从结构开始',
    eyebrow: 'Chapter I · Calibration',
    hintLabel: '目标提示',
    manifesto: '先把酒调准，再学会读人。',
    previewLabel: '杯中校准',
    progressLabel: '条件命中',
    showHint: true,
    showMetrics: true,
    showNumericProgress: true,
    showSignals: false,
    showSuggestions: true,
    signalLabel: '校准信号'
  },
  transitional: {
    badge: 'Transitional',
    briefLabel: '态度修正',
    emptyBody: '数字开始退后，态度开始浮现。',
    emptyTitle: '从正确走向贴近',
    eyebrow: 'Chapter II · Drift',
    hintLabel: '方向判断',
    manifesto: '不是只要命中，还要贴近这个人。',
    previewLabel: '偏移观测',
    progressLabel: '接近程度',
    showHint: true,
    showMetrics: true,
    showNumericProgress: true,
    showSignals: true,
    showSuggestions: true,
    signalLabel: '态度偏移'
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const describeAxis = (type, value) => {
  if (type === 'thickness') {
    if (value >= 7) return '厚重包裹';
    if (value >= 4) return '醇厚稳住';
    if (value >= 1) return '有骨架';
    if (value <= -2) return '轻盈透明';
    return '收束克制';
  }

  if (type === 'sweetness') {
    if (value >= 7) return '近乎安抚';
    if (value >= 4) return '柔软回甘';
    if (value >= 1) return '带点温度';
    if (value <= -1) return '克制冷静';
    return '平静留白';
  }

  if (value >= 7) return '锋利逼近';
  if (value >= 4) return '清醒有力';
  if (value >= 1) return '轻微提神';
  return '温和不逼迫';
};

const formatSigned = (value) => `${value > 0 ? '+' : ''}${value}`;

const getModeCopy = (mixingMode) => MODE_COPY[mixingMode] || MODE_COPY.strict;

const getCardNote = (state) => {
  if (state === 'locked') {
    return '\u5c1a\u672a\u89e3\u9501';
  }

  if (state === 'restricted') {
    return '\u5f53\u524d\u5267\u60c5\u4e0d\u53ef\u9009';
  }

  return '';
};

const getStepAvailabilityLabel = ({ currentStep, selectedCategory, unlockedDecorations, unlockedGlasses, unlockedIceTypes, visibleIceTypes }) => {
  if (currentStep === 'glass') {
    return `\u5df2\u89e3\u9501 ${unlockedGlasses.length}/${Object.keys(GLASS_TYPES).length} \u79cd\u676f\u578b`;
  }

  if (currentStep === 'ice') {
    return `\u53ef\u9009 ${visibleIceTypes.length}/${Object.keys(ICE_TYPES).length} \u79cd\u51b0\u5757`;
  }

  if (currentStep === 'ingredient') {
    return `\u5f53\u524d\u5206\u7c7b ${getIngredientsByCategory(selectedCategory).length} \u79cd\u539f\u6db2`;
  }

  if (currentStep === 'decoration') {
    return `\u5df2\u89e3\u9501 ${unlockedDecorations.length}/${Object.keys(DECORATION_TYPES).length} \u79cd\u88c5\u9970`;
  }

  return '';
};

const getItemDescription = (mixingMode, item) => {
  const numericSummary = `稠${formatSigned(item.thickness || 0)} · 甜${formatSigned(item.sweetness || 0)} · 烈${formatSigned(item.strength || 0)}`;
  const feelingSummary = item.feeling || item.description || '这是一种还没被命名的偏向。';

  if (mixingMode === 'strict') {
    return numericSummary;
  }

  if (mixingMode === 'transitional') {
    return `${numericSummary} · ${feelingSummary}`;
  }

  return feelingSummary;
};

const getGlassDescription = (mixingMode, glass) => {
  const capacityText = `${glass.maxPortions || 2} 份容量`;
  const styleText = glass.feeling || glass.description || '先让这杯酒站稳姿态。';

  if (mixingMode === 'strict') {
    return `${capacityText} · ${glass.description || styleText}`;
  }

  if (mixingMode === 'transitional') {
    return `${capacityText} · ${styleText}`;
  }

  return styleText;
};

const getAddonDescription = (mixingMode, item) => {
  const feelingText = item.feeling || item.description || '让这杯酒往另一侧轻轻偏移。';

  if (mixingMode === 'strict') {
    return item.description || feelingText;
  }

  return feelingText;
};

const buildCards = ({ currentStep, session, unlockedDecorations, unlockedGlasses, unlockedIceTypes, mixingMode, maxPortions, totalPortions }) => {
  if (currentStep === 'glass') {
    return Object.values(GLASS_TYPES).map((glass) => {
      const isUnlocked = unlockedGlasses.includes(glass.id);

      return {
        active: session.recipe.glass === glass.id,
        description: getGlassDescription(mixingMode, glass),
        disabled: !isUnlocked,
        icon: glass.icon,
        iconImage: glass.iconImage,
        id: glass.id,
        label: glass.name,
        note: getCardNote(isUnlocked ? '' : 'locked'),
        onClick: isUnlocked ? () => session.handleSelectGlass(glass.id) : null
      };
    });
  }

  if (currentStep === 'ice') {
    return Object.values(ICE_TYPES).map((ice) => {
      const isUnlocked = unlockedIceTypes.includes(ice.id);
      const isAvailable = session.filteredIceTypes.includes(ice.id);
      const disabledState = !isUnlocked ? 'locked' : (!isAvailable ? 'restricted' : '');

      return {
        active: session.recipe.ice === ice.id,
        description: getAddonDescription(mixingMode, ice),
        disabled: !isAvailable,
        icon: ice.icon,
        iconImage: ice.iconImage,
        id: ice.id,
        label: ice.name,
        note: getCardNote(disabledState),
        onClick: isAvailable ? () => session.handleSelectIce(ice.id) : null
      };
    });
  }

  if (currentStep === 'ingredient') {
    return getIngredientsByCategory(session.selectedCategory)
      .filter((ingredient) => session.filteredIngredients.includes(ingredient.id))
      .map((ingredient) => {
        const count = session.recipe.ingredients.find((portion) => portion.id === ingredient.id)?.count || 0;
        const isRestricted = session.disabledIngredientIds.has(ingredient.id);
        const isMaxed = count >= MAX_PORTIONS_PER_INGREDIENT || totalPortions >= maxPortions;

        return {
          active: count > 0,
          badge: count > 0 ? String(count) : '',
          description: getItemDescription(mixingMode, ingredient),
          disabled: isRestricted || isMaxed,
          icon: ingredient.icon,
          iconImage: ingredient.iconImage,
          id: ingredient.id,
          label: ingredient.name,
          onClick: () => session.handleAddIngredient(ingredient.id),
          onSecondaryAction: count > 0 ? () => session.handleRemoveIngredient(ingredient.id) : null,
          secondaryLabel: '−'
        };
      });
  }

  if (currentStep === 'decoration') {
    return [{ id: null, icon: '➖', name: '跳过', feeling: '保持克制，不追加这一层。' }, ...Object.values(DECORATION_TYPES).filter((item) => unlockedDecorations.includes(item.id))]
      .map((item) => ({
        active: session.recipe.decoration === item.id,
        description: getAddonDescription(mixingMode, item),
        icon: item.icon,
        iconImage: item.iconImage,
        id: item.id ?? 'skip-decoration',
        label: item.name,
        onClick: () => session.handleSelectDecoration(item.id ?? null)
      }));
  }

  return session.recipe.ingredients
    .filter((portion) => Boolean(INGREDIENTS[portion.id]))
    .map((portion) => ({
      active: false,
      description: `已加入 ${portion.count} 份`,
      icon: INGREDIENTS[portion.id].icon,
      iconImage: INGREDIENTS[portion.id].iconImage,
      id: portion.id,
      label: INGREDIENTS[portion.id].name,
      onClick: null
    }));
};

const buildSignals = (mixture, totalPortions) => {
  if (!totalPortions) {
    return [];
  }

  return [
    { key: 'thickness', label: '酒体', text: describeAxis('thickness', mixture.thickness || 0), value: Number(mixture.thickness || 0) },
    { key: 'sweetness', label: '甜感', text: describeAxis('sweetness', mixture.sweetness || 0), value: Number(mixture.sweetness || 0) },
    { key: 'strength', label: '力道', text: describeAxis('strength', mixture.strength || 0), value: Number(mixture.strength || 0) }
  ];
};

const buildReading = ({ maxPortions, mixingMode, modeCopy, session, signals, totalPortions }) => {
  const metCount = session.targetCheck?.metCount || 0;
  const satisfaction = Math.round((session.targetCheck?.satisfaction || 0) * 100);
  const totalConditions = session.targetCheck?.totalConditions || 0;

  if (!session.recipe.glass && totalPortions === 0) {
    return {
      body: modeCopy.emptyBody,
      footnote: `这一步会决定整套章节反馈该如何说话。`,
      title: modeCopy.emptyTitle
    };
  }

  if (mixingMode === 'strict') {
    if (session.targetCheck?.allMet && totalConditions > 0 && totalPortions === maxPortions) {
      return {
        body: '条件、容量与结构都已经对齐，可以把这杯酒递出去。',
        footnote: `当前容量 ${totalPortions}/${maxPortions} 份。`,
        title: '数值已校准'
      };
    }

    return {
      body: totalConditions > 0
        ? `当前命中 ${metCount}/${totalConditions} 条条件，还差一步就会更稳。`
        : '先让这杯酒拥有基本结构。',
      footnote: `容量 ${totalPortions}/${maxPortions} 份。严格模式下，每一步都可被量化。`,
      title: totalPortions < maxPortions ? `还差 ${Math.max(maxPortions - totalPortions, 0)} 份原液` : '这杯酒已经站稳'
    };
  }

  if (mixingMode === 'transitional') {
    return {
      body: session.currentAttitude?.baseSummary || '数值开始退后，但态度还不能失调。',
      footnote: totalConditions > 0
        ? `接近度 ${satisfaction}% · 命中 ${metCount}/${totalConditions}`
        : '你已经不只是在调对，而是在调得更贴近。',
      title: session.currentAttitude?.feelingSummary || (session.targetCheck?.allMet ? '方向已经接近' : '别只盯着数字')
    };
  }

  if (mixingMode === 'expressive') {
    return {
      body: session.currentAttitude?.baseSummary || '你在组织一种会被喝下去的回应。',
      footnote: signals.length > 0
        ? `目前更像：${signals.map((signal) => signal.text).join(' · ')}`
        : '材料的 feeling 会比命中条件更早说话。',
      title: session.currentAttitude?.feelingSummary || '这杯酒正在形成情绪'
    };
  }

  return {
    body: session.currentAttitude?.feelingSummary || '高阶模式不会替你判断，只会让结果更诚实。',
    footnote: signals.length > 0
      ? `现在只剩下 ${signals.map((signal) => signal.text).join(' · ')}。`
      : '你没有明确配方，只有直觉。',
    title: session.currentAttitude?.baseSummary || '你正在赌一次真正的理解'
  };
};

const buildAdviceItems = ({ mixingMode, session }) => {
  if (mixingMode === 'strict' || mixingMode === 'transitional') {
    if (session.suggestions?.length > 0) {
      return session.suggestions.slice(0, 3).map((suggestion, index) => ({
        key: `${suggestion.type}-${index}`,
        note: suggestion.recommended ? `可考虑：${suggestion.recommended}` : '',
        tone: suggestion.type,
        text: suggestion.message
      }));
    }

    return [{
      key: 'stable',
      note: '',
      text: '目前没有额外修正建议，继续沿着这条线推进。',
      tone: 'success'
    }];
  }

  if (session.currentAttitude?.feelingSummary) {
    return [{
      key: 'feeling',
      note: session.currentAttitude.baseSummary || '',
      text: `这杯酒已经开始像：${session.currentAttitude.feelingSummary}`,
      tone: 'hint'
    }];
  }

  return [{
    key: 'listen',
    note: '',
    text: '别急着追求正确，先听见这杯酒想往哪里走。',
    tone: 'hint'
  }];
};

const PixiMixingBoard = ({
  mixingMode = 'strict',
  session,
  targetHint = '',
  unlockedDecorations = [],
  unlockedGlasses = [],
  unlockedIceTypes = []
}) => {
  const modeCopy = getModeCopy(mixingMode);
  const stepCopy = STEP_COPY[session.currentStep] || STEP_COPY.glass;
  const totalPortions = getTotalPortions(session.recipe.ingredients);
  const currentGlass = session.recipe.glass ? GLASS_TYPES[session.recipe.glass] : null;
  const maxPortions = currentGlass?.maxPortions || MAX_TOTAL_PORTIONS;

  const cards = useMemo(() => buildCards({
    currentStep: session.currentStep,
    mixingMode,
    maxPortions,
    session,
    totalPortions,
    unlockedDecorations,
    unlockedGlasses,
    unlockedIceTypes
  }), [maxPortions, mixingMode, session, totalPortions, unlockedDecorations, unlockedGlasses, unlockedIceTypes]);

  const signals = useMemo(() => buildSignals(session.currentMixture, totalPortions), [session.currentMixture, totalPortions]);

  const reading = useMemo(() => buildReading({
    maxPortions,
    mixingMode,
    modeCopy,
    session,
    signals,
    totalPortions
  }), [maxPortions, mixingMode, modeCopy, session, signals, totalPortions]);

  const adviceItems = useMemo(() => buildAdviceItems({ mixingMode, session }), [mixingMode, session]);
  const availabilityLabel = useMemo(() => getStepAvailabilityLabel({
    currentStep: session.currentStep,
    selectedCategory: session.selectedCategory,
    unlockedDecorations,
    unlockedGlasses,
    unlockedIceTypes,
    visibleIceTypes: session.filteredIceTypes
  }), [session.currentStep, session.filteredIceTypes, session.selectedCategory, unlockedDecorations, unlockedGlasses, unlockedIceTypes]);

  const summaryText = modeCopy.showNumericProgress && session.targetCheck?.totalConditions > 0
    ? `\u547d\u4e2d ${session.targetCheck.metCount || 0}/${session.targetCheck.totalConditions || 0} \u00b7 ${reading.body}`
    : reading.body;
  const summaryChips = [
    currentGlass?.name || '\u672a\u9009\u676f\u578b',
    session.recipe.ice ? (ICE_TYPES[session.recipe.ice]?.name || '\u51b0\u5757') : '\u672a\u9009\u51b0\u5757',
    `${totalPortions}/${maxPortions}${modeCopy.showMetrics ? ' \u4efd\u539f\u6db2' : ' \u4e2a\u9009\u62e9'}`,
    ...(session.recipe.decoration ? [DECORATION_TYPES[session.recipe.decoration]?.name].filter(Boolean) : [])
  ];

  const showPreviousAction = session.currentStepIndex > 0;
  const prioritizeCards = ['glass', 'ice'].includes(session.currentStep);
  const visibleAdviceItems = prioritizeCards ? adviceItems.slice(0, 1) : adviceItems;
  const compactInsights = true;

  const insightPanel = (
    <div className={`pixi-mixing-board__insight-grid ${compactInsights ? 'compact' : ''}`}>
      {modeCopy.showHint && targetHint && (
        <div className="pixi-mixing-board__hint" role="note" aria-label="Target hint">
          <div className="pixi-mixing-board__hint-label">{modeCopy.hintLabel}</div>
          <div className="pixi-mixing-board__hint-text">{targetHint}</div>
        </div>
      )}

      <div className="pixi-mixing-board__brief" role="status" aria-label="Mode briefing">
        <div className="pixi-mixing-board__brief-label">{modeCopy.briefLabel}</div>
        <div className="pixi-mixing-board__brief-list">
          {visibleAdviceItems.map((item) => (
            <div key={item.key} className={`pixi-mixing-board__brief-item ${item.tone}`}>
              <div className="pixi-mixing-board__brief-text">{item.text}</div>
              {item.note && <div className="pixi-mixing-board__brief-note">{item.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`pixi-mixing-board pixi-mixing-board--${mixingMode}`} aria-label="Mixing stage board">
      <div className="pixi-mixing-board__mode-strip">
        <div className="pixi-mixing-board__mode-badge">{modeCopy.badge}</div>
        <div className="pixi-mixing-board__mode-manifesto">{modeCopy.manifesto}</div>
      </div>

      <div className="pixi-mixing-board__header">
        <div>
          <div className="pixi-mixing-board__eyebrow">{modeCopy.eyebrow}</div>
          <div className="pixi-mixing-board__title-row">
            <div className="pixi-mixing-board__title">{stepCopy.title}</div>
            <div className="pixi-mixing-board__step-counter">{session.currentStepIndex + 1}/{STEP_SEQUENCE.length}</div>
          </div>
          <div className="pixi-mixing-board__subtitle-row">
            <div className="pixi-mixing-board__subtitle">{stepCopy.subtitle}</div>
            {availabilityLabel && <div className="pixi-mixing-board__availability">{availabilityLabel}</div>}
          </div>
        </div>
        <button className="pixi-mixing-board__ghost-btn" type="button" onClick={session.handleReset}>↺ 重置</button>
      </div>

      <div className="pixi-mixing-board__step-rail" aria-label="Mixing steps">
        {STEP_SEQUENCE.map((stepId, index) => {
          const stepMeta = STEP_COPY[stepId];
          const isActive = session.currentStep === stepId;
          const isCompleted = index < session.currentStepIndex;

          return (
            <div key={stepId} className={`pixi-mixing-board__step-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <span className="pixi-mixing-board__step-icon">{stepMeta.icon}</span>
              <span className="pixi-mixing-board__step-label">{stepMeta.title.replace(/^Step\s+\d+\s+·\s+/, '')}</span>
            </div>
          );
        })}
      </div>

      <div className="pixi-mixing-board__body pixi-mixing-board__body--controls-only">
        <div className="pixi-mixing-board__controls">
          <div className="pixi-mixing-board__summary-strip">
            <div className="pixi-mixing-board__summary-main">
              <div className="pixi-mixing-board__summary-kicker">{modeCopy.progressLabel}</div>
              <div className="pixi-mixing-board__summary-title">{reading.title}</div>
              <div className="pixi-mixing-board__summary-text">{summaryText}</div>
            </div>
            <div className="pixi-mixing-board__summary-tags">
              {summaryChips.map((chip) => (
                <span key={chip} className="pixi-mixing-board__summary-chip">{chip}</span>
              ))}
            </div>
          </div>

          <div className="pixi-mixing-board__control-scroll">
            {session.currentStep === 'ingredient' && insightPanel}

            {session.currentStep === 'ingredient' && (
              <div className="pixi-mixing-board__tabs">
                {INGREDIENT_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`pixi-mixing-board__tab ${session.selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => session.setSelectedCategory(category.id)}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="pixi-mixing-board__cards">
              {cards.length > 0 ? cards.map((card) => (
                <div key={card.id} className={`pixi-mixing-board__card ${card.active ? 'active' : ''} ${card.disabled ? 'disabled' : ''}`}>
                  <button type="button" className="pixi-mixing-board__card-main" disabled={card.disabled || !card.onClick} onClick={card.onClick || undefined}>
                    <div className="pixi-mixing-board__card-top">
                      {(card.iconImage || card.icon) && (
                        <span className="pixi-mixing-board__card-icon">
                          {card.iconImage ? (
                            <img className="pixi-mixing-board__card-icon-image" src={card.iconImage} alt={`${card.label}图标`} />
                          ) : (
                            card.icon
                          )}
                        </span>
                      )}
                      {card.badge && <span className="pixi-mixing-board__card-badge">{card.badge}</span>}
                    </div>
                    <div className="pixi-mixing-board__card-title">{card.label}</div>
                    <div className="pixi-mixing-board__card-desc">{card.description}</div>
                    {card.note && <div className="pixi-mixing-board__card-note">{card.note}</div>}
                  </button>
                  {card.onSecondaryAction && (
                    <button type="button" className="pixi-mixing-board__card-secondary" onClick={card.onSecondaryAction}>
                      {card.secondaryLabel}
                    </button>
                  )}
                </div>
              )) : (
                <div className="pixi-mixing-board__empty">{"\u5f53\u524d\u6b65\u9aa4\u6682\u65e0\u53ef\u5c55\u793a\u5185\u5bb9。"}</div>
              )}
            </div>

            {false && insightPanel}
          </div>
        </div>
      </div>

      <div className={`pixi-mixing-board__footer ${showPreviousAction ? '' : 'single-action'}`}>
        {showPreviousAction && (
          <div className="pixi-mixing-board__footer-left">
            <button type="button" className="pixi-mixing-board__ghost-btn" onClick={session.handlePrevStep}>← 上一步</button>
          </div>
        )}
        <div className="pixi-mixing-board__footer-right">
          {session.currentStep === 'preview' ? (
            <button type="button" className="pixi-mixing-board__primary-btn" onClick={session.handleServe}>🍸 递酒</button>
          ) : (
            <button type="button" className="pixi-mixing-board__primary-btn" onClick={session.handleNextStep} disabled={!session.canProceed()}>
              下一步 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PixiMixingBoard;

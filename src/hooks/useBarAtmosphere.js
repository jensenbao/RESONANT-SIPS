// 酒吧氛围管理 Hook
import { useState, useCallback, useRef } from 'react';
import { getFallbackAtmosphere } from '../data/atmosphereTemplates.js';

const getNeutralModifiers = () => ({
  trustBonus: 0,
  emotionBias: [],
  targetShift: {
    thickness: 0,
    sweetness: 0,
    strength: 0
  },
  customerCountMod: 0
});

const stripAtmosphereEffects = (value) => {
  if (!value) return value;
  return {
    ...value,
    modifiers: getNeutralModifiers()
  };
};

/**
 * 酒吧氛围管理 Hook
 * 管理每日氛围的生成、展示和影响
 * @returns {Object} 氛围相关状态和方法
 */
export const useBarAtmosphere = () => {
  // 当前氛围
  const [atmosphere, setAtmosphere] = useState(null);
  // 是否正在生成氛围
  const [isGenerating, setIsGenerating] = useState(false);
  // 是否展示氛围开场
  const [showAtmosphereOverlay, setShowAtmosphereOverlay] = useState(false);
  // 最近的氛围历史（用于避免重复）
  const recentAtmospheresRef = useRef([]);

  /**
   * 为新的一天生成氛围
   * @param {number} day - 当前天数
   * @param {Array} recentCrossroadsSummaries - 🆕 近期十字路口摘要
   * @returns {Object} 生成的氛围数据
   */
  const generateAtmosphere = useCallback(async (day, recentCrossroadsSummaries = []) => {
    setIsGenerating(true);
    // 氛围仅作为背景展示，不再走AI生成。
    void recentCrossroadsSummaries;
    console.log(`Generating background atmosphere for day ${day} with local templates...`);

    const fallback = getFallbackAtmosphere(day, recentAtmospheresRef.current);
    console.log('Using local atmosphere template:', fallback.weather);
    const finalFallback = stripAtmosphereEffects(fallback);
    setAtmosphere(finalFallback);
    setShowAtmosphereOverlay(true);

    recentAtmospheresRef.current = [
      finalFallback,
      ...recentAtmospheresRef.current.slice(0, 2)
    ];
    
    setIsGenerating(false);
    return finalFallback;
  }, []);

  /**
   * 关闭氛围开场展示
   */
  const dismissAtmosphereOverlay = useCallback(() => {
    setShowAtmosphereOverlay(false);
    setIsGenerating(false);
  }, []);

  /**
   * 应用事件对氛围的临时修改
   * @param {Object} changes - 氛围变化
   */
  const applyAtmosphereChange = useCallback((changes) => {
    if (!changes) return;
    setAtmosphere(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...changes,
        // 保持 modifiers 不被覆盖
        modifiers: prev.modifiers
      };
    });
  }, []);

  /**
   * 重置氛围（用于新游戏等）
   */
  const resetAtmosphere = useCallback(() => {
    setAtmosphere(null);
    setShowAtmosphereOverlay(false);
    setIsGenerating(false);
    recentAtmospheresRef.current = [];
  }, []);

  return {
    // 状态
    atmosphere,
    isGenerating,
    showAtmosphereOverlay,

    // 方法
    generateAtmosphere,
    dismissAtmosphereOverlay,
    applyAtmosphereChange,
    resetAtmosphere
  };
};

export default useBarAtmosphere;

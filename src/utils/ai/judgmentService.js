import { DEBUG_CONFIG, PROMPT_TYPES, generatePrompt, getActiveAPIType } from '../../config/api.js';
import { callDeepSeekAPIHelper, callGeminiAPIHelper } from './sharedApi.js';
import { normalizeEmotionList } from '../emotionSchema.js';

const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/;

const ensureEnglishFeedback = (text, fallbackText) => {
  const normalized = String(text || '').trim();
  if (!normalized) return fallbackText;
  if (CJK_RE.test(normalized)) return fallbackText;
  return normalized;
};

export const callAIForCocktailJudgmentWithEmotionChange = async (params) => {
  const { aiConfig, trustLevel, emotionState, cocktailRecipe, dialogueHistory } = params;
  
  console.log('🍸⚡ Starting combined call: cocktail judgment + emotion change...');
  const startTime = Date.now();
  
  try {
    // 生成合并的 prompt
    const prompt = generatePrompt(PROMPT_TYPES.COCKTAIL_WITH_EMOTION, params);
    
    if (DEBUG_CONFIG.logPrompts) {
      console.log('=== Combined Cocktail+Emotion Prompt ===');
      console.log(prompt);
      console.log('========================================');
    }
    
    // 调用 Gemini API
    const response = await callGeminiAPIForCombinedJudgment(prompt);
    
    // 解析合并的 JSON 响应
    const result = parseCombinedJudgmentJSON(response, params);
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Combined call completed in ${elapsed}ms:`, result);
    
    return result;
  } catch (error) {
    console.error('❌ Combined call failed:', error);
    // 降级：使用简单规则
    return getFallbackCombinedJudgment(params);
  }
};

/**
 * 专门用于合并判断的 API 调用（支持 DeepSeek 和 Gemini）
 */
const callGeminiAPIForCombinedJudgment = async (prompt) => {
  const apiType = getActiveAPIType();
  
  // 使用 DeepSeek
  if (apiType === 'deepseek') {
    const text = await callDeepSeekAPIHelper(prompt, { temperature: 0.4, max_tokens: 4096 });
    console.log('📥 Raw combined judgment response:', text);
    return text;
  }
  
  const text = await callGeminiAPIHelper(prompt, {
    temperature: 0.4,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 4096,
    candidateCount: 1,
    label: 'Gemini',
  });
  console.log('📥 Raw combined judgment response:', text);
  return text;
};

/**
 * 解析合并判断的 JSON 响应
 */
const parseCombinedJudgmentJSON = (response, params) => {
  if (!response || typeof response !== 'string') {
    return null;
  }
  
  let cleanedResponse = response.trim();
  
  // 移除 markdown 代码块标记
  const codeBlockMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*)```/);
  if (codeBlockMatch) {
    cleanedResponse = codeBlockMatch[1].trim();
  }
  
  // 尝试解析
  try {
    const parsed = JSON.parse(cleanedResponse);
    return validateCombinedResult(parsed, params);
  } catch (e) {
    // 尝试提取 JSON 对象
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return validateCombinedResult(parsed, params);
      } catch (e2) {
        console.log('⚠️ JSON parsing failed, attempting manual extraction...');
        return extractFromTruncatedCombinedJSON(cleanedResponse, params);
      }
    }
  }
  
  return getFallbackCombinedJudgment(params);
};

/**
 * 从截断的合并JSON中提取字段
 */
const extractFromTruncatedCombinedJSON = (text, params) => {
  const successMatch = text.match(/"success"\s*:\s*(true|false)/i);
  const satisfactionMatch = text.match(/"satisfaction"\s*:\s*([\d.]+)/);
  const feedbackMatch = text.match(/"feedback"\s*:\s*"([^"]*)(?:"|$)/);
  
  if (successMatch) {
    const success = successMatch[1].toLowerCase() === 'true';
    const satisfaction = satisfactionMatch ? parseFloat(satisfactionMatch[1]) : (success ? 0.6 : 0.4);
    const feedback = feedbackMatch ? feedbackMatch[1] : (success ? 'This drink is pretty good.' : 'This does not taste quite right.');
    
    // 使用降级的情绪变化
    const fallbackEmotions = getFallbackEmotionChangeSimple(params, success);
    
    return {
      success,
      satisfaction: Math.max(0, Math.min(1, satisfaction)),
      feedback: ensureEnglishFeedback(feedback, success ? 'This made me feel better.' : 'Something feels off.'),
      newEmotions: fallbackEmotions
    };
  }
  
  return getFallbackCombinedJudgment(params);
};

/**
 * 验证并规范化合并结果
 */
const validateCombinedResult = (parsed, params) => {
  const filterValidEmotions = (emotions) => {
    return normalizeEmotionList(emotions, { min: 0, max: 2, fallback: [] });
  };
  
  const success = typeof parsed.success === 'boolean' ? parsed.success : false;
  const satisfaction = typeof parsed.satisfaction === 'number' 
    ? Math.max(0, Math.min(1, parsed.satisfaction)) 
    : (success ? 0.7 : 0.3);
  const feedback = ensureEnglishFeedback(
    typeof parsed.feedback === 'string' && parsed.feedback.length > 0 ? parsed.feedback : '',
    success ? 'This drink made me feel better.' : 'This drink is not quite right.'
  );
  
  // 解析新情绪
  let newEmotions = null;
  if (parsed.newEmotions) {
    const surface = filterValidEmotions(parsed.newEmotions.surface);
    const reality = filterValidEmotions(parsed.newEmotions.reality);
    
    if (surface.length > 0 || reality.length > 0) {
      newEmotions = {
        surface: surface.length > 0
          ? surface
          : normalizeEmotionList(params.emotionState?.surface, { min: 1, max: 1, fallback: ['trust'] }),
        reality: reality.length > 0
          ? reality
          : normalizeEmotionList(params.emotionState?.reality, { min: 1, max: 2, fallback: ['fear'] })
      };
    }
  }
  
  // 如果没有有效的新情绪，使用降级逻辑
  if (!newEmotions) {
    newEmotions = getFallbackEmotionChangeSimple(params, success);
  }
  
  return { success, satisfaction, feedback, newEmotions };
};

/**
 * 简单的降级情绪变化
 */
const getFallbackEmotionChangeSimple = (params, wasSuccessful) => {
  const currentSurface = normalizeEmotionList(params.emotionState?.surface, {
    min: 1,
    max: 1,
    fallback: ['trust'],
  });
  const currentReality = normalizeEmotionList(params.emotionState?.reality, {
    min: 1,
    max: 2,
    fallback: ['fear'],
  });
  
  const positiveTransitions = {
    fear: 'trust',
    sadness: 'joy',
    anger: 'trust',
    disgust: 'surprise',
  };
  
  let newReality = [...currentReality];
  
  if (wasSuccessful) {
    newReality = currentReality.map(emotion => {
      if (positiveTransitions[emotion] && Math.random() > 0.4) {
        return positiveTransitions[emotion];
      }
      return emotion;
    });
  }
  
  return {
    surface: currentSurface,
    reality: newReality
  };
};

/**
 * 降级的合并判断
 */
const getFallbackCombinedJudgment = (params) => {
  // 新系统：使用预判定的 isSuccess，不再依赖酒的情绪匹配
  const success = params.isSuccess === true;
  const satisfaction = typeof params.satisfaction === 'number' ? params.satisfaction : (success ? 0.6 : 0.3);
  
  return {
    success,
    satisfaction,
    feedback: success ? 'This drink... has a hard-to-name comfort. Thank you.' : 'Hmm... this does not feel quite right.',
    newEmotions: getFallbackEmotionChangeSimple(params, success)
  };
};

// ==================== 调酒判断功能 ====================

/**
 * 调用AI判断调酒是否成功
 * @param {Object} params - 包含 aiConfig, trustLevel, emotionState, cocktailRecipe, dialogueHistory
 * @returns {Object} { success: boolean, satisfaction: number, feedback: string, reason: string }
 */
export const callAIForCocktailJudgment = async (params) => {
  const { aiConfig, trustLevel, emotionState, cocktailRecipe, dialogueHistory } = params;
  
  console.log('🍸 Starting AI cocktail judgment...');
  
  try {
    // 生成 prompt
    const prompt = generatePrompt(PROMPT_TYPES.COCKTAIL_FEEDBACK, params);
    
    if (DEBUG_CONFIG.logPrompts) {
      console.log('=== Cocktail Judgment Prompt ===');
      console.log(prompt);
      console.log('================================');
    }
    
    // 调用 Gemini API（使用较低的 temperature 提高一致性）
    const response = await callGeminiAPIForCocktailJudgment(prompt);
    
    // 解析 JSON 响应
    const result = parseCocktailJudgmentJSON(response);
    
    if (result) {
      console.log('✅ AI cocktail judgment succeeded:', result);
      return result;
    } else {
      console.warn('⚠️ JSON parsing failed, using fallback judgment');
      return getFallbackCocktailJudgment(params, response);
    }
  } catch (error) {
    console.error('❌ AI cocktail judgment failed:', error);
    // 降级：使用简单规则判断
    return getFallbackCocktailJudgment(params, null);
  }
};

/**
 * 专门用于调酒判断的 API 调用（支持 DeepSeek 和 Gemini）
 */
const callGeminiAPIForCocktailJudgment = async (prompt) => {
  const apiType = getActiveAPIType();
  
  // 使用 DeepSeek
  if (apiType === 'deepseek') {
    const text = await callDeepSeekAPIHelper(prompt, { temperature: 0.5, max_tokens: 4096 });
    console.log('📥 Raw cocktail judgment response:', text);
    return text;
  }
  
  const text = await callGeminiAPIHelper(prompt, {
    temperature: 0.5,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 4096,
    candidateCount: 1,
    label: 'Gemini',
  });
  console.log('📥 Raw cocktail judgment response:', text);
  return text;
};

/**
 * 解析调酒判断的 JSON 响应
 */
const parseCocktailJudgmentJSON = (response) => {
  if (!response || typeof response !== 'string') {
    return null;
  }
  
  let cleanedResponse = response.trim();
  
  // 移除 markdown 代码块标记
  const codeBlockMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*)```/);
  if (codeBlockMatch) {
    cleanedResponse = codeBlockMatch[1].trim();
  }
  
  // 尝试直接解析
  try {
    const parsed = JSON.parse(cleanedResponse);
    return validateCocktailJudgment(parsed);
  } catch (e) {
    // 尝试提取 JSON 对象
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return validateCocktailJudgment(parsed);
      } catch (e2) {
        // JSON 被截断，尝试手动提取字段
        console.log('⚠️ JSON was truncated, attempting manual field extraction...');
        return extractFromTruncatedJSON(cleanedResponse);
      }
    }
  }
  
  return null;
};

/**
 * 从截断的 JSON 中提取字段
 */
const extractFromTruncatedJSON = (text) => {
  try {
    // 提取 success 字段
    const successMatch = text.match(/"success"\s*:\s*(true|false)/i);
    const success = successMatch ? successMatch[1].toLowerCase() === 'true' : null;
    
    // 提取 satisfaction 字段
    const satisfactionMatch = text.match(/"satisfaction"\s*:\s*([\d.]+)/);
    const satisfaction = satisfactionMatch ? parseFloat(satisfactionMatch[1]) : null;
    
    // 提取 feedback 字段（可能被截断）
    const feedbackMatch = text.match(/"feedback"\s*:\s*"([^"]*)(")?/);
    let feedback = feedbackMatch ? feedbackMatch[1] : null;
    
    // 如果 feedback 被截断（没有结束引号），添加省略号
    if (feedbackMatch && !feedbackMatch[2] && feedback) {
      feedback = feedback + '...';
    }
    
    // 提取 reason 字段
    const reasonMatch = text.match(/"reason"\s*:\s*"([^"]*)"/);
    const reason = reasonMatch ? reasonMatch[1] : '';
    
    // 如果至少提取到了 success，就返回结果
    if (success !== null) {
      console.log('✅ Successfully extracted data from truncated JSON:', { success, satisfaction, feedback });
      return {
        success,
        satisfaction: satisfaction !== null ? Math.max(0, Math.min(1, satisfaction)) : (success ? 0.6 : 0.4),
        feedback: ensureEnglishFeedback(feedback, success ? 'This drink is pretty good.' : 'This drink does not taste right.'),
        reason: reason || ''
      };
    }
  } catch (e) {
    console.error('❌ Failed to extract data from truncated JSON:', e);
  }
  
  return null;
};

/**
 * 验证并规范化调酒判断结果
 */
const validateCocktailJudgment = (parsed) => {
  // 确保必要字段存在并有正确类型
  const result = {
    success: typeof parsed.success === 'boolean' ? parsed.success : false,
    satisfaction: typeof parsed.satisfaction === 'number' 
      ? Math.max(0, Math.min(1, parsed.satisfaction)) 
      : (parsed.success ? 0.7 : 0.3),
    feedback: ensureEnglishFeedback(
      typeof parsed.feedback === 'string' && parsed.feedback.length > 0 ? parsed.feedback : '',
      parsed.success ? 'Thank you. This drink helped me feel better.' : 'This drink... does not feel right.'
    ),
    reason: typeof parsed.reason === 'string' 
      ? parsed.reason 
      : ''
  };
  
  return result;
};

/**
 * 降级判断：当 AI 调用失败时使用简单规则
 */
const getFallbackCocktailJudgment = (params, rawResponse) => {
  // 新系统：使用预判定的 isSuccess，不再依赖酒的情绪匹配
  const success = params.isSuccess === true;
  const satisfaction = typeof params.satisfaction === 'number' ? params.satisfaction : (success ? 0.6 : 0.3);
  
  // 尝试从原始响应中提取反馈文本（如果有的话）
  let feedback = success 
    ? 'This drink... has a hard-to-name comfort. Thank you.' 
    : 'Hmm... this drink is not quite what I needed.';
  
  if (rawResponse && typeof rawResponse === 'string' && rawResponse.length > 10) {
    // 如果有原始响应但 JSON 解析失败，尝试直接使用文本
    const cleanText = rawResponse.replace(/[{}"]/g, '').trim();
    if (cleanText.length > 10 && cleanText.length < 200) {
      feedback = cleanText;
    }
  }

  feedback = ensureEnglishFeedback(feedback, success
    ? 'This drink... has a hard-to-name comfort. Thank you.'
    : 'Hmm... this drink is not quite what I needed.');
  
  return {
    success,
    satisfaction,
    feedback,
    reason: success ? 'Fallback judgment: cocktail succeeded' : 'Fallback judgment: cocktail failed'
  };
};

// ==================== 情绪变化功能 ====================

/**
 * 调用AI生成顾客喝酒后的新情绪状态
 * @param {Object} params - 包含 aiConfig, currentEmotions, cocktailEmotions, wasSuccessful, dialogueHistory
 * @returns {Object} { surface: string[], reality: string[] }
 */
export const callAIForEmotionChange = async (params) => {
  const { aiConfig, currentEmotions, cocktailEmotions, wasSuccessful, dialogueHistory } = params;
  
  console.log('🎭 Starting AI emotion-change generation...');
  console.log('📊 Current emotions:', currentEmotions);
  console.log('🍸 Cocktail emotions:', cocktailEmotions);
  console.log('✅ Was successful:', wasSuccessful);
  
  try {
    // 生成 prompt
    const prompt = generatePrompt(PROMPT_TYPES.EMOTION_CHANGE, {
      aiConfig,
      currentEmotions,
      cocktailEmotions,
      wasSuccessful,
      dialogueHistory
    });
    
    if (DEBUG_CONFIG.logPrompts) {
      console.log('=== Emotion Change Prompt ===');
      console.log(prompt);
      console.log('=============================');
    }
    
    // 调用 Gemini API（使用较低的 temperature 提高一致性）
    const response = await callGeminiAPIForEmotionChange(prompt);
    
    // 解析 JSON 响应
    const result = parseEmotionChangeJSON(response);
    
    if (result) {
      console.log('✅ AI emotion change generated successfully:', result);
      return result;
    } else {
      console.warn('⚠️ JSON parsing failed, using fallback emotion change');
      return getFallbackEmotionChange(params);
    }
  } catch (error) {
    console.error('❌ AI emotion change generation failed:', error);
    // 降级：使用简单规则
    return getFallbackEmotionChange(params);
  }
};

/**
 * 专门用于情绪变化的 API 调用（支持 DeepSeek 和 Gemini）
 */
const callGeminiAPIForEmotionChange = async (prompt) => {
  const apiType = getActiveAPIType();
  
  // 使用 DeepSeek
  if (apiType === 'deepseek') {
    const text = await callDeepSeekAPIHelper(prompt, { temperature: 0.4, max_tokens: 4096 });
    console.log('📥 Raw emotion-change response:', text);
    return text;
  }
  
  const text = await callGeminiAPIHelper(prompt, {
    temperature: 0.4,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 4096,
    candidateCount: 1,
    label: 'Gemini',
  });
  console.log('📥 Raw emotion-change response:', text);
  return text;
};

/**
 * 解析情绪变化的 JSON 响应
 */
const parseEmotionChangeJSON = (response) => {
  if (!response || typeof response !== 'string') {
    return null;
  }
  
  let cleanedResponse = response.trim();
  
  // 移除 markdown 代码块标记
  const codeBlockMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*)```/);
  if (codeBlockMatch) {
    cleanedResponse = codeBlockMatch[1].trim();
  }
  
  // 尝试直接解析
  try {
    const parsed = JSON.parse(cleanedResponse);
    return validateEmotionChangeResult(parsed);
  } catch (e) {
    // 尝试提取 JSON 对象
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return validateEmotionChangeResult(parsed);
      } catch (e2) {
        console.log('⚠️ Emotion-change JSON parsing failed');
        return null;
      }
    }
  }
  
  return null;
};

/**
 * 验证并规范化情绪变化结果
 */
const validateEmotionChangeResult = (parsed) => {
  const surface = normalizeEmotionList(parsed.surface, { min: 0, max: 1, fallback: [] });
  const reality = normalizeEmotionList(parsed.reality, { min: 0, max: 2, fallback: [] });
  
  // 确保至少有一个情绪
  if (surface.length === 0 && reality.length === 0) {
    return null;
  }
  
  return {
    surface: surface.length > 0 ? surface : ['trust'],
    reality: reality.length > 0 ? reality : ['fear']
  };
};

/**
 * 降级情绪变化：当 AI 调用失败时使用简单规则
 */
const getFallbackEmotionChange = (params) => {
  const { currentEmotions, cocktailEmotions, wasSuccessful } = params;
  
  // 获取当前情绪
  const currentSurface = normalizeEmotionList(currentEmotions?.surface, {
    min: 1,
    max: 1,
    fallback: ['trust'],
  });
  const currentReality = normalizeEmotionList(currentEmotions?.reality, {
    min: 1,
    max: 2,
    fallback: ['fear'],
  });
  
  // 情绪转换映射（成功时可能的转变）
  const positiveTransitions = {
    fear: 'trust',
    sadness: 'joy',
    anger: 'trust',
    disgust: 'surprise',
  };
  
  let newSurface = [...currentSurface];
  let newReality = [...currentReality];
  
  if (wasSuccessful) {
    // 成功时：尝试将负面情绪转为正面
    newReality = currentReality.map(emotion => {
      if (positiveTransitions[emotion] && Math.random() > 0.4) {
        return positiveTransitions[emotion];
      }
      return emotion;
    });
    
    // 表面情绪可能变得更真实
    if (Math.random() > 0.5) {
      newSurface = newReality.slice(0, 1);
    }
  } else {
    // 失败时：情绪基本保持不变，可能略微加深
    // 有小概率加入焦虑或迷茫
    if (Math.random() > 0.7 && !currentReality.includes('fear')) {
      newReality = [...currentReality.slice(0, 1), 'surprise'];
    }
  }
  
  console.log('📊 Fallback emotion change:', { surface: newSurface, reality: newReality });
  
  return {
    surface: newSurface,
    reality: newReality
  };
};

// ==================== 对话信任度判断功能 ====================

/**
 * 调用AI判断对话是否影响信任度
 * @param {Object} params - 包含 aiConfig, trustLevel, emotionState, playerInput, dialogueHistory
 * @returns {Object} { change: number, reason: string }
 */
export const callAIForTrustJudgment = async (params) => {
  const { aiConfig, trustLevel, emotionState, playerInput, dialogueHistory } = params;
  
  console.log('💬 Starting AI trust judgment for dialogue...');
  console.log('📝 Player input:', playerInput);
  console.log('📊 Current trust level:', trustLevel);
  
  try {
    // 生成 prompt
    const prompt = generatePrompt(PROMPT_TYPES.TRUST_JUDGMENT, {
      aiConfig,
      trustLevel,
      emotionState,
      playerInput,
      dialogueHistory
    });
    
    if (DEBUG_CONFIG.logPrompts) {
      console.log('=== Trust Judgment Prompt ===');
      console.log(prompt);
      console.log('=============================');
    }
    
    // 调用 Gemini API
    const response = await callGeminiAPIForTrustJudgment(prompt);
    
    // 解析 JSON 响应
    const result = parseTrustJudgmentJSON(response);
    
    if (result) {
      console.log('✅ AI trust judgment succeeded:', result);
      return result;
    } else {
      console.warn('⚠️ JSON parsing failed, using fallback judgment');
      return getFallbackTrustJudgment(params);
    }
  } catch (error) {
    console.error('❌ AI trust judgment failed:', error);
    // 降级：使用简单规则
    return getFallbackTrustJudgment(params);
  }
};

/**
 * 专门用于信任度判断的 API 调用（支持 DeepSeek 和 Gemini）
 */
const callGeminiAPIForTrustJudgment = async (prompt) => {
  const apiType = getActiveAPIType();
  
  // 使用 DeepSeek
  if (apiType === 'deepseek') {
    const text = await callDeepSeekAPIHelper(prompt, { temperature: 0.3, max_tokens: 2048 });
    console.log('📥 Raw trust-judgment response:', text);
    return text;
  }
  
  const text = await callGeminiAPIHelper(prompt, {
    temperature: 0.3,
    topK: 15,
    topP: 0.7,
    maxOutputTokens: 2048,
    candidateCount: 1,
    label: 'Gemini',
  });
  console.log('📥 Raw trust-judgment response:', text);
  return text;
};

/**
 * 解析信任度判断的 JSON 响应
 */
const parseTrustJudgmentJSON = (response) => {
  if (!response || typeof response !== 'string') {
    return null;
  }
  
  let cleanedResponse = response.trim();
  
  // 移除 markdown 代码块标记
  const codeBlockMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*)```/);
  if (codeBlockMatch) {
    cleanedResponse = codeBlockMatch[1].trim();
  }
  
  // 尝试直接解析
  try {
    const parsed = JSON.parse(cleanedResponse);
    return validateTrustJudgmentResult(parsed);
  } catch (e) {
    // 尝试提取 JSON 对象
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return validateTrustJudgmentResult(parsed);
      } catch (e2) {
        // JSON不完整，尝试修复
        console.log('⚠️ Attempting to repair incomplete JSON...');
        return tryFixIncompleteJSON(cleanedResponse);
      }
    }
    
    // 尝试修复不完整的JSON
    return tryFixIncompleteJSON(cleanedResponse);
  }
};

/**
 * 尝试修复不完整的 JSON（处理被截断的情况）
 */
const tryFixIncompleteJSON = (response) => {
  // 尝试提取 change 值
  const changeMatch = response.match(/"change"\s*:\s*(-?[\d.]+)/);
  if (changeMatch) {
    const change = parseFloat(changeMatch[1]);
    
    // 尝试提取 reason 值（可能不完整）
    const reasonMatch = response.match(/"reason"\s*:\s*"([^"]*)(?:"|$)/);
    const reason = reasonMatch ? reasonMatch[1] : 'Dialogue evaluation';
    
    console.log('✅ Extracted from incomplete JSON: change=', change, 'reason=', reason);
    
    return validateTrustJudgmentResult({
      change,
      reason: reason || 'Dialogue evaluation'
    });
  }
  
  console.log('⚠️ Could not extract data from incomplete JSON');
  return null;
};

/**
 * 验证并规范化信任度判断结果
 */
const validateTrustJudgmentResult = (parsed) => {
  // 确保 change 是有效数字
  let change = typeof parsed.change === 'number' ? parsed.change : 0;
  
  // 限制变化范围在 -0.15 到 +0.15 之间
  change = Math.max(-0.15, Math.min(0.15, change));
  
  // 确保 reason 是字符串
  const reason = typeof parsed.reason === 'string' ? parsed.reason : 'Dialogue evaluation';
  
  return {
    change,
    reason
  };
};

/**
 * 降级信任度判断：当 AI 调用失败时使用简单规则
 */
const getFallbackTrustJudgment = (params) => {
  const { playerInput, dialogueHistory } = params;
  
  // 简单规则判断
  const message = playerInput || '';
  
  // 消息太短
  if (message.length < 3) {
    return { change: -0.03, reason: 'Reply too short' };
  }
  
  // 重复消息
  const recentPlayerMessages = (dialogueHistory || [])
    .filter(h => h.role === 'player')
    .slice(-3)
    .map(h => h.content);
  if (recentPlayerMessages.includes(message)) {
    return { change: -0.05, reason: 'Repeated reply' };
  }
  
  // 只有数字和标点
  if (/^[\d\s\.,!?。，！？]+$/.test(message)) {
    return { change: -0.03, reason: 'Meaningless reply' };
  }
  
  // 包含关心词汇
  const caringWords = ['怎么了', '还好吗', '没关系', '理解', '辛苦', '加油', '陪你', '听你说', '关心'];
  const hasCaring = caringWords.some(word => message.includes(word));
  if (hasCaring) {
    return { change: 0.06, reason: 'Showed care' };
  }
  
  // 包含提问
  if (message.includes('？') || message.includes('?')) {
    return { change: 0.04, reason: 'Asked proactively' };
  }
  
  // 普通回复
  if (message.length >= 10) {
    return { change: 0.02, reason: 'Normal conversation' };
  }
  
  return { change: 0, reason: 'Ordinary reply' };
};

// 生成快捷追问选项

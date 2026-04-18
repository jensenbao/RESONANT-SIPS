import React, { useEffect, useRef, useState } from 'react';
import CustomerAvatar from '../Avatar/CustomerAvatar.jsx';
import BalancedPixelText from '../Common/BalancedPixelText.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import './ChatPanel.css';

const ChatPanel = ({
  aiConfig,
  trustLevel,
  dialogueHistory,
  onSendMessage,
  quickOptions = [],
  isLoading = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [trustAnim, setTrustAnim] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevTrustRef = useRef(trustLevel);
  const lastSpokenSignature = useRef('');
  const speakTimerRef = useRef(null);
  const { speak, stopTTS } = useTTS();

  useEffect(() => {
    if (!Array.isArray(dialogueHistory) || dialogueHistory.length === 0) {
      return;
    }

    const lastMsg = dialogueHistory[dialogueHistory.length - 1];
    if (lastMsg.role !== 'ai' || lastMsg.isThinking) {
      return;
    }

    const content = String(lastMsg.content || '').trim();
    if (!content || content === '...' || content === '……') {
      return;
    }

    const signature = `${String(lastMsg.id || 'no-id')}::${content}`;
    if (signature === lastSpokenSignature.current) {
      return;
    }

    if (speakTimerRef.current) {
      window.clearTimeout(speakTimerRef.current);
    }

    speakTimerRef.current = window.setTimeout(() => {
      if (isLoading || signature === lastSpokenSignature.current) {
        return;
      }

      lastSpokenSignature.current = signature;
      speak(content, aiConfig);
    }, 450);
  }, [dialogueHistory, aiConfig, speak, isLoading]);

  useEffect(() => () => {
    if (speakTimerRef.current) {
      window.clearTimeout(speakTimerRef.current);
    }
    stopTTS();
  }, [stopTTS]);

  useEffect(() => {
    if (trustLevel > prevTrustRef.current) {
      setTrustAnim('trust-up');
    } else if (trustLevel < prevTrustRef.current) {
      setTrustAnim('trust-down');
    }

    prevTrustRef.current = trustLevel;
    const timer = setTimeout(() => setTrustAnim(''), 600);
    return () => clearTimeout(timer);
  }, [trustLevel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory, isLoading]);

  const handleSend = () => {
    if (!inputValue.trim()) {
      return;
    }

    onSendMessage(inputValue.trim(), 'custom');
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleQuickOption = (option, index) => {
    onSendMessage(option, 'quick');
    setHighlightedIndex(index);
    setTimeout(() => setHighlightedIndex(null), 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (content, isThinking = false) => {
    if (isThinking) {
      return <span className="thinking-ellipsis" aria-label="思考中">……</span>;
    }

    return <BalancedPixelText text={content} />;
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="ai-avatar">
          <CustomerAvatar
            avatarBase64={aiConfig.avatarBase64}
            emoji={aiConfig.avatar}
            size={56}
            customerId={aiConfig.id || aiConfig.avatarCacheKey}
          />
        </div>
        <div className="ai-info">
          <h3>{aiConfig.name}</h3>
          <div className="ai-personality">
            {(aiConfig.personality || []).map((trait, i) => (
              <span key={i} className="trait-tag">{trait}</span>
            ))}
          </div>
        </div>
        <div className="trust-indicator">
          <span className="trust-label">信任度</span>
          <div className="trust-bar">
            <div
              className={`trust-fill ${trustAnim}`}
              style={{
                width: `${trustLevel * 100}%`,
                backgroundColor: trustLevel < 0.3 ? '#E63946' : trustLevel < 0.6 ? '#FFB703' : '#A855F7'
              }}
            />
          </div>
          <span className="trust-value">{Math.round(trustLevel * 100)}%</span>
        </div>
      </div>

      <div className="chat-messages">
        {dialogueHistory.length === 0 && (
          <div className="welcome-message">
            <p>欢迎来到 Resonant Sips</p>
            <p className="subtitle">通过对话了解顾客的真实情绪，再为 TA 调制专属鸡尾酒</p>
          </div>
        )}

        {dialogueHistory.map((msg, index) => (
          <div
            key={msg.id || `msg-${index}`}
            className={`message ${msg.role === 'player' ? 'player-message' : 'ai-message'}`}
          >
            <div className="message-avatar">
              {msg.role === 'player' ? '🫖' : (
                <CustomerAvatar
                  avatarBase64={aiConfig.avatarBase64}
                  emoji={aiConfig.avatar}
                  size={36}
                  customerId={aiConfig.id || aiConfig.avatarCacheKey}
                />
              )}
            </div>
            <div className="message-bubble">
              {renderMessageContent(msg.content, msg.isThinking)}
              {!msg.isThinking && (
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">
              <CustomerAvatar
                avatarBase64={aiConfig.avatarBase64}
                emoji={aiConfig.avatar}
                size={36}
                customerId={aiConfig.id || aiConfig.avatarCacheKey}
              />
            </div>
            <div className="message-bubble loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="chat-composer">
        {quickOptions.length > 0 && (
          <div className="quick-options chat-composer__quick-options">
            {quickOptions.map((option, index) => (
              <button
                key={index}
                className={`quick-option ${highlightedIndex === index ? 'active' : ''} ${option === '……' ? 'silence' : ''}`}
                onClick={() => handleQuickOption(option, index)}
                disabled={isLoading}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-container" style={{ position: 'relative' }}>
          {!inputValue && (
            <div
              style={{
                position: 'absolute',
                left: '38px',
                top: '34px',
                pointerEvents: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '14px',
                zIndex: 10
              }}
            >
              <BalancedPixelText text="输入你的回应... (Enter发送，Shift+Enter换行)" />
            </div>
          )}
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder=""
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={2}
          />
          <button
            className="send-button"
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;

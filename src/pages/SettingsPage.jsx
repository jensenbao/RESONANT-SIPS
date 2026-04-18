import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings, clearAllCache, getStorageUsage } from '../utils/storage.js';
import { DEBUG_CONFIG, getActiveAPIConfig, getActiveAPIName, getActiveAPIType } from '../config/api.js';
import audioManager from '../utils/audioManager.js';
import './SettingsPage.css';

const SettingsPage = ({ onBack }) => {
  const [settings, setSettings] = useState(getSettings());
  const [storageInfo, setStorageInfo] = useState(getStorageUsage());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    localStorage.removeItem('bartender_effects_level');
  }, []);

  const updateSetting = (key, value) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    saveSettings(nextSettings);

    if (key === 'musicVolume') {
      audioManager.setBGMVolume(value);
    }

    if (key === 'sfxVolume') {
      audioManager.setSFXVolume(value);
    }

    if (key === 'soundEnabled') {
      audioManager.setMuted(!value);
    }
  };

  const handleClearCache = () => {
    if (showClearConfirm) {
      clearAllCache();
      setStorageInfo(getStorageUsage());
      setShowClearConfirm(false);
      window.location.reload();
      return;
    }

    setShowClearConfirm(true);
    setTimeout(() => setShowClearConfirm(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="back-button" onClick={onBack}>
          返回
        </button>
        <h1>设置</h1>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h2>音效设置</h2>

          <div className="setting-item">
            <div className="setting-info">
              <label>音效开关</label>
              <p className="setting-description">启用或关闭游戏声音</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>背景音乐音量</label>
              <p className="setting-description">调整背景音乐大小</p>
            </div>
            <div className="volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.musicVolume}
                onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
                disabled={!settings.soundEnabled}
              />
              <span className="volume-value">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>音效音量</label>
              <p className="setting-description">调整按钮与交互反馈音量</p>
            </div>
            <div className="volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.sfxVolume}
                onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                disabled={!settings.soundEnabled}
              />
              <span className="volume-value">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>存储管理</h2>

          <div className="storage-info">
            <div className="storage-item">
              <span className="storage-label">已使用存储</span>
              <span className="storage-value">{storageInfo?.usedKB} KB</span>
            </div>
            <div className="storage-item">
              <span className="storage-label">约 {storageInfo?.usedMB} MB</span>
            </div>
          </div>

          <button
            className={`clear-cache-button ${showClearConfirm ? 'confirm' : ''}`}
            onClick={handleClearCache}
          >
            {showClearConfirm ? '再次点击确认清除' : '清除所有缓存'}
          </button>

          <p className="cache-warning">
            清除缓存会删除所有游戏进度、对话记录和解锁内容。
          </p>
        </section>

        {import.meta.env.VITE_DEBUG_MODE === 'true' && (
          <section className="settings-section">
            <h2>AI 配置</h2>

            <div className="api-status">
              <div className="status-item">
                <span className="status-label">当前模式</span>
                <span className={`status-badge ${getActiveAPIType() === 'none' ? 'mock' : 'gemini'}`}>
                  {getActiveAPIType() === 'none' ? '未配置' : getActiveAPIName()}
                </span>
              </div>
              {getActiveAPIType() !== 'none' && (
                <div className="status-item">
                  <span className="status-label">模型</span>
                  <span className="status-badge gemini">
                    {getActiveAPIConfig()?.model || '-'}
                  </span>
                </div>
              )}
            </div>

            <p className="api-info">
              {getActiveAPIType() !== 'none' ? (
                <>
                  当前使用 <strong>{getActiveAPIName()}</strong>
                  （{getActiveAPIConfig()?.model || '-'}）。
                </>
              ) : (
                <>
                  尚未配置可用 API Key，请在 <strong>.env.local</strong> 中完成配置后重启。
                </>
              )}
              <br />
              当前保留了通用图像生成配置，后续可直接接入其他生图功能。
            </p>
          </section>
        )}

        {import.meta.env.VITE_DEBUG_MODE === 'true' && (
          <section className="settings-section">
            <h2>调试选项</h2>

            <div className="debug-info">
              <div className="debug-item">
                <span>显示情绪参数</span>
                <span className="debug-status">{DEBUG_CONFIG.showEmotionParams ? '是' : '否'}</span>
              </div>
              <div className="debug-item">
                <span>显示信任度</span>
                <span className="debug-status">{DEBUG_CONFIG.showTrustLevel ? '是' : '否'}</span>
              </div>
              <div className="debug-item">
                <span>显示配方适配度</span>
                <span className="debug-status">{DEBUG_CONFIG.showCompatibility ? '是' : '否'}</span>
              </div>
              <div className="debug-item">
                <span>控制台输出 Prompt</span>
                <span className="debug-status">{DEBUG_CONFIG.logPrompts ? '是' : '否'}</span>
              </div>
            </div>

            <p className="debug-info-text">
              调试选项可在 <code>src/config/api.js</code> 中修改。
            </p>
          </section>
        )}

        <section className="settings-section">
          <h2>关于游戏</h2>

          <div className="about-info">
            <p><strong>Resonant Sips</strong></p>
            <p>版本：0.1.0</p>
            <p className="about-description">
              通过与 AI 顾客进行多轮对话，识别其真实情绪，调制专属鸡尾酒并改变情绪状态。
            </p>
            <p className="tech-stack">
              技术栈：React 18 / Vite / LocalStorage
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;

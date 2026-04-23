import React, { useEffect, useState } from 'react';
import Toast from '../components/Common/Toast.jsx';
import {
  addCustomCharacterId,
  canDisableCharacter,
  getActiveCharacterIds,
  getCustomCharacterIds,
  removeCustomCharacterId,
  saveActiveCharacterIds,
} from '../utils/storage.js';
import { isPresetCharacterId } from '../config/defaultCharacters/index.js';
import { ensureStoryworldCharacterCached } from '../utils/storyworldRepository.js';
import './NewGameSetupPage.css';

const NewGameSetupPage = ({ onBack, onConfirmStart, onCharacterPoolChange, loading = false }) => {
  const [customCharacterInput, setCustomCharacterInput] = useState('');
  const [customCharacterIds, setCustomCharacterIds] = useState([]);
  const [activeCharacterIds, setActiveCharacterIds] = useState([]);
  const [toastList, setToastList] = useState([]);
  const activeCharacterId = activeCharacterIds[0] || '';
  const hasActiveCharacters = Boolean(activeCharacterId);

  useEffect(() => {
    const custom = getCustomCharacterIds();
    const active = getActiveCharacterIds();
    setCustomCharacterIds(custom);
    setActiveCharacterIds(active);
  }, []);

  const pushToast = (message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setToastList((prev) => [...prev, { id, message, type }]);
  };

  const handleAddCharacter = async () => {
    const candidateId = String(customCharacterInput || '').trim();
    if (!candidateId) {
      pushToast('Please enter a character ID.', 'warning');
      return;
    }

    if (customCharacterIds.includes(candidateId)) {
      pushToast('This character is already added.', 'warning');
      return;
    }

    try {
      await ensureStoryworldCharacterCached(candidateId);
    } catch (error) {
      const reason = String(error?.message || '');
      if (reason.includes('character_not_found')) {
        pushToast('Character ID not found. Please verify and try again.', 'warning');
      } else {
        pushToast(`Failed to load character: ${reason || 'Unknown error'}`, 'error');
      }
      return;
    }

    const result = addCustomCharacterId(candidateId);
    if (!result.ok) {
      if (result.reason === 'invalid_format') {
        pushToast('Character ID allows only letters, numbers, underscores, and hyphens.', 'warning');
      } else if (result.reason === 'duplicate') {
        pushToast('This character is already added.', 'warning');
      } else {
        pushToast('Failed to add character.', 'error');
      }
      return;
    }

    setCustomCharacterIds(getCustomCharacterIds());
    setActiveCharacterIds(getActiveCharacterIds());
    setCustomCharacterInput('');
    onCharacterPoolChange?.();
    pushToast('Character added and enabled by default.', 'success');
  };

  const handleRemoveCharacter = (id) => {
    if (!canDisableCharacter(id, customCharacterIds)) {
      pushToast('Add at least one non-preset character before disabling default ones.', 'warning');
      return;
    }
    removeCustomCharacterId(id);
    setCustomCharacterIds(getCustomCharacterIds());
    setActiveCharacterIds(getActiveCharacterIds());
    onCharacterPoolChange?.();
    pushToast(`Removed character ${id}.`, 'info');
  };

  const handleSelectCharacter = (id) => {
    const saved = saveActiveCharacterIds([id]);
    setActiveCharacterIds(saved);
    onCharacterPoolChange?.();
  };

  const handleConfirmStart = () => {
    if (!hasActiveCharacters) {
      pushToast('Enable at least one character ID before starting.', 'warning');
      return;
    }
    onConfirmStart?.();
  };

  return (
    <div className="newgame-setup-page">
      <div className="newgame-setup-panel">
        <h1 className="newgame-setup-title">New Game Setup</h1>
        <p className="newgame-setup-desc">Configure which characters can appear before starting. Current mode: custom characters only.</p>

        <section className="newgame-role-panel">
          <div className="newgame-role-title">Character Pool</div>
          <p className="newgame-role-hint">Enter a character ID (e.g. 5738g). Single-select mode: you can only activate one character per run.</p>

          <div className="newgame-role-input-row">
            <input
              className="newgame-role-input"
              value={customCharacterInput}
              onChange={(event) => setCustomCharacterInput(event.target.value)}
              placeholder="Enter character ID"
              maxLength={64}
            />
            <button className="newgame-role-add-btn" onClick={handleAddCharacter} disabled={loading}>Add</button>
          </div>

          <div className="newgame-role-list">
            {customCharacterIds.length === 0 && (
              <div className="newgame-role-empty">No characters added yet. Please add at least one character ID.</div>
            )}
            {customCharacterIds.map((id) => {
              const locked = !canDisableCharacter(id, customCharacterIds);
              const isPreset = isPresetCharacterId(id);
              return (
                <div className="newgame-role-item" key={id}>
                  <label className="newgame-role-main">
                    <input
                      type="radio"
                      name="active-character-id"
                      checked={activeCharacterId === id}
                      onChange={() => handleSelectCharacter(id)}
                      disabled={loading}
                    />
                    <span>{id}{isPreset ? ' (Default)' : ''}</span>
                  </label>
                  <button
                    className="newgame-role-remove-btn"
                    onClick={() => handleRemoveCharacter(id)}
                    disabled={loading || locked}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="newgame-actions">
          <button className="newgame-back-btn" onClick={onBack} disabled={loading}>Back</button>
          <button className="newgame-start-btn" onClick={handleConfirmStart} disabled={loading || !hasActiveCharacters}>
            {loading ? 'Creating...' : 'Start New Game'}
          </button>
        </div>
      </div>

      {toastList.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToastList((prev) => prev.filter((item) => item.id !== toast.id))}
        />
      ))}
    </div>
  );
};

export default NewGameSetupPage;

// src/pages/settings/ThresholdSettings.jsx
import React from 'react';

export default function ThresholdSettings({
  threshold,
  setThreshold,
  message,
  setMessage,
  updateDate,
  error,
  saving,
  usersTg,
  saveSettings,
  handleUserCheckBox
}) {
  return (
    <div>
      <h2 className="content-title">Встановити поріг сканування</h2>
      <p className="page-subtitle settings-subtitle-margin">
        Вкажіть числове значення порогу для сканування
      </p>
      <div className="threshold-form">
        <input
          type="number"
          className="settings-input"
          placeholder="Наприклад: 100"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
        <input
          type="text"
          className="settings-input settings-input-message"
          placeholder="Текст повідомлення"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="btn-primary save-btn" onClick={saveSettings} disabled={saving}>
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
      </div>
      {error && (
        <div className="error-message settings-error-margin">{error}</div>
      )}
      {updateDate && (
        <div className="data-info settings-update-info-margin">
          Останнє оновлення: {updateDate}
        </div>
      )}

      <div className="users-list-container">
        <h3 className="content-title">Користувачі Telegram</h3>
        <div className="users-list-title-container">
          {typeof usersTg === 'object' && Object.keys(usersTg).length > 0 ? (
            <div className="users-list">
              {Object.entries(usersTg).map(([key, user]) => (
                <div
                  key={key}
                  className={`user-item ${user.scanThreshold === true ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={user.scanThreshold === true}
                    onChange={(e) => handleUserCheckBox(key, 'scanThreshold', e.target.checked)}
                  />
                  <div className="user-item-content">
                    <span><strong>Chat ID:</strong> {key}</span>
                    <span><strong>Ім'я:</strong> {user.name || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="users-empty">Користувачів не знайдено</p>
          )}
        </div>
      </div>
    </div>
  );
}
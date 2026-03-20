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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Встановити поріг сканування</h2>
      <p className="text-gray-600 mb-6">
        Вкажіть числове значення порогу для сканування
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="space-y-4">
          <input
            type="number"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="Наприклад: 100"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="Текст повідомлення"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {updateDate && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-700 text-sm">
          Останнє оновлення: {updateDate}
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Користувачі Telegram</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {typeof usersTg === 'object' && Object.keys(usersTg).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(usersTg).map(([key, user]) => (
                <div
                  key={key}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    user.scanThreshold === true
                      ? 'bg-brand-50 border-brand-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 accent-brand-600 rounded cursor-pointer"
                    checked={user.scanThreshold === true}
                    onChange={(e) => handleUserCheckBox(key, 'scanThreshold', e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      <strong>Chat ID:</strong> {key}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Ім'я:</strong> {user.name || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Користувачів не знайдено</p>
          )}
        </div>
      </div>
    </div>
  );
}
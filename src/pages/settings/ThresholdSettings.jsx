// src/pages/settings/ThresholdSettings.jsx
import React from 'react';
import { Bell, Save, Clock, Send } from 'lucide-react';

export default function ThresholdSettings({
  threshold,
  setThreshold,
  message,
  setMessage,
  updateDate,
  error,
  saving,
  saveSettings,
}) {
  return (
    <div>
      {/* Header row: title + save */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Поріг сканування</h2>
          <p className="text-gray-500 text-sm mt-0.5">Поріг та повідомлення при перевищенні ліміту</p>
        </div>
        <button
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          onClick={saveSettings}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Settings card — threshold + message in one row */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Bell size={15} className="text-gray-400" />
            Поріг
          </label>
          <input
            type="number"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="500"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />

          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Send size={15} className="text-gray-400" />
            Повідомлення
          </label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="Текст повідомлення"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {updateDate && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <Clock size={12} />
            Оновлено: {updateDate}
          </div>
        )}
      </div>

    </div>
  );
}

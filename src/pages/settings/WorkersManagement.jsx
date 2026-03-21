// src/pages/settings/WorkersManagement.jsx
import React from 'react';
import {
  Users, Lock, Save, RefreshCw, Trash2, Plus, X, Hash,
  ChevronDown, ToggleLeft, ToggleRight, Mail, Palette,
  FileText, Package, Boxes, SearchCode
} from 'lucide-react';

export default function WorkersManagement({
  workers,
  kioskSettings,
  userEmails,
  loading,
  error,
  selectedWorkerId,
  setSelectedWorkerId,
  saving,
  isAdding,
  setIsAdding,
  newWorker,
  setNewWorker,
  addWorker,
  updateWorkerField,
  handleCheckboxChange,
  saveWorker,
  deleteWorker,
  toggleActive,
  toggleKioskMode,
  setKioskEmail,
  // Telegram dropdown
  searchTerm,
  setSearchTerm,
  showDropdown,
  setShowDropdown,
  filteredUsersTg,
  handleSelectChatId,
  dropdownRef,
  // Color helpers
  argbToHex
}) {
  const selectedWorker = workers[selectedWorkerId] || {};

  // Get color value (convert ARGB to hex if needed)
  const getColorValue = (color) => {
    if (!color) return '#3b82f6';
    if (typeof color === 'string') return color;
    return argbToHex(color);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Робітники</h2>
      <p className="text-gray-600 mb-6">Керуйте робітниками та кіоск-режимом</p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Кіоск-режим */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900">Кіоск-режим (PIN)</h3>
            <p className="text-sm text-gray-500 mt-1">
              Працівники входять по PIN-коду. При поверненні в додаток з'являтиметься діалог вводу PIN.
            </p>
          </div>
          <button
            onClick={toggleKioskMode}
            className="flex-shrink-0 ml-4"
          >
            {kioskSettings.workerPinEnabled ? (
              <ToggleRight size={36} className="text-brand-600" />
            ) : (
              <ToggleLeft size={36} className="text-gray-400" />
            )}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail size={14} />
            Email для кіоск-режиму
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Оберіть акаунт, від імені якого працюватиме планшет.
          </p>
          <div className="relative">
            <select
              value={kioskSettings.kioskEmail || ''}
              onChange={(e) => setKioskEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors appearance-none pr-10"
            >
              <option value="">Оберіть акаунт</option>
              {userEmails.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Список робітників + редагування */}
      <div className="grid grid-cols-3 gap-6 items-start">

        {/* Список робітників */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Робітники</h3>
            <button
              onClick={() => { setIsAdding(true); setSelectedWorkerId(null); }}
              className="p-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Форма додавання */}
          {isAdding && (
            <div className="mb-4 p-3 rounded-lg border border-brand-200 bg-brand-50">
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  placeholder="Ім'я робітника"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="PIN (6 цифр)"
                  value={newWorker.pin}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, pin: e.target.value }))}
                  maxLength="6"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addWorker}
                  disabled={saving}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Додавання...' : 'Додати'}
                </button>
                <button
                  onClick={() => { setIsAdding(false); setNewWorker({ name: '', pin: '' }); }}
                  className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <RefreshCw size={20} className="animate-spin text-gray-400" />
              <p className="text-gray-500 text-sm">Завантаження...</p>
            </div>
          ) : Object.keys(workers).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(workers).map(([id, worker]) => (
                <button
                  key={id}
                  onClick={() => { setSelectedWorkerId(id); setIsAdding(false); }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedWorkerId === id
                      ? 'bg-brand-50 border border-brand-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      worker.active ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{worker.name || 'Без імені'}</div>
                      <div className="text-xs text-gray-500">PIN: ******</div>
                    </div>
                    {!worker.active && (
                      <span className="text-xs text-gray-400 flex-shrink-0">Неактивний</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Робітників не знайдено</p>
          )}
        </div>

        {/* Редагування робітника */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          {selectedWorkerId ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Редагування</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteWorker(selectedWorkerId)}
                    disabled={saving}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Видалити
                  </button>
                  <button
                    onClick={() => saveWorker(selectedWorkerId)}
                    disabled={saving}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {saving ? 'Збереження...' : 'Зберегти'}
                  </button>
                </div>
              </div>

              {/* Базова інформація */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Базова інформація</h4>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Users size={14} />
                      Ім'я
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                      value={selectedWorker.name || ''}
                      onChange={(e) => updateWorkerField(selectedWorkerId, 'name', e.target.value)}
                      placeholder="Ім'я робітника"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock size={14} />
                      PIN
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                      value={selectedWorker.pin || ''}
                      onChange={(e) => updateWorkerField(selectedWorkerId, 'pin', e.target.value)}
                      placeholder="PIN (6 цифр)"
                      maxLength="6"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Palette size={14} />
                      Колір
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        value={getColorValue(selectedWorker.color)}
                        onChange={(e) => updateWorkerField(selectedWorkerId, 'color', e.target.value)}
                      />
                      <input
                        type="text"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                        value={getColorValue(selectedWorker.color)}
                        onChange={(e) => updateWorkerField(selectedWorkerId, 'color', e.target.value)}
                        placeholder="#3b82f6"
                        maxLength="7"
                      />
                    </div>
                  </div>

                  {/* Chat ID (Telegram) dropdown */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Hash size={14} />
                      Chat ID (Telegram)
                    </label>

                    <div className="relative" ref={dropdownRef}>
                      <input
                        type="text"
                        value={searchTerm || selectedWorker.chatId || ''}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          updateWorkerField(selectedWorkerId, 'chatId', e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Почніть вводити chatId або ім'я"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors pr-10"
                      />

                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => setShowDropdown(!showDropdown)}
                        type="button"
                      >
                        <ChevronDown size={18} />
                      </button>

                      {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          {filteredUsersTg.length > 0 ? (
                            filteredUsersTg.map(([chatId, user]) => (
                              <div
                                key={chatId}
                                onClick={() => handleSelectChatId(chatId)}
                                className="px-3 py-2.5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                              >
                                <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                                  <Hash size={12} />
                                  {chatId}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Users size={11} />
                                  {user.name || 'Без імені'}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-3 text-sm text-gray-500 text-center">
                              Не знайдено
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                        checked={!!selectedWorker.active}
                        onChange={() => toggleActive(selectedWorkerId)}
                      />
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${selectedWorker.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-900">
                          {selectedWorker.active ? 'Активний' : 'Неактивний'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Дозволи */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Дозволи</h4>
                <div className="grid grid-cols-2 gap-4">

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                      checked={!!selectedWorker.userRestrict?.invoice}
                      onChange={(e) => handleCheckboxChange(selectedWorkerId, 'invoice', e.target.checked)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Накладна</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                      checked={!!selectedWorker.userRestrict?.invoiceAll}
                      onChange={(e) => handleCheckboxChange(selectedWorkerId, 'invoiceAll', e.target.checked)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Всі накладні</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                      checked={!!selectedWorker.userRestrict?.orderAll}
                      onChange={(e) => handleCheckboxChange(selectedWorkerId, 'orderAll', e.target.checked)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Package size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Замовленя</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                      checked={!!selectedWorker.userRestrict?.volumeAndParams}
                      onChange={(e) => handleCheckboxChange(selectedWorkerId, 'volumeAndParams', e.target.checked)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Boxes size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Об'єми та Розміщення</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors col-span-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                      checked={!!selectedWorker.userRestrict?.searchCode}
                      onChange={(e) => handleCheckboxChange(selectedWorkerId, 'searchCode', e.target.checked)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <SearchCode size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Пошук коду</span>
                    </div>
                  </label>

                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-16 text-gray-500">
              Виберіть робітника зі списку
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

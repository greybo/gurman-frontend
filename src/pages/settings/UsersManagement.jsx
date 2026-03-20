// src/pages/settings/UsersManagement.jsx
import React from 'react';
import {
  Users, Hash, CheckCircle, AlertTriangle, Save, RefreshCw,
  Mail, FileText, Package, Boxes, SearchCode, ChevronDown, Lock, Palette
} from 'lucide-react';

export default function UsersManagement({
  users,
  loading,
  usersError,
  selectedUserId,
  setSelectedUserId,
  isSaving,
  handleSaveUser,
  backupUser,
  searchTerm,
  setSearchTerm,
  showDropdown,
  setShowDropdown,
  filteredUsersTg,
  handleSelectChatId,
  handleInputChange,
  handleCheckboxChange,
  currentUsersTg,
  dropdownRef,
  argbToHex
}) {
  const selectedUser = users[selectedUserId] || {};

  // Get color value (convert ARGB to hex if needed)
  const getColorValue = (color) => {
    if (!color) return '#3b82f6';
    if (typeof color === 'string') return color;
    return argbToHex(color);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Керування користувачами</h2>
      <p className="text-gray-600 mb-6">Редагуйте дозволи та налаштування користувачів</p>

      {usersError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {usersError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 items-start">

        {/* Список користувачів */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Користувачі</h3>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <RefreshCw size={20} className="animate-spin text-gray-400" />
              <p className="text-gray-500 text-sm">Завантаження...</p>
            </div>
          ) : Object.keys(users).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(users).map(([userId, user]) => (
                <button
                  key={userId}
                  onClick={() => setSelectedUserId(userId)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUserId === userId
                      ? 'bg-brand-50 border border-brand-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                  <div className="text-sm text-gray-600">{user.email || 'N/A'}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Користувачів не знайдено</p>
          )}
        </div>

        {/* Редагування користувача */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          {selectedUserId ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Редагування</h3>
                <button
                  onClick={handleSaveUser}
                  disabled={isSaving}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isSaving ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>

              {/* Базова інформація */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Базова інформація</h4>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail size={14} />
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      value={selectedUser.email || ''}
                      onChange={(e) => handleInputChange(selectedUserId, 'email', e.target.value)}
                      placeholder="user@example.com"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Users size={14} />
                      Ім'я
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                      value={selectedUser.name || ''}
                      onChange={(e) => handleInputChange(selectedUserId, 'name', e.target.value)}
                      placeholder="Ім'я користувача"
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
                      value={selectedUser.pin || ''}
                      onChange={(e) => handleInputChange(selectedUserId, 'pin', e.target.value)}
                      placeholder="PIN для ідентифікації"
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
                        value={getColorValue(selectedUser.color)}
                        onChange={(e) => handleInputChange(selectedUserId, 'color', e.target.value)}
                      />
                      <input
                        type="text"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                        value={getColorValue(selectedUser.color)}
                        onChange={(e) => handleInputChange(selectedUserId, 'color', e.target.value)}
                        placeholder="#3b82f6"
                        maxLength="7"
                      />
                    </div>
                  </div>

                  {/* Chat ID dropdown list */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Hash size={14} />
                      Chat ID (Telegram)
                    </label>

                    <div
                      className="relative"
                      ref={dropdownRef}
                    >
                      <input
                        type="text"
                        value={searchTerm || selectedUser.chatId || ''}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          handleInputChange(selectedUserId, 'chatId', e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Почніть вводити chatId або ім'я"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors pr-10 disabled:bg-gray-50 disabled:text-gray-500"
                        disabled={backupUser?.chatId}
                      />

                      {/* Кнопка шеврона */}
                      {!backupUser?.chatId && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900 transition-colors"
                          onClick={() => !backupUser?.chatId && setShowDropdown(!showDropdown)}
                          type="button"
                        >
                          <ChevronDown size={18} />
                        </button>
                      )}

                      {showDropdown && !backupUser?.chatId && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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

                </div>
              </div>

              {/* Чекбокси дозволів */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Дозволи</h4>
                <div className="grid grid-cols-2 gap-4">

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                      checked={!!selectedUser.userRestrict?.invoice}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'invoice', e.target.checked)}
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
                      checked={!!selectedUser.userRestrict?.invoiceAll}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'invoiceAll', e.target.checked)}
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
                      checked={!!selectedUser.userRestrict?.orderAll}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'orderAll', e.target.checked)}
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
                      checked={!!selectedUser.userRestrict?.volumeAndParams}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'volumeAndParams', e.target.checked)}
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
                      checked={!!selectedUser.userRestrict?.searchCode}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'searchCode', e.target.checked)}
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
              Виберіть користувача зі списку
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
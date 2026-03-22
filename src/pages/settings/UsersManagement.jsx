// src/pages/settings/UsersManagement.jsx
import React from 'react';
import { Users, Mail, RefreshCw, Plus, Trash2, X, Lock, ShieldOff, ShieldCheck, Calendar, Clock } from 'lucide-react';

export default function UsersManagement({
  users,
  loading,
  usersError,
  selectedUserId,
  setSelectedUserId,
  saving,
  showAddForm,
  setShowAddForm,
  newEmail,
  setNewEmail,
  newPassword,
  setNewPassword,
  registerUser,
  deleteUser,
  toggleUserDisabled,
}) {
  const selectedUser = users[selectedUserId] || null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Керування користувачами</h2>
      <p className="text-gray-600 mb-6">Облікові записи системи (Firebase Auth)</p>

      {usersError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {usersError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 items-start">

        {/* Список користувачів */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Користувачі ({Object.keys(users).length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`p-1.5 rounded-lg transition-colors ${
                showAddForm
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
              }`}
              title={showAddForm ? 'Закрити' : 'Додати користувача'}
            >
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>

          {/* Форма реєстрації */}
          {showAddForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
                  <Mail size={12} />
                  Email
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
                  <Lock size={12} />
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="Мін. 6 символів"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                />
              </div>
              <button
                onClick={registerUser}
                disabled={saving}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Реєстрація...' : 'Зареєструвати'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <RefreshCw size={20} className="animate-spin text-gray-400" />
              <p className="text-gray-500 text-sm">Завантаження...</p>
            </div>
          ) : Object.keys(users).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(users).map(([userId, user]) => (
                <div
                  key={userId}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedUserId === userId
                      ? 'bg-brand-50 border-brand-200'
                      : user.disabled
                        ? 'bg-red-50/50 border-gray-200 hover:bg-red-50'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedUserId(userId)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {user.email || 'N/A'}
                    </div>
                    {user.disabled && (
                      <span className="text-xs text-red-500">заблоковано</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteUser(userId);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Видалити"
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Користувачів не знайдено</p>
          )}
        </div>

        {/* Деталі користувача */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          {selectedUser ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Інформація</h3>
                <button
                  onClick={() => toggleUserDisabled(selectedUserId, selectedUser.disabled)}
                  disabled={saving}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedUser.disabled
                      ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  {selectedUser.disabled ? (
                    <>
                      <ShieldCheck size={16} />
                      Розблокувати
                    </>
                  ) : (
                    <>
                      <ShieldOff size={16} />
                      Заблокувати
                    </>
                  )}
                </button>
              </div>

              {selectedUser.disabled && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm flex items-center gap-2">
                  <ShieldOff size={16} />
                  Користувач заблокований — не може увійти в систему
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users size={14} />
                    UID
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500 outline-none"
                    value={selectedUser.uid || selectedUserId}
                    disabled
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail size={14} />
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500 outline-none"
                    value={selectedUser.email || ''}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={14} />
                      Створено
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500 outline-none"
                      value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('uk-UA') : ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Clock size={14} />
                      Останній вхід
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500 outline-none"
                      value={selectedUser.lastSignIn ? new Date(selectedUser.lastSignIn).toLocaleDateString('uk-UA') : ''}
                      disabled
                    />
                  </div>
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

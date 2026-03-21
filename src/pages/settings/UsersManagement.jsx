// src/pages/settings/UsersManagement.jsx
import React from 'react';
import { Users, Mail, RefreshCw } from 'lucide-react';

export default function UsersManagement({
  users,
  loading,
  usersError,
  selectedUserId,
  setSelectedUserId,
}) {
  const selectedUser = users[selectedUserId] || {};

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Керування користувачами</h2>
      <p className="text-gray-600 mb-6">Облікові записи системи (uid та email)</p>

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
                  <div className="font-medium text-gray-900">{user.email || 'N/A'}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Користувачів не знайдено</p>
          )}
        </div>

        {/* Деталі користувача */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          {selectedUserId ? (
            <div>
              <h3 className="font-bold text-gray-900 mb-6">Інформація</h3>

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

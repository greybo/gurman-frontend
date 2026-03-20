// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import ThresholdSettings from './settings/ThresholdSettings';
import UsersManagement from './settings/UsersManagement';
import TelegramUsersSettings from './settings/TelegramUsersSettings';
import GeneralSettings from './settings/GeneralSettings';
import useThresholdSettings from '../hooks/useThresholdSettings';
import useUsersManagement from '../hooks/useUsersManagement';
import useTelegramUsers from '../hooks/useTelegramUsers';

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('scan-threshold');

  // Import all logic from custom hooks
  const thresholdSettings = useThresholdSettings();
  const usersManagement = useUsersManagement();
  const telegramUsers = useTelegramUsers();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Налаштування</h1>
        <p className="text-gray-600">Керуйте параметрами застосунку</p>
      </div>

      <div className="flex gap-6">
        <aside className="w-48">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
            <button
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeItem === 'scan-threshold'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveItem('scan-threshold')}
            >
              Встановити поріг сканування
            </button>
            <button
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeItem === 'users'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveItem('users')}
            >
              Користувачі
            </button>
            <button
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeItem === 'telegram-users'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveItem('telegram-users')}
            >
              Telegram Користувачі
            </button>
            <button
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeItem === 'general'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveItem('general')}
            >
              Загальні
            </button>
          </div>
        </aside>

        <main className="flex-1">
          {activeItem === 'scan-threshold' && (
            <ThresholdSettings {...thresholdSettings} />
          )}

          {activeItem === 'users' && (
            <UsersManagement {...usersManagement} />
          )}

          {activeItem === 'telegram-users' && (
            <TelegramUsersSettings {...telegramUsers} />
          )}

          {activeItem === 'general' && (
            <GeneralSettings />
          )}
        </main>
      </div>
    </div>
  );
}
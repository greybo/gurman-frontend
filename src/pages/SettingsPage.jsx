// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { SlidersHorizontal, Users, Send, Settings } from 'lucide-react';
import ThresholdSettings from './settings/ThresholdSettings';
import UsersManagement from './settings/UsersManagement';
import TelegramUsersSettings from './settings/TelegramUsersSettings';
import GeneralSettings from './settings/GeneralSettings';
import useThresholdSettings from '../hooks/useThresholdSettings';
import useUsersManagement from '../hooks/useUsersManagement';
import useTelegramUsers from '../hooks/useTelegramUsers';

const tabs = [
  { id: 'scan-threshold', label: 'Поріг сканування', icon: SlidersHorizontal },
  { id: 'users', label: 'Користувачі', icon: Users },
  { id: 'telegram-users', label: 'Telegram', icon: Send },
  { id: 'general', label: 'Загальні', icon: Settings },
];

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('scan-threshold');

  const thresholdSettings = useThresholdSettings();
  const usersManagement = useUsersManagement();
  const telegramUsers = useTelegramUsers();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Налаштування</h1>
        <p className="text-gray-500 text-sm">Керуйте параметрами застосунку</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 -mb-px">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveItem(id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeItem === id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
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
      </div>
    </div>
  );
}

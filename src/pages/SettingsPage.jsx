// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { SlidersHorizontal, ShieldCheck, Users, Send, Settings, MessageSquare, HardHat } from 'lucide-react';
import ThresholdSettings from './settings/ThresholdSettings';
import UsersManagement from './settings/UsersManagement';
import TelegramUsersSettings from './settings/TelegramUsersSettings';
import TelegramChatsSettings from './settings/TelegramChatsSettings';
import GeneralSettings from './settings/GeneralSettings';
import WorkersManagement from './settings/WorkersManagement';
import useThresholdSettings from '../hooks/useThresholdSettings';
import useUsersManagement from '../hooks/useUsersManagement';
import useTelegramUsers from '../hooks/useTelegramUsers';
import useTelegramChats from '../hooks/useTelegramChats';
import useWorkersManagement from '../hooks/useWorkersManagement';

const tabs = [
  { id: 'users', label: 'Admin', icon: ShieldCheck },
  { id: 'scan-threshold', label: 'Поріг сканування', icon: SlidersHorizontal },
  { id: 'telegram-users', label: 'Telegram', icon: Send },
  { id: 'telegram-chats', label: 'Чати', icon: MessageSquare },
  { id: 'workers', label: 'Робітники', icon: HardHat },
  { id: 'general', label: 'Загальні', icon: Settings },
];

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('users');

  const thresholdSettings = useThresholdSettings();
  const usersManagement = useUsersManagement();
  const telegramUsers = useTelegramUsers();
  const telegramChats = useTelegramChats();
  const workersManagement = useWorkersManagement();

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
              {id === 'telegram-chats' && telegramChats.totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                  {telegramChats.totalUnread}
                </span>
              )}
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
        {activeItem === 'telegram-chats' && (
          <TelegramChatsSettings {...telegramChats} />
        )}
        {activeItem === 'workers' && (
          <WorkersManagement {...workersManagement} />
        )}
        {activeItem === 'general' && (
          <GeneralSettings />
        )}
      </div>
    </div>
  );
}

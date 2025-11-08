// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import ThresholdSettings from './settings/ThresholdSettings';
import UsersManagement from './settings/UsersManagement';
import GeneralSettings from './settings/GeneralSettings';
import useThresholdSettings from '../hooks/useThresholdSettings';
import useUsersManagement from '../hooks/useUsersManagement';

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('scan-threshold');
  
  // Import all logic from custom hooks
  const thresholdSettings = useThresholdSettings();
  const usersManagement = useUsersManagement();

  return (
    <div className="page-container">
      <div className="settings-header">
        <h1 className="page-main-title">Налаштування</h1>
        <p className="page-subtitle">Керуйте параметрами застосунку</p>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="settings-menu">
            <button
              className={`settings-menu-item ${activeItem === 'scan-threshold' ? 'active' : ''}`}
              onClick={() => setActiveItem('scan-threshold')}
            >
              Встановити поріг сканування
            </button>
            <button
              className={`settings-menu-item ${activeItem === 'users' ? 'active' : ''}`}
              onClick={() => setActiveItem('users')}
            >
              Користувачі
            </button>
            <button
              className={`settings-menu-item ${activeItem === 'general' ? 'active' : ''}`}
              onClick={() => setActiveItem('general')}
            >
              Загальні
            </button>
          </div>
        </aside>

        <main className="settings-content">
          {activeItem === 'scan-threshold' && (
            <ThresholdSettings {...thresholdSettings} />
          )}

          {activeItem === 'users' && (
            <UsersManagement {...usersManagement} />
          )}

          {activeItem === 'general' && (
            <GeneralSettings />
          )}
        </main>
      </div>
    </div>
  );
}
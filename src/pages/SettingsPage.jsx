// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('scan-threshold');
  const [threshold, setThreshold] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('scan_threshold');
    if (saved !== null) setThreshold(saved);
  }, []);

  const saveThreshold = () => {
    localStorage.setItem('scan_threshold', threshold || '');
    alert('Поріг сканувань збережено');
  };

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
              Встановити поріг сканувань
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
            <div>
              <h2 className="content-title">Встановити поріг сканувань</h2>
              <p className="page-subtitle" style={{ marginBottom: 16 }}>
                Вкажіть числове значення порогу для сканувань
              </p>
              <div className="threshold-form">
                <input
                  type="number"
                  className="settings-input"
                  placeholder="Наприклад: 100"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                />
                <button className="btn-primary save-btn" onClick={saveThreshold}>
                  Зберегти
                </button>
              </div>
            </div>
          )}

          {activeItem === 'general' && (
            <div>
              <h2 className="content-title">Загальні налаштування</h2>
              <p className="page-subtitle">Тут будуть інші параметри</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

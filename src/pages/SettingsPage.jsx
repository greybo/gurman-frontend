// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { DB_PATH, usersTgDbPath } from '../PathDb';

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('scan-threshold');
  const [threshold, setThreshold] = useState('');
  const [message, setMessage] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usersTg, setUsersTg] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});

  useEffect(() => {
    // Реальний читання з Firebase Realtime Database
    const r = ref(database, DB_PATH);
    const unsub = onValue(r, (snap) => {
      const val = snap.val();
      if (val) {
        setThreshold(val.threshold ?? '');
        setMessage(val.message ?? '');
        setUpdateDate(val.updateDate ?? '');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const usersRef = ref(database, `${usersTgDbPath}/`);
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsersTg(data);
        console.info('Користувачі:', Object.entries(data).map(([key, user]) => '#' + key + ', name: ' + (user.name || 'n/a')).join(', '));
      } else {
        setUsersTg({});
        setError('Користувачів не знайдено');
      }
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setError('Помилка завантаження даних');
    }, { onlyOnce: true });
  }, []);

  const formatNow = () => {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleUserSelect = (chatId) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [chatId]: !prev[chatId]
    }));
  };

  const handleUserCheckBox = (chatId, field, checked) => {
    setUsersTg(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: checked
      }
    }));

    update(ref(database, `${usersTgDbPath}/${chatId}`), {
      [field]: checked,
      chatId: chatId
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    setError('');
    try {
      const data = {
        threshold: Number(threshold) || 0,
        updateDate: formatNow(),
        message: message || ''
      };
      await set(ref(database, DB_PATH), data);
      setUpdateDate(data.updateDate);
      alert('Налаштування збережено');
    } catch (e) {
      console.error(e);
      setError('Помилка збереження до Firebase');
    } finally {
      setSaving(false);
    }
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
              <p className="page-subtitle settings-subtitle-margin">
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
                <input
                  type="text"
                  className="settings-input settings-input-message"
                  placeholder="Текст повідомлення"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="btn-primary save-btn" onClick={saveSettings} disabled={saving}>
                  {saving ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
              {error && (
                <div className="error-message settings-error-margin">{error}</div>
              )}
              {updateDate && (
                <div className="data-info settings-update-info-margin">
                  Останнє оновлення: {updateDate}
                </div>
              )}

              <div className="users-list-container">
                <h3 className="content-title">Користувачі Telegram</h3>
                <div className="users-list-title-container">
                  {typeof usersTg === 'object' && Object.keys(usersTg).length > 0 ? (
                    <div className="users-list">
                      {Object.entries(usersTg).map(([key, user]) => (
                        <div
                          key={key}
                          className={`user-item ${user.scanThreshold === true ? 'selected' : ''}`}
                        // onClick={() => handleUserSelect(key)}
                        >{console.log('Rendering user item for chat ID:', user)}
                          <input
                            type="checkbox"
                            checked={user.scanThreshold === true}
                            onChange={(e) => handleUserCheckBox(key, 'scanThreshold', e.target.checked)}
                          />
                          <div className="user-item-content">
                            <span><strong>Chat ID:</strong> {key}</span>
                            <span><strong>Ім'я:</strong> {user.name || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="users-empty">Користувачів не знайдено</p>
                  )}
                </div>
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
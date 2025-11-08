// src/pages/SettingsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { DB_PATH, usersTgDbPath, usersDbPath } from '../PathDb';
import {
  Users, Hash, CheckCircle, AlertTriangle, Save, RefreshCw,
  Mail, FileText, Package, Boxes, SearchCode, UserCheck, ChevronDown
} from 'lucide-react';

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('scan-threshold');
  
  // Settings state
  const [threshold, setThreshold] = useState('');
  const [message, setMessage] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usersTg, setUsersTg] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});

  // Users page state
  const [users, setUsers] = useState({});
  const [currentUsersTg, setCurrentUsersTg] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [backupUser, setBackupUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersError, setUsersError] = useState('');

  const dropdownRef = useRef(null);

  // ===== SETTINGS EFFECTS =====
  useEffect(() => {
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

  // ===== USERS PAGE EFFECTS =====
  const fetchUsers = () => {
    setLoading(true);
    setUsersError('');
    const usersRef = ref(database, usersDbPath);

    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsers(data);
      } else {
        setUsers({});
        setUsersError('Користувачів не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setUsersError('Помилка завантаження даних');
      setLoading(false);
    }, { onlyOnce: true });
  };

  useEffect(() => {
    if (activeItem === 'users') {
      fetchUsers();
    }
  }, [activeItem]);

  useEffect(() => {
    const chatId = users[selectedUserId]?.chatId;
    setSearchTerm(chatId || '');
    if (!selectedUserId) return;
    const usersRef = ref(database, `${usersTgDbPath}/`);
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsersTg(data);
        const tg = data[chatId] || {};
        setCurrentUsersTg(tg);

        if (tg) {
          setBackupUser((user) => ({
            ...user,
            overScan: tg?.overScan || false,
            sendErrorMessage: tg?.sendErrorMessage || false,
          }));
        }

      } else {
        setUsersTg({});
        setUsersError('Користувачів не знайдено');
      }
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setUsersError('Помилка завантаження даних');
    }, { onlyOnce: true });
  }, [selectedUserId]);

  useEffect(() => {
    if (!users || !selectedUserId) return

    const user = users[selectedUserId] || null;
    setBackupUser(user);

  }, [selectedUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== SETTINGS HANDLERS =====
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

  // ===== USERS PAGE HANDLERS =====
  const handleInputChange = (userId, field, value) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [userId]: {
        ...prevUsers[userId],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (chatId, field, checked) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: checked
      }
    }));
  };

  const handleSelectChatId = (chatId) => {
    setSearchTerm(chatId || '');
    setShowDropdown(false);
  };

  const handleSaveUser = async () => {
    if (!selectedUserId) return;

    setIsSaving(true);

    const userToSave = users[selectedUserId];

    const userRef = ref(database, `${usersDbPath}/${selectedUserId}`);
    console.info('Check id:', searchTerm);
    handleInputChange(selectedUserId, 'chatId', searchTerm || 0);
    try {
      await update(userRef, {
        chatId: searchTerm || 0,
        userId: userToSave.userId || '',
        email: userToSave.email || '',
        name: userToSave.name || '',
        overScan: userToSave.overScan || false,
        sendErrorMessage: userToSave.sendErrorMessage || false,
        invoice: userToSave.invoice || false,
        orderAll: userToSave.orderAll || false,
        volumeAndParams: userToSave.volumeAndParams || false,
        searchCode: userToSave.searchCode || false,
      });
    } catch (err) {
      console.error('Помилка збереження:', err);
      alert(`Помилка збереження для ${selectedUserId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsersTg = Object.entries(usersTg).filter(([chatId, user]) => {
    const searchLower = searchTerm?.toLowerCase() || '';
    return chatId.includes(searchLower) || (user.name || '').toLowerCase().includes(searchLower);
  });

  const selectedUser = users[selectedUserId] || {};

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
            <div>
              <h2 className="content-title">Встановити поріг сканування</h2>
              <p className="page-subtitle settings-subtitle-margin">
                Вкажіть числове значення порогу для сканування
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
                        >
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

          {activeItem === 'users' && (
            <div className="users-management-container">
              <h2 className="content-title">Керування користувачами</h2>
              <p className="page-subtitle settings-subtitle-margin">Редагуйте дозволи та налаштування користувачів</p>

              {usersError && (
                <div className="error-message" style={{ marginBottom: '20px' }}>
                  {usersError}
                </div>
              )}

              <div className="users-management-grid">
                {/* Список користувачів */}
                <div className="users-list-panel">
                  <h3>Користувачі</h3>
                  {loading ? (
                    <div className="users-loading">
                      <RefreshCw size={20} />
                      <p>Завантаження...</p>
                    </div>
                  ) : Object.keys(users).length > 0 ? (
                    <div className="users-list-flex">
                      {Object.entries(users).map(([userId, user]) => (
                        <button
                          key={userId}
                          onClick={() => setSelectedUserId(userId)}
                          className={`user-list-button ${selectedUserId === userId ? 'active' : ''}`}
                        >
                          <div className="user-list-item-name">{user.name || 'N/A'}</div>
                          <div className="user-list-item-email">{user.email || 'N/A'}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="users-empty-message">Користувачів не знайдено</p>
                  )}
                </div>

                {/* Редагування користувача */}
                <div className="users-edit-panel">
                  {selectedUserId ? (
                    <div className="users-edit-content">
                      <div className="users-edit-header">
                        <h3>Редагування</h3>
                        <button
                          onClick={handleSaveUser}
                          disabled={isSaving}
                          className="users-save-button"
                        >
                          <Save size={16} />
                          {isSaving ? 'Збереження...' : 'Зберегти'}
                        </button>
                      </div>

                      {/* Базова інформація */}
                      <div className="users-form-section">
                        <h4 className="users-form-section-title">Базова інформація</h4>
                        <div className="users-form-group">
                          <label className="users-form-label">
                            <Mail size={14} />
                            Email
                          </label>
                          <input
                            type="email"
                            className="users-form-input"
                            value={selectedUser.email || ''}
                            onChange={(e) => handleInputChange(selectedUserId, 'email', e.target.value)}
                            placeholder="user@example.com"
                            disabled
                          />
                        </div>

                        <div className="users-form-group">
                          <label className="users-form-label">
                            <Users size={14} />
                            Ім'я
                          </label>
                          <input
                            type="text"
                            className="users-form-input"
                            value={selectedUser.name || ''}
                            onChange={(e) => handleInputChange(selectedUserId, 'name', e.target.value)}
                            placeholder="Ім'я користувача"
                            disabled
                          />
                        </div>

                        <div className="users-form-group">
                          <label className="users-form-label">
                            <Hash size={14} />
                            Chat ID (Telegram)
                          </label>
                          <div className="users-form-input-wrapper" ref={dropdownRef}>
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
                              className="users-form-input"
                              disabled={backupUser?.chatId}
                            />
                            {!backupUser?.chatId && (
                              <button
                                className="users-dropdown-toggle"
                                onClick={() => !backupUser?.chatId && setShowDropdown(!showDropdown)}
                                type="button"
                              >
                                {/* <ChevronDown size={18} /> */}
                              </button>
                            )}

                            {showDropdown && !backupUser?.chatId && (
                              <div className="users-dropdown-menu">
                                {filteredUsersTg.length > 0 ? (
                                  filteredUsersTg.map(([chatId, user]) => (
                                    <div
                                      key={chatId}
                                      onClick={() => handleSelectChatId(chatId)}
                                      className="users-dropdown-item"
                                    >
                                      <div className="users-dropdown-item-id">
                                        <Hash size={12} />
                                        {chatId}
                                      </div>
                                      <div className="users-dropdown-item-name">
                                        <Users size={11} />
                                        {user.name || 'Без імені'}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="users-dropdown-empty">
                                    Не знайдено
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Чекбокси дозволів */}
                      <div>
                        <h4 className="users-form-section-title">Дозволи</h4>
                        <div className="users-permissions-grid">
                          <label className="users-permission-label">
                            <input
                              type="checkbox"
                              checked={!!selectedUser.overScan}
                              onChange={(e) => handleCheckboxChange(selectedUserId, 'overScan', e.target.checked)}
                              disabled={!currentUsersTg?.chatId}
                            />
                            <CheckCircle size={16} />
                            Перевищення сканування
                          </label>

                          <label className="users-permission-label">
                            <input
                              type="checkbox"
                              checked={!!selectedUser.sendErrorMessage}
                              onChange={(e) => handleCheckboxChange(selectedUserId, 'sendErrorMessage', e.target.checked)}
                              disabled={!currentUsersTg?.chatId}
                            />
                            <AlertTriangle size={16} />
                            Повідомляти про помилки
                          </label>

                          <label className="users-permission-label">
                            <input
                              type="checkbox"
                              checked={!!selectedUser.invoice}
                              onChange={(e) => handleCheckboxChange(selectedUserId, 'invoice', e.target.checked)}
                            />
                            <FileText size={16} />
                            Накладна
                          </label>

                          <label className="users-permission-label">
                            <input
                              type="checkbox"
                              checked={!!selectedUser.orderAll}
                              onChange={(e) => handleCheckboxChange(selectedUserId, 'orderAll', e.target.checked)}
                            />
                            <Package size={16} />
                            Замовленя
                          </label>

                          <label className="users-permission-label">
                            <input
                              type="checkbox"
                              checked={!!selectedUser.volumeAndParams}
                              onChange={(e) => handleCheckboxChange(selectedUserId, 'volumeAndParams', e.target.checked)}
                            />
                            <Boxes size={16} />
                            Об'єми та Розміщення
                          </label>

                          <label className="users-permission-label">
                            <input
                              type="checkbox"
                              checked={!!selectedUser.searchCode}
                              onChange={(e) => handleCheckboxChange(selectedUserId, 'searchCode', e.target.checked)}
                            />
                            <SearchCode size={16} />
                            Пошук коду
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="users-edit-placeholder">
                      Виберіть користувача зі списку
                    </div>
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
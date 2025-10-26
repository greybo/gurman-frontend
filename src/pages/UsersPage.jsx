// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
// Додаємо 'update' для оновлення даних
import { ref, onValue, update } from 'firebase/database';
import { Users, Hash, CheckCircle, AlertTriangle, Save, RefreshCw } from 'lucide-react';

// Використовуємо той самий префікс, що й в AnalyticsPage
const prefixPath = import.meta.env.VITE_FIREBASE_DB_PREFIX || 'release';

export default function UsersPage() {
  // Змінюємо стан на об'єкт, щоб легше оновлювати
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Стан для відстеження збереження по кожному рядку
  const [isSaving, setIsSaving] = useState({});

  const fetchUsers = () => {
    setLoading(true);
    setError('');
    const usersRef = ref(database, `${prefixPath}/tg_user_db`);
    
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsers(data);
      } else {
        setUsers({});
        setError('Користувачів не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    }, { onlyOnce: true }); // Завантажуємо дані один раз
  };

  // Завантажуємо користувачів при першому рендері
  useEffect(() => {
    fetchUsers();
  }, []);

  // Обробник для оновлення полів вводу в локальному стані
  const handleInputChange = (chatId, field, value) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: value
      }
    }));
  };

  // Обробник для оновлення чекбоксів в локальному стані
  const handleCheckboxChange = (chatId, field, checked) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: checked
      }
    }));
  };

  // Функція збереження змін в Firebase
  const handleSave = async (chatId) => {
    setIsSaving(prev => ({ ...prev, [chatId]: true }));
    
    const userToSave = users[chatId];
    // Створюємо посилання на конкретного користувача
    const userRef = ref(database, `${prefixPath}/tg_user_db/${chatId}`);
    
    try {
      // Оновлюємо тільки ті поля, які ми редагуємо
      await update(userRef, {
        name: userToSave.name || 'n/a',
        addedToList: userToSave.addedToList || false,
        sendErrorMessage: userToSave.sendErrorMessage || false
      });
      // Можна додати сповіщення про успіх
    } catch (err) {
      console.error('Помилка збереження:', err);
      alert(`Помилка збереження для ${chatId}`);
    } finally {
      setIsSaving(prev => ({ ...prev, [chatId]: false }));
    }
  };

  // Отримуємо список користувачів з об'єкта
  const usersList = Object.entries(users);

  return (
    <div className="page-container">
      <div className="analytics-header">
        <div className="analytics-title-section">
          <Users size={32} className="analytics-icon" />
          <div>
            <h1 className="analytics-title">Керування TG користувачами</h1>
            <p className="analytics-subtitle">Список користувачів з `release/tg_user_db`</p>
          </div>
        </div>
        <button onClick={fetchUsers} className="refresh-button" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Оновити список
        </button>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{usersList.length}</div>
          <div className="stat-label">Всього користувачів</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{usersList.filter(([, u]) => u.addedToList).length}</div>
          <div className="stat-label">Added To List</div>
        </div>
        <div className="stat-card error">
          <div className="stat-value">{usersList.filter(([, u]) => u.sendErrorMessage).length}</div>
          <div className="stat-label">Send Error</div>
        </div>
      </div>

      <div className="data-card">
        <div className="data-header">
          <h2 className="data-title">
            Список користувачів ({usersList.length})
          </h2>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Завантаження користувачів...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ margin: 0 }}>{error}</div>
        )}

        {!loading && !error && usersList.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Hash size={16} /> Chat ID</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Name</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} /> Added to List</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /> Send Error Msg</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Save size={16} /> Дії</div></th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(([chatId, user]) => (
                  <tr key={chatId}>
                    {/* Chat ID */}
                    <td>{user.chatId}</td>
                    
                    {/* Name (Input) */}
                    <td>
                      <input
                        type="text"
                        value={user.name || ''}
                        onChange={(e) => handleInputChange(chatId, 'name', e.target.value)}
                        placeholder="n/a"
                        // Використовуємо існуючий клас, але з меншим padding
                        className="form-input"
                        style={{ padding: '8px 12px', fontSize: '14px', minWidth: '150px' }}
                      />
                    </td>
                    
                    {/* Added to List (Checkbox) */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!user.addedToList} // Переконуємось, що значення boolean
                        onChange={(e) => handleCheckboxChange(chatId, 'addedToList', e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </td>
                    
                    {/* Send Error Msg (Checkbox) */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!user.sendErrorMessage} // Переконуємось, що значення boolean
                        onChange={(e) => handleCheckboxChange(chatId, 'sendErrorMessage', e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </td>
                    
                    {/* Save Button */}
                    <td>
                      <button
                        onClick={() => handleSave(chatId)}
                        // Використовуємо існуючий стиль кнопки, але робимо її зеленою
                        className="backend-upload-button"
                        style={{ padding: '8px 16px', fontSize: '13px', margin: 0, boxShadow: 'none' }}
                        disabled={isSaving[chatId]}
                      >
                        {isSaving[chatId] ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        {isSaving[chatId] ? '...' : 'Зберегти'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && usersList.length === 0 && !error && (
          <div className="no-results">
            Дані відсутні в базі.
          </div>
        )}
      </div>
    </div>
  );
}
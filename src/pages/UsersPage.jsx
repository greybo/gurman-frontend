// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { Users, Hash, CheckCircle, MessageSquare, AlertTriangle, Calendar } from 'lucide-react';

// Використовуємо той самий префікс, що й в AnalyticsPage
const prefixPath = import.meta.env.VITE_FIREBASE_DB_PREFIX || 'release';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    // Встановлюємо шлях до бази даних
    const usersRef = ref(database, `${prefixPath}/tg_user_db`);
    
    // onValue підписується на зміни
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Перетворюємо об'єкт користувачів в масив
        const usersArray = Object.values(data);
        setUsers(usersArray);
        setError('');
      } else {
        setUsers([]);
        setError('Користувачів не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    });

    // Повертаємо функцію відписки, щоб уникнути витоків пам'яті
    return () => unsubscribe();
  }, []); // Порожній масив залежностей для запуску один раз

  const formatDate = (timestamp) => {
    if (!timestamp) return 'n/a';
    // 'date' в моделі = 0, що є 1970 рік.
    return new Date(timestamp * 1000).toLocaleString('uk-UA');
  };

  return (
    <div className="page-container">
      {/* Використовуємо існуючий стиль хедера з AnalyticsPage */}
      <div className="analytics-header">
        <div className="analytics-title-section">
          <Users size={32} className="analytics-icon" />
          <div>
            <h1 className="analytics-title">Керування TG користувачами</h1>
            <p className="analytics-subtitle">Список користувачів з `release/tg_user_db`</p>
          </div>
        </div>
      </div>

      {/* Використовуємо існуючі картки статистики */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Всього користувачів</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{users.filter(u => u.addedToList).length}</div>
          <div className="stat-label">Added To List</div>
        </div>
        <div className="stat-card error">
          <div className="stat-value">{users.filter(u => u.sendErrorMessage).length}</div>
          <div className="stat-label">Send Error</div>
        </div>
      </div>

      {/* Використовуємо існуючий стиль картки даних */}
      <div className="data-card">
        <div className="data-header">
          <h2 className="data-title">
            Список користувачів ({users.length})
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

        {!loading && !error && users.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {/* Додаємо inline-flex для вирівнювання іконок */}
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Hash size={16} /> Chat ID</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Name</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} /> Added to List</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /> Send Error Msg</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={16} /> Last Text</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Date</div></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.chatId}>
                    <td>{user.chatId}</td>
                    <td>{user.name || 'n/a'}</td>
                    <td>{user.addedToList ? 'Так' : 'Ні'}</td>
                    <td>{user.sendErrorMessage ? 'Так' : 'Ні'}</td>
                    <td title={user.text || ''}>
                      {user.text || 'n/a'}
                    </td>
                    <td>{formatDate(user.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && users.length === 0 && !error && (
          <div className="no-results">
            Дані відсутні в базі.
          </div>
        )}
      </div>
    </div>
  );
}
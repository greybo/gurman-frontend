// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { RotateCw, ChevronDown } from 'lucide-react';
import { database } from '../firebase'; // Переконайтеся, що шлях до firebase правильний
import { ref, onValue, off } from 'firebase/database';

export default function HomePage() {
  const [loggingData, setLoggingData] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Завантаження даних з Firebase Realtime Database
  useEffect(() => {
    setLoading(true);
    setError('');

    try {
      // Шлях до даних в Firebase, як ви і вказали
      const loggingRef = ref(database, 'logging_db/2025/10/22');
      
      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setLoggingData(data);
          // Автоматично вибираємо перший ключ зі списку
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            setSelectedKey(firstKey);
          }
        } else {
          setLoggingData({});
          setSelectedKey(null);
        }
        setLoading(false);
      };

      const handleError = (error) => {
        console.error('Помилка завантаження:', error);
        setError('Помилка завантаження даних з бази');
        setLoading(false);
      };

      // Підписка на оновлення даних
      // const unsubscribe = 
      onValue(loggingRef, handleData, handleError);

      // Очищення підписки при демонтуванні компонента
      return () => off(loggingRef, 'value', handleData);
    } catch (err) {
      console.error('Помилка:', err);
      setError('Помилка з\'єднання з базою даних');
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    const loggingRef = ref(database, 'logging_db/2025/10/22');
    onValue(loggingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLoggingData(data);
        // Оновлюємо вибір, якщо поточний ключ ще існує
        if (!data[selectedKey]) {
          const firstKey = Object.keys(data)[0];
          setSelectedKey(firstKey || null);
        }
      } else {
        setLoggingData({});
        setSelectedKey(null);
      }
      setLoading(false);
    }, { onlyOnce: true }); // Оновлення один раз при натисканні
  };

  const selectedData = selectedKey ? loggingData[selectedKey] : null;

  // Функція для форматування значень для відображення
  const formatValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="page-container">
      <div className="logging-page-layout">
        {/* Sidebar з логами */}
        <div className="logging-sidebar-full">
          <div className="sidebar-header-logging">
            <h3 className="sidebar-title-logging">Логи 22.10.2025</h3>
            <button 
              onClick={handleRefresh}
              className="refresh-icon-button"
              title="Оновити"
              disabled={loading}
            >
              <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {error && <div className="error-message-sidebar">{error}</div>}

          {loading ? (
            <div className="sidebar-loading-logging">
              <div className="spinner"></div>
              <p>Завантаження...</p>
            </div>
          ) : Object.keys(loggingData).length === 0 ? (
            <div className="empty-sidebar-logging">
              <p>Немає даних</p>
            </div>
          ) : (
            <div className="logging-items-full">
              {Object.entries(loggingData).map(([key, value]) => (
                <div
                  key={key}
                  className={`logging-item-full ${selectedKey === key ? 'active' : ''}`}
                  onClick={() => setSelectedKey(key)}
                >
                  <div className="logging-item-content-full">
                    <div className="logging-item-header">
                      <p className="logging-item-title-full">{key}</p>
                      {value.actionName && (
                        <span className="logging-action-badge">{value.actionName}</span>
                      )}
                    </div>
                    {value.userId && (
                      <p className="logging-item-meta-full">{value.userId}</p>
                    )}
                  </div>
                  <ChevronDown size={16} className="logging-item-icon-full" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content - Деталі вибраного логу */}
        <div className="logging-content-full">
          {loading && !selectedData ? (
             <div className="content-loading-logging">
                <div className="spinner"></div>
             </div>
          ) : !selectedData ? (
            <div className="empty-content-logging">
              <p>Виберіть лог для перегляду деталей</p>
            </div>
          ) : (
            <div className="logging-details-full">
              <div className="details-header">
                <h2 className="details-title-full">Log ID: {selectedKey}</h2>
              </div>

              <div className="details-grid">
                {Object.entries(selectedData).map(([key, value]) => (
                  <div key={key} className="detail-card">
                    <div className="detail-card-header">
                      <span className="detail-card-key">{key}</span>
                    </div>
                    <div className="detail-card-body">
                      {typeof value === 'object' && value !== null ? (
                        <pre className="detail-card-value">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <p className="detail-card-value">{formatValue(value)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
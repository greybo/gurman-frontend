// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { RotateCw, ChevronDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { database } from '../firebase';
import { ref, onValue, off } from 'firebase/database';

export default function HomePage() {
  const [loggingData, setLoggingData] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Навігація по датах
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedDay, setSelectedDay] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [loadingDays, setLoadingDays] = useState(false);

  // Завантаження доступних місяців
  useEffect(() => {
    setLoadingMonths(true);
    const yearRef = ref(database, `release/logging_db/${selectedYear}`);
    
    onValue(yearRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const months = Object.keys(data).map(Number).sort((a, b) => b - a);
        setAvailableMonths(months);
        
        // Автоматично вибираємо останній місяць
        if (months.length > 0 && !selectedMonth) {
          setSelectedMonth(months[0]);
        }
      } else {
        setAvailableMonths([]);
      }
      setLoadingMonths(false);
    }, { onlyOnce: true });
  }, [selectedYear]);

  // Завантаження доступних днів
  useEffect(() => {
    if (!selectedMonth) return;
    
    setLoadingDays(true);
    const monthRef = ref(database, `release/logging_db/${selectedYear}/${selectedMonth}`);
    
    onValue(monthRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const days = Object.keys(data).map(Number).sort((a, b) => b - a);
        setAvailableDays(days);
        
        // Автоматично вибираємо останній день
        if (days.length > 0) {
          setSelectedDay(days[0]);
        }
      } else {
        setAvailableDays([]);
        setSelectedDay(null);
      }
      setLoadingDays(false);
    }, { onlyOnce: true });
  }, [selectedYear, selectedMonth]);

  // Завантаження даних за вибраний день
  useEffect(() => {
    if (!selectedDay) {
      setLoggingData({});
      setSelectedKey(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dayRef = ref(database, `release/logging_db/${selectedYear}/${selectedMonth}/${selectedDay}`);
      
      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setLoggingData(data);
          
          // Автоматично вибираємо перший ключ
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

      onValue(dayRef, handleData, handleError);

      return () => off(dayRef, 'value', handleData);
    } catch (err) {
      console.error('Помилка:', err);
      setError('Помилка з\'єднання з базою даних');
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  const handleRefresh = () => {
    if (!selectedDay) return;
    
    setLoading(true);
    const dayRef = ref(database, `release/logging_db/${selectedYear}/${selectedMonth}/${selectedDay}`);
    
    onValue(dayRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLoggingData(data);
        
        if (!data[selectedKey]) {
          const firstKey = Object.keys(data)[0];
          setSelectedKey(firstKey || null);
        }
      } else {
        setLoggingData({});
        setSelectedKey(null);
      }
      setLoading(false);
    }, { onlyOnce: true });
  };

  const selectedData = selectedKey ? loggingData[selectedKey] : null;

  const formatValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  return (
    <div className="page-container">
      {/* Date Navigation */}
      <div className="date-navigation">
        <div className="date-nav-header">
          <CalendarIcon size={24} className="date-nav-icon" />
          <h2 className="date-nav-title">Вибір дати</h2>
        </div>

        <div className="date-selectors">
          {/* Year Selector */}
          <div className="date-selector-group">
            <label className="date-label">Рік:</label>
            <div className="year-selector">
              <button 
                onClick={() => setSelectedYear(selectedYear - 1)}
                className="year-nav-button"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="year-display">{selectedYear}</span>
              <button 
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="year-nav-button"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Month Selector */}
          <div className="date-selector-group">
            <label className="date-label">Місяць:</label>
            {loadingMonths ? (
              <div className="selector-loading">Завантаження...</div>
            ) : (
              <div className="month-grid">
                {availableMonths.map((month) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`month-button ${selectedMonth === month ? 'active' : ''}`}
                  >
                    {monthNames[month - 1]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Day Selector */}
          <div className="date-selector-group">
            <label className="date-label">День:</label>
            {loadingDays ? (
              <div className="selector-loading">Завантаження...</div>
            ) : (
              <div className="day-grid">
                {availableDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`day-button ${selectedDay === day ? 'active' : ''}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedDay && (
          <div className="selected-date-display">
            <CalendarIcon size={16} />
            <span>
              Обрана дата: {selectedDay} {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
          </div>
        )}
      </div>

      {/* Logging Data */}
      {selectedDay && (
        <div className="logging-page-layout">
          {/* Sidebar з логами */}
          <div className="logging-sidebar-full">
            <div className="sidebar-header-logging">
              <h3 className="sidebar-title-logging">
                Логи {selectedDay}.{selectedMonth}.{selectedYear}
              </h3>
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
                <p>Немає даних за цей день</p>
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
      )}

      {!selectedDay && (
        <div className="empty-content-logging" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Виберіть дату для перегляду логів</p>
        </div>
      )}
    </div>
  );
}
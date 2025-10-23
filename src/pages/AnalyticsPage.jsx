// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, Calendar as CalendarIcon, User, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedDay, setSelectedDay] = useState(22);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  
  const [loggingData, setLoggingData] = useState({});
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Завантаження місяців та днів
  useEffect(() => {
    const yearRef = ref(database, `release/logging_db/${selectedYear}`);
    onValue(yearRef, (snapshot) => {
      if (snapshot.exists()) {
        const months = Object.keys(snapshot.val()).map(Number).sort((a, b) => b - a);
        setAvailableMonths(months);
      }
    }, { onlyOnce: true });
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedMonth) return;
    const monthRef = ref(database, `release/logging_db/${selectedYear}/${selectedMonth}`);
    onValue(monthRef, (snapshot) => {
      if (snapshot.exists()) {
        const days = Object.keys(snapshot.val()).map(Number).sort((a, b) => b - a);
        setAvailableDays(days);
      }
    }, { onlyOnce: true });
  }, [selectedYear, selectedMonth]);

  // Завантаження даних
  useEffect(() => {
    if (!selectedDay) return;

    setLoading(true);
    const dayRef = ref(database, `release/logging_db/${selectedYear}/${selectedMonth}/${selectedDay}`);
    
    onValue(dayRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLoggingData(data);
        
        // Витягуємо унікальних користувачів
        const uniqueUsers = [...new Set(Object.values(data).map(item => item.userId))].filter(Boolean);
        setUsers(uniqueUsers);
        
        // Витягуємо унікальні дії
        const uniqueActions = [...new Set(Object.values(data).map(item => item.actionName))].filter(Boolean);
        setActions(uniqueActions);
      }
      setLoading(false);
    }, { onlyOnce: true });
  }, [selectedYear, selectedMonth, selectedDay]);

  // Обробка даних для графіка
  useEffect(() => {
    if (Object.keys(loggingData).length === 0) {
      setChartData([]);
      return;
    }

    // Фільтруємо дані
    let filteredData = Object.entries(loggingData).map(([logId, data]) => ({
      logId,
      ...data
    }));

    if (selectedUser !== 'all') {
      filteredData = filteredData.filter(item => item.userId === selectedUser);
    }

    if (selectedAction !== 'all') {
      filteredData = filteredData.filter(item => item.actionName === selectedAction);
    }

    // Парсимо час з logId (формат: HHMMSS)
    const parseTime = (logId) => {
      const timeStr = logId.slice(0, 6); // Беремо перші 6 символів
      const hours = parseInt(timeStr.slice(0, 2), 10);
      const minutes = parseInt(timeStr.slice(2, 4), 10);
      return { hours, minutes, timeStr };
    };

    // Групуємо по годинах
    const hourlyData = {};
    
    filteredData.forEach(item => {
      const { hours } = parseTime(item.logId);
      const hourKey = `${hours.toString().padStart(2, '0')}:00`;
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = {
          hour: hourKey,
          successCount: 0,
          failCount: 0,
          total: 0
        };
      }
      
      hourlyData[hourKey].total += 1;
      
      if (item.scan?.success === true || item.scan?.success === 'true') {
        hourlyData[hourKey].successCount += 1;
      } else if (item.scan?.success === false || item.scan?.success === 'false') {
        hourlyData[hourKey].failCount += 1;
      }
    });

    // Конвертуємо в масив і сортуємо
    const chartArray = Object.values(hourlyData).sort((a, b) => 
      a.hour.localeCompare(b.hour)
    );

    setChartData(chartArray);
  }, [loggingData, selectedUser, selectedAction]);

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  return (
    <div className="page-container">
      <div className="analytics-header">
        <div className="analytics-title-section">
          <BarChart2 size={32} className="analytics-icon" />
          <div>
            <h1 className="analytics-title">Аналітика логів</h1>
            <p className="analytics-subtitle">Візуалізація даних по користувачам та діям</p>
          </div>
        </div>
      </div>

      {/* Вибір дати */}
      <div className="analytics-date-card">
        <div className="date-card-header">
          <CalendarIcon size={20} />
          <h3>Вибір періоду</h3>
        </div>
        <div className="date-card-body">
          <div className="date-row">
            <div className="date-field">
              <label>Місяць:</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="date-select"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {monthNames[month - 1]}
                  </option>
                ))}
              </select>
            </div>
            <div className="date-field">
              <label>День:</label>
              <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="date-select"
              >
                {availableDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Фільтри */}
      <div className="analytics-filters-card">
        <div className="filters-header">
          <h3>Фільтри</h3>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">
              <User size={18} />
              Користувач
            </label>
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              className="filter-select"
            >
              <option value="all">Всі користувачі</option>
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <Activity size={18} />
              Дія
            </label>
            <select 
              value={selectedAction} 
              onChange={(e) => setSelectedAction(e.target.value)}
              className="filter-select"
            >
              <option value="all">Всі дії</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-value">{chartData.reduce((sum, item) => sum + item.successCount, 0)}</div>
          <div className="stat-label">Успішних</div>
        </div>
        <div className="stat-card error">
          <div className="stat-value">{chartData.reduce((sum, item) => sum + item.failCount, 0)}</div>
          <div className="stat-label">Помилок</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{chartData.reduce((sum, item) => sum + item.total, 0)}</div>
          <div className="stat-label">Всього</div>
        </div>
      </div>

      {/* График */}
      <div className="chart-card">
        <div className="chart-header">
          <h3>Графік активності по годинах</h3>
          <div className="chart-legend-custom">
            <div className="legend-item">
              <span className="legend-dot success"></span>
              <span>Успішні</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot error"></span>
              <span>Помилки</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="chart-loading">
            <div className="spinner"></div>
            <p>Завантаження даних...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="chart-empty">
            <p>Немає даних для відображення</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="successCount" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Успішні"
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="failCount" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Помилки"
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
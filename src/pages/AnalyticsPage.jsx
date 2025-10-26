// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, Calendar as CalendarIcon, User, Activity, ShoppingCart } from 'lucide-react';

const prefixPath = import.meta.env.VITE_FIREBASE_DB_PREFIX || 'release';

export default function AnalyticsPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);

  const [loggingData, setLoggingData] = useState({});
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedAction, setSelectedAction] = useState('OrderPackaging');
  const [timeInterval, setTimeInterval] = useState(60);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [allOrdersData, setAllOrdersData] = useState([]);
  const [paramsData, setAllParamsData] = useState({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  // Зберігаємо кількість сканів тільки зі статусів замовлень
  const [scansFromOrders, setScansFromOrders] = useState(0);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalWeight: '0',
    totalVolume: '0',
    byStatus: [
      { id: 2, name: 'Підтверджено', count: 0, productsCount: 0, color: '#ffea00ff', bgColor: '#fffbeb' },
      { id: 3, name: 'На відправку', count: 0, productsCount: 0, color: '#FF9800', bgColor: '#fffbeb' },
      { id: 13, name: 'Комплектується', count: 0, productsCount: 0, color: '#057CB1', bgColor: '#faf5ff' },
      { id: 11, name: 'Зібрано', count: 0, productsCount: 0, color: '#FF9494', bgColor: '#fffafcff' },
      { id: 24, name: 'Передано кур\'єру', count: 0, productsCount: 0, color: '#003E02', bgColor: '#cee7cfff' }
    ]
  });

  useEffect(() => {
    const yearRef = ref(database, `${prefixPath}/logging_db/Scanning/${selectedYear}`);
    onValue(yearRef, (snapshot) => {
      if (snapshot.exists()) {
        const months = Object.keys(snapshot.val()).map(Number).sort((a, b) => b - a);
        setAvailableMonths(months);
        if (months.length > 0 && !months.includes(selectedMonth)) {
          setSelectedMonth(months[0]);
        }
      }
    }, { onlyOnce: true });
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedMonth) return;
    const monthRef = ref(database, `${prefixPath}/logging_db/Scanning/${selectedYear}/${selectedMonth}`);
    onValue(monthRef, (snapshot) => {
      if (snapshot.exists()) {
        const days = Object.keys(snapshot.val()).map(Number).sort((a, b) => b - a);
        setAvailableDays(days);
        if (days.length > 0 && !days.includes(selectedDay)) {
          setSelectedDay(days[0]);
        }
      }
    }, { onlyOnce: true });
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (!selectedDay || availableDays.length === 0) return;
    setLoading(true);
    const dayRef = ref(database, `${prefixPath}/logging_db/Scanning/${selectedYear}/${selectedMonth}/${selectedDay}`);
    onValue(dayRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLoggingData(data);
        setUsers([...new Set(Object.values(data).map(item => item.userId))].filter(Boolean));
        setActions([...new Set(Object.values(data).map(item => item.screen))].filter(Boolean));
      } else {
        setLoggingData({});
        setUsers([]);
        setActions([]);
      }
      setLoading(false);
    }, { onlyOnce: true });
  }, [selectedYear, selectedMonth, selectedDay, availableDays]);

  useEffect(() => {
    setOrdersLoading(true);
    const ordersRef = ref(database, `${prefixPath}/orders_DB_V3`);
    onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const ordersArray = Object.values(snapshot.val());
        setAllOrdersData(ordersArray);

        let totalProducts = 0;
        const statusCounts = { 2: { o: 0, p: 0 }, 3: { o: 0, p: 0 }, 13: { o: 0, p: 0 }, 11: { o: 0, p: 0 }, 24: { o: 0, p: 0 } };

        ordersArray.forEach(order => {
          let orderProducts = 0;
          if (order.products && Array.isArray(order.products)) {
            orderProducts = order.products.reduce((sum, product) => sum + (product.amount || 0), 0);
            totalProducts += orderProducts;
          }
          if (order.statusId && statusCounts[order.statusId]) {
            statusCounts[order.statusId].o += 1;
            statusCounts[order.statusId].p += orderProducts;
          }
        });

        const scansCount = (statusCounts[2]?.p || 0) + (statusCounts[3]?.p || 0);
        setScansFromOrders(scansCount);

        setOrderStats(prev => ({
          totalOrders: ordersArray.length,
          totalProducts,
          byStatus: prev.byStatus.map(s => ({ ...s, count: statusCounts[s.id].o, productsCount: statusCounts[s.id].p }))
        }));
        setOrdersError('');
      } else {
        setAllOrdersData([]);
        setOrderStats(prev => ({ totalOrders: 0, totalProducts: 0, byStatus: prev.byStatus.map(s => ({ ...s, count: 0, productsCount: 0 })) }));
        setOrdersError('Замовлень не знайдено');
        setScansFromOrders(0);
      }
      setOrdersLoading(false);
    }, { onlyOnce: true });
  }, []);

  useEffect(() => {
    // setOrdersLoading(true);
    if (!allOrdersData || allOrdersData.length === 0) return;

    const paramsRef = ref(database, `${prefixPath}/placement_db`);
    onValue(paramsRef, (snapshot) => {
      if (snapshot.exists()) {
        const paramsArray = Object.values(snapshot.val());

        let totalWeight = 0.0;
        let totalVolume = 0.0;
        allOrdersData.forEach(order => {
          order.products.forEach(product => {
            const param = paramsArray.find(p => p.productId === product.parameterProductId);
            if (param) {
              let productVolume = 0.0;
              if (param.width && param.length && param.height) {
                productVolume = ((param.width / 100) * (param.length / 100) * (param.height / 100)) * (product.amount || 0);
              }
              totalWeight += (param.weight / 100 || 0.0) * (product.amount || 0);
              totalVolume += productVolume;
            }
          });
        });

        setAllParamsData(prev => ({
          totalWeight: `${totalWeight.toFixed(2)} кг`,
          totalVolume: `${totalVolume.toFixed(3)} м³`,
        }));

        setOrdersError('');
      } else {
        setOrdersError('Параметри не знайдено');
      }
      // setOrdersLoading(false);
    }, { onlyOnce: true });
  }, [allOrdersData]);

  useEffect(() => {
    let filteredEntries = Object.entries(loggingData);

    if (selectedUser !== 'all') {
      filteredEntries = filteredEntries.filter(([, data]) => data.userId === selectedUser);
    }
    if (selectedAction !== 'all') {
      filteredEntries = filteredEntries.filter(([, data]) => data.screen === selectedAction);
    }

    if (filteredEntries.length === 0) {
      setChartData([]);
      return;
    }

    const getTotalMinutes = (logId) => {
      const timeStr = String(logId).padStart(6, '0');
      const hours = parseInt(timeStr.slice(0, 2), 10);
      const minutes = parseInt(timeStr.slice(2, 4), 10);
      return isNaN(hours) || isNaN(minutes) ? null : hours * 60 + minutes;
    };

    let minTotalMinutes = Infinity;
    let maxTotalMinutes = -Infinity;

    filteredEntries.forEach(([logId]) => {
      const currentMinutes = getTotalMinutes(logId);
      if (currentMinutes !== null) {
        if (currentMinutes < minTotalMinutes) minTotalMinutes = currentMinutes;
        if (currentMinutes > maxTotalMinutes) maxTotalMinutes = currentMinutes;
      }
    });

    if (minTotalMinutes === Infinity) {
      setChartData([]);
      return;
    }

    const intervalData = {};
    const startMinute = Math.floor(minTotalMinutes / timeInterval) * timeInterval;
    const endMinute = Math.floor(maxTotalMinutes / timeInterval) * timeInterval;

    for (let i = startMinute; i <= endMinute; i += timeInterval) {
      const intervalHours = Math.floor(i / 60);
      const intervalMins = i % 60;
      const intervalKey = `${String(intervalHours).padStart(2, '0')}:${String(intervalMins).padStart(2, '0')}`;
      intervalData[intervalKey] = { time: intervalKey, successCount: 0, failCount: 0, total: 0 };
    }

    const getTimeIntervalKey = (logId) => {
      const totalMinutes = getTotalMinutes(logId);
      if (totalMinutes === null) return null;
      const intervalMinutes = Math.floor(totalMinutes / timeInterval) * timeInterval;
      const intervalHours = Math.floor(intervalMinutes / 60);
      const intervalMins = intervalMinutes % 60;
      return `${String(intervalHours).padStart(2, '0')}:${String(intervalMins).padStart(2, '0')}`;
    };

    filteredEntries.forEach(([logId, item]) => {
      const intervalKey = getTimeIntervalKey(logId);
      if (intervalKey && intervalData[intervalKey]) {
        intervalData[intervalKey].total += 1;
        if (item.success === true || item.success === 'true') {
          intervalData[intervalKey].successCount += 1;
        } else {
          intervalData[intervalKey].failCount += 1;
        }
      }
    });

    setChartData(Object.values(intervalData));
  }, [loggingData, selectedUser, selectedAction, timeInterval]);

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const timeIntervals = [
    { value: 10, label: '10 хв' },
    { value: 30, label: '30 хв' },
    { value: 60, label: '1 год' }
  ];

  // Обчислюємо загальну кількість сканів перед рендерингом
  const successScansFromLogs = chartData.reduce((sum, item) => sum + item.successCount, 0);
  const totalScansToDisplay = scansFromOrders + successScansFromLogs;

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

      <div className="analytics-date-card" style={{ marginBottom: '24px' }}>
        <div className="date-card-header">
          <ShoppingCart size={20} />
          <h3>Інформація про замовлення</h3>
        </div>
        <div className="date-card-body">
          {ordersLoading ? (
            <div style={{ padding: '12px', textAlign: 'center' }}>Завантаження даних замовлень...</div>
          ) : ordersError ? (
            <div style={{ padding: '12px', textAlign: 'center' }}>{ordersError}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                {/* {orderStats.byStatus.map((status) => (
                  <div key={status.id} style={{ padding: '12px 16px', backgroundColor: status.bgColor, border: `2px solid ${status.color}`, borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600' }}>{status.name}</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: status.color }}>{status.count}</div>
                    <div style={{ fontSize: '10px' }}>товарів: {status.productsCount}</div>
                  </div>
                ))} */}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                <div style={{ padding: '12px 16px', backgroundColor: '#f0f9ff', border: '2px solid #0ea5e9', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Всього замовлень</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#0369a1' }}>{orderStats.totalOrders}</div>
                </div>
                <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Кількість сканів на сьогодні</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>{orderStats.totalProducts}</div>
                </div>
                <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Вага</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>{paramsData.totalWeight}</div>
                </div>
                <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Об'єм</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>{paramsData.totalVolume}</div>
                </div>
                {/* <div style={{ padding: '12px 16px', backgroundColor: '#faf5ff', border: '2px solid #9333ea', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: '600', marginBottom: '4px' }}>Кількість сканів на сьогодні</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#7e22ce' }}>{totalScansToDisplay}</div>
                </div> */}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="analytics-date-card">
        <div className="date-card-header">
          <CalendarIcon size={20} />
          <h3>Вибір періоду</h3>
        </div>
        <div className="date-card-body">
          <div className="date-row">
            <div className="date-field">
              <label>Місяць:</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="date-select">
                {availableMonths.map(month => <option key={month} value={month}>{monthNames[month - 1]}</option>)}
              </select>
            </div>
            <div className="date-field">
              <label>День:</label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))} className="date-select">
                {availableDays.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-filters-card">
        <div className="filters-header"><h3>Фільтри</h3></div>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label"><User size={18} />Користувач</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="filter-select">
              <option value="all">Всі користувачі</option>
              {users.map(user => <option key={user} value={user}>{user}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label"><Activity size={18} />Дія</label>
            <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="filter-select">
              <option value="all">Всі дії</option>
              {actions.map(action => <option key={action} value={action}>{action}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-value">{successScansFromLogs}</div>
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

      <div className="chart-card">
        <div className="chart-header">
          <h3>Графік активності</h3>
          <div className="chart-controls">
            <div className="time-interval-buttons">
              {timeIntervals.map(interval => (
                <button key={interval.value} className={`interval-button ${timeInterval === interval.value ? 'active' : ''}`} onClick={() => setTimeInterval(interval.value)}>
                  {interval.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="chart-loading"><div className="spinner"></div><p>Завантаження даних...</p></div>
        ) : chartData.length === 0 ? (
          <div className="chart-empty"><p>Немає даних для відображення</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} interval="preserveStartEnd" />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="successCount" name="Успішні" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="failCount" name="Помилки" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
// src/hooks/useAnalyticsData.js
import { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { prefixPath } from '../PathDb';

export const useAnalyticsData = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedDate, setSelectedDate] = useState(today);

  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [datesWithData, setDatesWithData] = useState([]);

  const [loggingData, setLoggingData] = useState({});
  const [scanThresholdData, setScanThresholdData] = useState({});
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);

  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedAction, setSelectedAction] = useState('OrderPackaging');
  const [timeInterval, setTimeInterval] = useState(60);

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Fetch year data to get available months
  useEffect(() => {
    console.log('[useAnalyticsData] Fetching year data:', selectedYear);
    const yearRef = ref(database, `${prefixPath}/logging_db/Scanning/${selectedYear}`);

    const unsubscribe = onValue(yearRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const months = Object.keys(snapshot.val()).map(Number).sort((a, b) => b - a);
          console.log('[useAnalyticsData] Available months:', months);
          setAvailableMonths(months);

          if (months.length > 0 && !months.includes(selectedMonth)) {
            setSelectedMonth(months[0]);
          }
        } else {
          console.warn('[useAnalyticsData] No data for year:', selectedYear);
          setAvailableMonths([]);
        }
      } catch (error) {
        console.error('[useAnalyticsData] Error processing year data:', error);
      }
    }, (error) => {
      console.error('[useAnalyticsData] Firebase error fetching year data:', error);
    });

    return () => unsubscribe();
  }, [selectedYear]);

  // Fetch month data to get available days
  useEffect(() => {
    if (!selectedMonth) {
      console.log('[useAnalyticsData] Month not selected, skipping fetch');
      return;
    }

    console.log('[useAnalyticsData] Fetching month data:', selectedYear, selectedMonth);
    const monthRef = ref(database, `${prefixPath}/logging_db/Scanning/${selectedYear}/${selectedMonth}`);

    const unsubscribe = onValue(monthRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const days = Object.keys(snapshot.val()).map(Number).sort((a, b) => b - a);
          console.log('[useAnalyticsData] Available days:', days);
          setAvailableDays(days);

          // Build dates with data for highlighting in calendar
          const datesArray = days.map(day => {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            return date;
          });
          setDatesWithData(datesArray);

          if (days.length > 0 && !days.includes(selectedDay)) {
            setSelectedDay(days[0]);
            setSelectedDate(new Date(selectedYear, selectedMonth - 1, days[0]));
          }
        } else {
          console.warn('[useAnalyticsData] No data for month:', selectedYear, selectedMonth);
          setAvailableDays([]);
          setDatesWithData([]);
        }
      } catch (error) {
        console.error('[useAnalyticsData] Error processing month data:', error);
      }
    }, (error) => {
      console.error('[useAnalyticsData] Firebase error fetching month data:', error);
    });

    return () => unsubscribe();
  }, [selectedYear, selectedMonth]);

  // Fetch logging data for selected day
  useEffect(() => {
    if (!selectedDay || availableDays.length === 0) {
      console.log('[useAnalyticsData] Day not selected or no days available, skipping logging fetch');
      return;
    }

    console.log('[useAnalyticsData] Fetching logging data for:', selectedYear, selectedMonth, selectedDay);
    setLoading(true);

    const dayRef = ref(database, `${prefixPath}/logging_db/Scanning/${selectedYear}/${selectedMonth}/${selectedDay}`);

    const unsubscribe = onValue(dayRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('[useAnalyticsData] Logging data received, entries:', Object.keys(data).length);
          setLoggingData(data);
          setUsers([...new Set(Object.values(data).map(item => item.userId))].filter(Boolean));
          setActions([...new Set(Object.values(data).map(item => item.screen))].filter(Boolean));
        } else {
          console.warn('[useAnalyticsData] No logging data for day:', selectedYear, selectedMonth, selectedDay);
          setLoggingData({});
          setUsers([]);
          setActions([]);
        }
      } catch (error) {
        console.error('[useAnalyticsData] Error processing logging data:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('[useAnalyticsData] Firebase error fetching logging data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedYear, selectedMonth, selectedDay, availableDays]);

  // Fetch scan threshold data for selected day
  useEffect(() => {
    if (!selectedDay || availableDays.length === 0) {
      console.log('[useAnalyticsData] Day not selected or no days available, skipping threshold fetch');
      return;
    }

    console.log('[useAnalyticsData] Fetching scan threshold data for:', selectedYear, selectedMonth, selectedDay);
    setOrdersLoading(true);
    setOrdersError('');

    const dbRef = ref(database, `${prefixPath}/scan_threshold_db/${selectedYear}/${selectedMonth}/${selectedDay}`);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('[useAnalyticsData] Scan threshold data:', data);
          setScanThresholdData(data);
        } else {
          console.warn('[useAnalyticsData] No scan threshold data for day:', selectedYear, selectedMonth, selectedDay);
          setScanThresholdData({});
        }
      } catch (error) {
        console.error('[useAnalyticsData] Error processing scan threshold data:', error);
        setOrdersError('Помилка завантаження даних замовлень');
      } finally {
        setOrdersLoading(false);
      }
    }, (error) => {
      console.error('[useAnalyticsData] Firebase error fetching scan threshold data:', error);
      setOrdersError('Помилка завантаження даних замовлень');
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, [selectedYear, selectedMonth, selectedDay, availableDays]);

  // Process chart data based on filters
  useEffect(() => {
    console.log('[useAnalyticsData] Processing chart data. Filters:', { selectedUser, selectedAction, timeInterval });
    let filteredEntries = Object.entries(loggingData);

    if (selectedUser !== 'all') {
      filteredEntries = filteredEntries.filter(([, data]) => data.userId === selectedUser);
    }
    if (selectedAction !== 'all') {
      filteredEntries = filteredEntries.filter(([, data]) => data.screen === selectedAction);
    }

    console.log('[useAnalyticsData] Filtered entries count:', filteredEntries.length);

    if (filteredEntries.length === 0) {
      console.log('[useAnalyticsData] No data after filtering, clearing chart');
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

    const finalChartData = Object.values(intervalData);
    console.log('[useAnalyticsData] Chart data updated, data points:', finalChartData.length);
    setChartData(finalChartData);
  }, [loggingData, selectedUser, selectedAction, timeInterval]);

  // Handler for date change from DatePicker
  const handleDateChange = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      setSelectedDate(date);
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDay(day);
    }
  };

  return {
    // State
    selectedYear,
    selectedMonth,
    selectedDay,
    selectedDate,
    availableMonths,
    availableDays,
    datesWithData,
    loggingData,
    scanThresholdData,
    users,
    actions,
    selectedUser,
    selectedAction,
    timeInterval,
    chartData,
    loading,
    ordersLoading,
    ordersError,

    // Setters
    setSelectedYear,
    setSelectedMonth,
    setSelectedDay,
    setSelectedUser,
    setSelectedAction,
    setTimeInterval,
    handleDateChange,
  };
};

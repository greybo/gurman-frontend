// src/hooks/useProcessingTimeData.js
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';

function parseTimestamp(str) {
  if (!str) return null;
  return new Date(str.replace(' ', 'T'));
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function calculateProcessingHours(statusHistory) {
  if (!Array.isArray(statusHistory)) return null;

  const status1 = statusHistory.find(s => s.status === 1);
  const status24 = statusHistory.find(s => s.status === 24);

  if (!status1 || !status24) return null;

  const start = parseTimestamp(status1.timestamp);
  const end = parseTimestamp(status24.timestamp);

  if (!start || !end) return null;

  const diffMs = end - start;
  if (diffMs <= 0) return null;

  return diffMs / (1000 * 60 * 60); // hours
}

export function useProcessingTimeData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawOrders, setRawOrders] = useState([]);
  const [selectedSajt, setSelectedSajt] = useState('all');
  const [selectedManager, setSelectedManager] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch all documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(firestore, 'analyticsLeads'));
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRawOrders(orders);
      } catch (err) {
        console.error('Firestore fetch error:', err);
        setError('Помилка завантаження даних');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extract available filter values
  const { availableSajts, availableManagers, availableYears } = useMemo(() => {
    const sajts = [...new Set(rawOrders.map(o => o.sajt).filter(Boolean))].sort((a, b) => a - b);
    const managers = [...new Set(rawOrders.map(o => o.managerId).filter(Boolean))].sort((a, b) => a - b);
    const years = [...new Set(
      rawOrders
        .map(o => {
          const d = parseTimestamp(o.orderTime);
          return d ? d.getFullYear() : null;
        })
        .filter(Boolean)
    )].sort((a, b) => b - a);

    return { availableSajts: sajts, availableManagers: managers, availableYears: years };
  }, [rawOrders]);

  // Set default year when data loads
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears]);

  // Process chart data
  const chartData = useMemo(() => {
    const filtered = rawOrders.filter(order => {
      // Filter by sajt
      if (selectedSajt !== 'all' && order.sajt !== Number(selectedSajt)) return false;
      // Filter by manager
      if (selectedManager !== 'all' && order.managerId !== Number(selectedManager)) return false;
      // Filter by year
      const orderDate = parseTimestamp(order.orderTime);
      if (!orderDate || orderDate.getFullYear() !== selectedYear) return false;
      return true;
    });

    // Calculate processing hours and group by week
    const weekMap = {};

    filtered.forEach(order => {
      const hours = calculateProcessingHours(order.statusHistory);
      if (hours === null) return;

      const orderDate = parseTimestamp(order.orderTime);
      const week = getISOWeek(orderDate);

      if (!weekMap[week]) {
        weekMap[week] = [];
      }
      weekMap[week].push(hours);
    });

    // Build chart data sorted by week
    const weeks = Object.keys(weekMap).map(Number).sort((a, b) => a - b);

    return weeks.map(week => {
      const values = weekMap[week];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

      return {
        week: `Тиж ${week}`,
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        avg: Math.round(avg * 10) / 10,
        count: values.length,
      };
    });
  }, [rawOrders, selectedSajt, selectedManager, selectedYear]);

  return {
    loading,
    error,
    chartData,
    selectedSajt,
    setSelectedSajt,
    selectedManager,
    setSelectedManager,
    selectedYear,
    setSelectedYear,
    availableSajts,
    availableManagers,
    availableYears,
  };
}

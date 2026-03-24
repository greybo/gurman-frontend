// src/hooks/useProcessingTimeData.js
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { firestore, database } from '../firebase';

function parseTimestamp(val) {
  if (!val) return null;
  // Firestore Timestamp object
  if (val.toDate && typeof val.toDate === 'function') return val.toDate();
  // String "YYYY-MM-DD HH:MM:SS"
  if (typeof val === 'string') return new Date(val.replace(' ', 'T'));
  // Already a Date or number
  if (val instanceof Date) return val;
  if (typeof val === 'number') return new Date(val);
  return null;
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
  const [selectedShipping, setSelectedShipping] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Meta lookups: value -> text
  const [metaSites, setMetaSites] = useState({});
  const [metaManagers, setMetaManagers] = useState({});
  const [metaShipping, setMetaShipping] = useState({});

  // Fetch meta data from Realtime Database + orders from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch meta and orders in parallel
        const [sitesSnap, managersSnap, shippingSnap, ordersSnap] = await Promise.all([
          get(ref(database, 'meta/site_db')),
          get(ref(database, 'meta/manager_db')),
          get(ref(database, 'meta/shipping_method_db')),
          getDocs(collection(firestore, 'analyticsLeads')),
        ]);

        // Build value -> text maps
        const buildMap = (snap) => {
          const map = {};
          if (snap.exists()) {
            const data = snap.val();
            const items = Array.isArray(data) ? data : Object.values(data);
            items.forEach(item => {
              if (item && item.value != null) {
                map[item.value] = item.text || String(item.value);
              }
            });
          }
          return map;
        };

        setMetaSites(buildMap(sitesSnap));
        setMetaManagers(buildMap(managersSnap));
        setMetaShipping(buildMap(shippingSnap));

        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRawOrders(orders);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Помилка завантаження даних');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extract available filter values with text labels from meta
  const { availableSajts, availableManagers, availableShippings, availableYears } = useMemo(() => {
    const sajtValues = [...new Set(rawOrders.map(o => o.sajt).filter(v => v != null))].sort((a, b) => a - b);
    const managerValues = [...new Set(rawOrders.map(o => o.managerId).filter(v => v != null))].sort((a, b) => a - b);
    const shippingValues = [...new Set(rawOrders.map(o => o.shippingMethod).filter(v => v != null))].sort((a, b) => a - b);
    const years = [...new Set(
      rawOrders
        .map(o => {
          const d = parseTimestamp(o.orderTime);
          return d ? d.getFullYear() : null;
        })
        .filter(Boolean)
    )].sort((a, b) => b - a);

    const sajts = sajtValues.map(v => ({ value: v, text: metaSites[v] || String(v) }));
    const managers = managerValues.map(v => ({ value: v, text: metaManagers[v] || String(v) }));
    const shippings = shippingValues.map(v => ({ value: v, text: metaShipping[v] || String(v) }));

    return { availableSajts: sajts, availableManagers: managers, availableShippings: shippings, availableYears: years };
  }, [rawOrders, metaSites, metaManagers, metaShipping]);

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
      // Filter by shipping method
      if (selectedShipping !== 'all' && order.shippingMethod !== Number(selectedShipping)) return false;
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
        weekMap[week] = { values: [], year: orderDate.getFullYear() };
      }
      weekMap[week].values.push(hours);
    });

    // Get Monday date for a given ISO week and year
    const getWeekStartDate = (week, year) => {
      const jan4 = new Date(year, 0, 4);
      const dayOfWeek = jan4.getDay() || 7;
      const monday = new Date(jan4);
      monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
      const dd = String(monday.getDate()).padStart(2, '0');
      const mm = String(monday.getMonth() + 1).padStart(2, '0');
      return `${dd}.${mm}`;
    };

    // Build chart data sorted by week
    const weeks = Object.keys(weekMap).map(Number).sort((a, b) => a - b);

    return weeks.map(week => {
      const { values, year } = weekMap[week];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      const weekStart = getWeekStartDate(week, year);

      return {
        week: `Тиж ${week}`,
        weekLabel: `Тиж ${week}\n${weekStart}`,
        weekStart,
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        avg: Math.round(avg * 10) / 10,
        count: values.length,
      };
    });
  }, [rawOrders, selectedSajt, selectedManager, selectedShipping, selectedYear]);

  return {
    loading,
    error,
    chartData,
    selectedSajt,
    setSelectedSajt,
    selectedManager,
    setSelectedManager,
    selectedShipping,
    setSelectedShipping,
    selectedYear,
    setSelectedYear,
    availableSajts,
    availableManagers,
    availableShippings,
    availableYears,
  };
}

// src/hooks/useOrdersData.js
import { useState, useEffect, useMemo } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { ordersV3DbPath } from '../PathDb';

// Status mapping from SalesDrive
const STATUS_MAP = {
  1:  { label: 'Новий',                        color: 'info' },
  2:  { label: 'Підтверджен',                  color: 'success' },
  3:  { label: 'На отправку',                  color: 'warning' },
  4:  { label: 'Отправлен',                    color: 'success' },
  5:  { label: 'Продажа',                      color: 'success' },
  6:  { label: 'Отказ',                        color: 'error' },
  7:  { label: 'Возврат',                      color: 'error' },
  8:  { label: 'Удален',                       color: 'error' },
  9:  { label: 'Чекаємо ОПЛАТУ',               color: 'warning' },
  10: { label: 'Передзвонити',                 color: 'warning' },
  11: { label: 'Зібрано',                      color: 'info' },
  12: { label: 'Замовити',                     color: 'warning' },
  13: { label: 'Комплектується',               color: 'warning' },
  24: { label: 'Передано кур\'єру',            color: 'success' },
  25: { label: 'Виставити Рахунок',            color: 'warning' },
  35: { label: 'Дозвонитися до клієнта',       color: 'warning' },
  36: { label: 'Виявити наступну потребу',      color: 'info' },
  37: { label: 'Знає коли замовлення',          color: 'info' },
  38: { label: 'На відправку',                 color: 'warning' },
  39: { label: 'Не знає коли замовлення',       color: 'warning' },
  40: { label: 'Новий - Постоянные',           color: 'info' },
  41: { label: 'Не має в наявності',           color: 'error' },
  42: { label: 'В роботі',                     color: 'warning' },
};

// Orders with these statuses are considered "waiting for status change"
const PENDING_STATUS_IDS = [1, 3, 9, 10, 11, 12, 13, 25, 35, 38, 39, 42];

export const getStatusInfo = (statusId) =>
  STATUS_MAP[statusId] || { label: `Статус ${statusId ?? '—'}`, color: 'neutral' };

export default function useOrdersData() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  // Fetch from Firebase
  useEffect(() => {
    setLoading(true);
    setError('');

    const ordersRef = ref(database, ordersV3DbPath);

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const arr = Object.entries(data).map(([key, value]) => ({
            ...value,
            orderId: key,
          }));
          setOrders(arr);
          setError('');
        } else {
          setOrders([]);
          setError('Замовлень не знайдено');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading orders V3:', err);
        setError('Помилка завантаження даних');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Group by statusId
  const groupedOrders = useMemo(() => {
    const groups = {};

    orders.forEach((order) => {
      const sid = order.statusId ?? 'none';
      if (!groups[sid]) {
        groups[sid] = [];
      }
      groups[sid].push(order);
    });

    // Sort each group by updateDate descending
    Object.values(groups).forEach((list) =>
      list.sort((a, b) => (b.updateDate || '').localeCompare(a.updateDate || ''))
    );

    return groups;
  }, [orders]);

  // Sorted status keys (pending statuses first, then by count desc)
  const sortedStatusKeys = useMemo(() => {
    return Object.keys(groupedOrders).sort((a, b) => {
      const aNum = Number(a);
      const bNum = Number(b);
      const aPending = PENDING_STATUS_IDS.includes(aNum) ? 0 : 1;
      const bPending = PENDING_STATUS_IDS.includes(bNum) ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return groupedOrders[b].length - groupedOrders[a].length;
    });
  }, [groupedOrders]);

  // Orders waiting for status change
  const pendingOrders = useMemo(() => {
    return orders
      .filter((o) => PENDING_STATUS_IDS.includes(o.statusId))
      .sort((a, b) => (a.updateDate || '').localeCompare(b.updateDate || ''));
  }, [orders]);

  // Summary stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = pendingOrders.length;
    const shippingCounts = {};
    orders.forEach((o) => {
      const ship = o.shippingData?.text || 'Невідомо';
      shippingCounts[ship] = (shippingCounts[ship] || 0) + 1;
    });
    return { total, pending, shippingCounts };
  }, [orders, pendingOrders]);

  // Toggle expand/collapse for a status group
  const toggleGroup = (statusId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [statusId]: !prev[statusId],
    }));
  };

  // Expand all by default on first load
  useEffect(() => {
    if (sortedStatusKeys.length > 0 && Object.keys(expandedGroups).length === 0) {
      const initial = {};
      sortedStatusKeys.forEach((k) => (initial[k] = true));
      setExpandedGroups(initial);
    }
  }, [sortedStatusKeys]);

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const parts = dateString.split(' ');
    const dateParts = parts[0].split('-');
    if (dateParts.length === 3) {
      const time = parts[1] ? ` ${parts[1].substring(0, 5)}` : '';
      return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}${time}`;
    }
    return dateString;
  };

  const getClientName = (order) => {
    const fName = order.fName || order.primaryContact?.fName || '';
    const lName = order.lName || order.primaryContact?.lName || '';
    return `${fName} ${lName}`.trim() || '—';
  };

  const getShipping = (order) => order.shippingData?.text || '—';

  return {
    orders,
    loading,
    error,
    groupedOrders,
    sortedStatusKeys,
    pendingOrders,
    stats,
    expandedGroups,
    toggleGroup,
    formatDate,
    getClientName,
    getShipping,
    getStatusInfo,
  };
}

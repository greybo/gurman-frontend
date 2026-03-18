// src/hooks/useOrdersData.js
import { useState, useEffect, useMemo } from 'react';
import { database } from '../firebase';
import { ref, onValue, remove } from 'firebase/database';
import { ordersV3DbPath } from '../PathDb';

// Status mapping from SalesDrive
// bg = hex color used for group background at 70% opacity
const STATUS_MAP = {
  1:  { label: 'Новий',                        color: 'info',      bg: '#3b82f6' },
  2:  { label: 'Підтверджен',                  color: 'yellow',    bg: '#ffff00' },
  3:  { label: 'На отправку',                  color: 'orange',    bg: '#ea580c' },
  4:  { label: 'Отправлен',                    color: 'success',   bg: '#22c55e' },
  5:  { label: 'Продажа',                      color: 'success',   bg: '#22c55e' },
  6:  { label: 'Отказ',                        color: 'error',     bg: '#ef4444' },
  7:  { label: 'Возврат',                      color: 'error',     bg: '#ef4444' },
  8:  { label: 'Удален',                       color: 'error',     bg: '#ef4444' },
  9:  { label: 'Чекаємо ОПЛАТУ',               color: 'warning',   bg: '#f59e0b' },
  10: { label: 'Передзвонити',                 color: 'warning',   bg: '#f59e0b' },
  11: { label: 'Зібрано',                      color: 'pink',      bg: '#ec4899' },
  12: { label: 'Замовити',                     color: 'warning',   bg: '#f59e0b' },
  13: { label: 'Комплектується',               color: 'blue',      bg: '#1d4ed8' },
  24: { label: 'Передано кур\'єру',            color: 'darkgreen', bg: '#065f46' },
  25: { label: 'Виставити Рахунок',            color: 'warning',   bg: '#f59e0b' },
  35: { label: 'Дозвонитися до клієнта',       color: 'warning',   bg: '#f59e0b' },
  36: { label: 'Виявити наступну потребу',      color: 'info',      bg: '#3b82f6' },
  37: { label: 'Знає коли замовлення',          color: 'info',      bg: '#3b82f6' },
  38: { label: 'На відправку',                 color: 'warning',   bg: '#f59e0b' },
  39: { label: 'Не знає коли замовлення',       color: 'warning',   bg: '#f59e0b' },
  40: { label: 'Новий - Постоянные',           color: 'info',      bg: '#3b82f6' },
  41: { label: 'Не має в наявності',           color: 'error',     bg: '#ef4444' },
  42: { label: 'В роботі',                     color: 'warning',   bg: '#f59e0b' },
};

// Fixed display order for status groups
const STATUS_SORT_ORDER = [3, 13, 11, 24];

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

  // Sorted status keys: fixed order [3, 13, 11, 24], then rest by count desc
  const sortedStatusKeys = useMemo(() => {
    return Object.keys(groupedOrders).sort((a, b) => {
      const aIdx = STATUS_SORT_ORDER.indexOf(Number(a));
      const bIdx = STATUS_SORT_ORDER.indexOf(Number(b));
      // Both in fixed order → sort by position
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      // Only one in fixed order → it goes first
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      // Neither → sort by count desc
      return groupedOrders[b].length - groupedOrders[a].length;
    });
  }, [groupedOrders]);

  // Orders waiting for status change (syncSalesDrive === true)
  const pendingOrders = useMemo(() => {
    return orders
      .filter((o) => o.syncSalesDrive === true)
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

  const isDateOlderThan24h = (dateString) => {
    if (!dateString) return false;
    const orderDate = new Date(dateString.replace(' ', 'T'));
    const now = new Date();
    return (now - orderDate) > 24 * 60 * 60 * 1000;
  };

  const deleteOrder = async (orderId) => {
    const orderRef = ref(database, `${ordersV3DbPath}/${orderId}`);
    await remove(orderRef);
  };

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
    isDateOlderThan24h,
    deleteOrder,
    getStatusInfo,
  };
}

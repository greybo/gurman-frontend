// src/hooks/useAllOrders.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { firestore } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getStatusInfo } from './useOrdersData';

const SHIPPING_MAP = {
  1: 'Самовивіз',
  2: 'Нова Пошта',
  3: 'Укрпошта',
  4: 'Кур\'єр',
  5: 'Делівері',
  6: 'Justin',
  7: 'Meest',
  14: 'Нова Пошта (Поштомат)',
  17: 'Нова Пошта',
  18: 'Укрпошта',
  19: 'Самовивіз з магазину',
  20: 'Кур\'єр по місту',
  31: 'Justin',
  32: 'Інтайм',
};

const PAYMENT_MAP = {
  1: 'Готівка',
  2: 'Безготівковий',
  3: 'Картка',
  4: 'Накладний платіж',
  5: 'ПриватБанк',
  14: 'Оплата на карту',
  32: 'Накладений платіж',
};

export const getShippingName = (id) => SHIPPING_MAP[id] || `Доставка #${id}`;
export const getPaymentName = (id) => PAYMENT_MAP[id] || `Оплата #${id}`;

function formatDateForQuery(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function useAllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Date filter - default to today
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(formatDateForQuery(today));
  const [dateTo, setDateTo] = useState(formatDateForQuery(today));

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const colRef = collection(firestore, 'analyticsLeads');

      const startDate = `${dateFrom} 00:00:00`;
      const endDate = `${dateTo} 23:59:59`;

      const q = query(
        colRef,
        where('orderTime', '>=', startDate),
        where('orderTime', '<=', endDate),
        orderBy('orderTime', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      setOrders(data);
      if (data.length === 0) {
        setError('Замовлень за обраний період не знайдено');
      }
    } catch (err) {
      console.error('Error loading analyticsLeads:', err);
      setError('Помилка завантаження даних: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtered by search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      const orderId = String(order.orderId || '');
      const phone = String(order.phone || '');
      const contactId = String(order.contactId || '');
      const campaign = order.utm?.campaign || '';
      return (
        orderId.includes(q) ||
        phone.includes(q) ||
        contactId.includes(q) ||
        campaign.toLowerCase().includes(q)
      );
    });
  }, [orders, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (o.salesAmount || 0), 0);
    const totalProfit = orders.reduce((sum, o) => sum + (o.profitAmount || 0), 0);
    const totalCommission = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
    return { total, totalSales, totalProfit, totalCommission };
  }, [orders]);

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

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedOrder,
    setSelectedOrder,
    stats,
    formatDate,
    fetchOrders,
    getStatusInfo,
    getShippingName,
    getPaymentName,
  };
}

// src/hooks/useAuditLogsData.js
import { useState, useEffect, useMemo } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { prefixPath } from '../PathDb';

function auditLogPath(year, month, day) {
  return `${prefixPath}/logging_db/Orders/${year}/${month}/${day}`;
}

export const ACTION_LABELS = {
  sync_success:   { label: 'Синк успішний',        color: 'success' },
  sync_failed:    { label: 'Синк помилка',          color: 'error' },
  sync_stale:     { label: 'Застарілий запит',      color: 'warning' },
  sync_stamped:   { label: 'Мітку проставлено',     color: 'info' },
  order_removed:  { label: 'Замовлення видалено',   color: 'error' },
  cycle_summary:  { label: 'Підсумок циклу',        color: 'neutral' },
  batch_info:     { label: 'Batch інфо',            color: 'info' },
};

export default function useAuditLogsData() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState({
    year:  today.getFullYear().toString(),
    month: (today.getMonth() + 1).toString(),
    day:   today.getDate().toString(),
  });
  const [selectedAction, setSelectedAction] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Завантаження логів при зміні дати
  useEffect(() => {
    setLoading(true);
    setError('');
    setLogs([]);

    const { year, month, day } = selectedDate;
    const path = auditLogPath(year, month, day);
    const dbRef = ref(database, path);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const logsArray = Object.entries(data)
          .map(([key, value]) => ({ ...value, _key: key }))
          .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        setLogs(logsArray);
      } else {
        setLogs([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error loading audit logs:', err);
      setError('Помилка завантаження логів');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  // Фільтрація
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (selectedAction && log.action !== selectedAction) return false;
      if (searchOrderId && !String(log.orderId || '').includes(searchOrderId)) return false;
      return true;
    });
  }, [logs, selectedAction, searchOrderId]);

  // Статистика по діях за день
  const actionStats = useMemo(() => {
    const stats = {};
    for (const log of logs) {
      stats[log.action] = (stats[log.action] || 0) + 1;
    }
    return stats;
  }, [logs]);

  const clearFilters = () => {
    setSelectedAction('');
    setSearchOrderId('');
  };

  return {
    logs,
    filteredLogs,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    selectedAction,
    setSelectedAction,
    searchOrderId,
    setSearchOrderId,
    clearFilters,
    actionStats,
  };
}

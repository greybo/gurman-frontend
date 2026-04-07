import { useState, useEffect, useMemo } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import { prefixPath } from '../PathDb';

// Build list of dates between from and to (inclusive)
function getDateRange(from, to) {
  const dates = [];
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function useStatusChangeData() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [rawData, setRawData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWorker, setFilterWorker] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch data for all days in range
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const dates = getDateRange(dateFrom, dateTo);
        const snapshots = await Promise.all(
          dates.map((d) => {
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const day = d.getDate();
            return get(ref(database, `${prefixPath}/logging_db/STATUS_CHANGE/${y}/${m}/${day}`));
          })
        );
        const merged = {};
        snapshots.forEach((snap) => {
          if (snap.exists()) {
            Object.assign(merged, snap.val());
          }
        });
        setRawData(merged);
      } catch (err) {
        console.error('[useStatusChangeData] Error:', err);
        setRawData({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateFrom, dateTo]);

  // Extract unique workers and statuses for filter dropdowns
  const { workers, statuses } = useMemo(() => {
    const workerSet = new Set();
    const statusSet = new Set();
    Object.values(rawData).forEach((item) => {
      if (item.workerName) workerSet.add(item.workerName);
      if (item.toStatus) statusSet.add(item.toStatus);
    });
    return {
      workers: [...workerSet].sort(),
      statuses: [...statusSet].sort(),
    };
  }, [rawData]);

  // Group by orderId and apply transition-level filters
  const groupedOrders = useMemo(() => {
    let entries = Object.values(rawData);

    // Filter by worker
    if (filterWorker !== 'all') {
      entries = entries.filter((item) => item.workerName === filterWorker);
    }
    // Filter by toStatus
    if (filterStatus !== 'all') {
      entries = entries.filter((item) => item.toStatus === filterStatus);
    }

    const map = {};
    entries.forEach((item) => {
      const id = item.orderId;
      if (!id) return;
      if (!map[id]) {
        map[id] = {
          orderId: id,
          trackingNumber: item.trackingNumber || '—',
          transitions: [],
        };
      }
      if (item.trackingNumber) {
        map[id].trackingNumber = item.trackingNumber;
      }
      map[id].transitions.push({
        fromStatus: item.fromStatus,
        toStatus: item.toStatus,
        timestamp: item.timestamp,
        workerName: item.workerName || '—',
        statusId: item.statusId,
      });
    });

    Object.values(map).forEach((order) => {
      order.transitions.sort((a, b) => a.timestamp - b.timestamp);
    });

    return map;
  }, [rawData, filterWorker, filterStatus]);

  // Filter by search query
  const filteredOrders = useMemo(() => {
    const orders = Object.values(groupedOrders);
    if (!searchQuery.trim()) return orders;

    const q = searchQuery.trim().toLowerCase();
    return orders.filter(
      (o) =>
        String(o.orderId).includes(q) ||
        String(o.trackingNumber).toLowerCase().includes(q)
    );
  }, [groupedOrders, searchQuery]);

  return {
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    loading,
    searchQuery,
    setSearchQuery,
    filterWorker,
    setFilterWorker,
    filterStatus,
    setFilterStatus,
    workers,
    statuses,
    orders: filteredOrders,
    totalOrders: Object.keys(groupedOrders).length,
  };
}

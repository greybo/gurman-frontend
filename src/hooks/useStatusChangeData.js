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

  // Group ALL entries by orderId (no filters) to get complete transition history
  const allOrders = useMemo(() => {
    const map = {};
    Object.values(rawData).forEach((item) => {
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

    // Sort transitions and compute lastStatus per order
    Object.values(map).forEach((order) => {
      order.transitions.sort((a, b) => a.timestamp - b.timestamp);
      const last = order.transitions[order.transitions.length - 1];
      order.lastStatus = last?.toStatus || '—';
    });

    return map;
  }, [rawData]);

  // Extract unique workers (any transition) and statuses (only last operation)
  const { workers, statuses } = useMemo(() => {
    const workerSet = new Set();
    const statusSet = new Set();
    Object.values(allOrders).forEach((order) => {
      order.transitions.forEach((t) => {
        if (t.workerName && t.workerName !== '—') workerSet.add(t.workerName);
      });
      if (order.lastStatus && order.lastStatus !== '—') statusSet.add(order.lastStatus);
    });
    return {
      workers: [...workerSet].sort(),
      statuses: [...statusSet].sort(),
    };
  }, [allOrders]);

  // Apply worker filter — keep orders that contain at least one transition by this worker
  const ordersAfterWorker = useMemo(() => {
    const list = Object.values(allOrders);
    if (filterWorker === 'all') return list;
    return list.filter((order) =>
      order.transitions.some((t) => t.workerName === filterWorker)
    );
  }, [allOrders, filterWorker]);

  // Status counts based on lastStatus (after worker filter, BEFORE status filter)
  const statusCounts = useMemo(() => {
    const counts = {};
    ordersAfterWorker.forEach((order) => {
      const key = order.lastStatus || '—';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [ordersAfterWorker]);

  // Apply status filter (by lastStatus) and search
  const filteredOrders = useMemo(() => {
    let list = ordersAfterWorker;

    if (filterStatus !== 'all') {
      list = list.filter((order) => order.lastStatus === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (o) =>
          String(o.orderId).includes(q) ||
          String(o.trackingNumber).toLowerCase().includes(q)
      );
    }

    return list;
  }, [ordersAfterWorker, filterStatus, searchQuery]);

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
    statusCounts,
    orders: filteredOrders,
    totalOrders: ordersAfterWorker.length,
  };
}

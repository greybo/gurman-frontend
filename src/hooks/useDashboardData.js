import { useState, useEffect, useMemo } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../firebase';
import { prefixPath, ordersV3DbPath } from '../PathDb';
import { getStatusInfo } from './useOrdersData';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function getDateRange(from, to) {
  const dates = [];
  const cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

async function fetchLogsForRange(actionType, dates) {
  const snapshots = await Promise.all(
    dates.map((d) => {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();
      return get(ref(database, `${prefixPath}/logging_db/${actionType}/${y}/${m}/${day}`));
    })
  );
  const items = [];
  snapshots.forEach((snap) => {
    if (snap.exists()) {
      Object.values(snap.val()).forEach((it) => items.push(it));
    }
  });
  return items;
}

export default function useDashboardData() {
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState({ scans: [], statuses: [], logins: [], clicks: [] });
  const [loading, setLoading] = useState(true);

  // Real-time orders subscription
  useEffect(() => {
    const r = ref(database, ordersV3DbPath);
    const unsub = onValue(r, (snap) => {
      if (snap.exists()) {
        const arr = Object.entries(snap.val()).map(([key, val]) => ({ ...val, orderId: key }));
        setOrders(arr);
      } else {
        setOrders([]);
      }
    });
    return () => unsub();
  }, []);

  // Fetch logs for last 7 days (for today/yesterday/week stats + recent activity)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 6);
        const dates = getDateRange(weekAgo, today);

        const [scans, statuses, logins, clicks] = await Promise.all([
          fetchLogsForRange('APP_SCAN', dates),
          fetchLogsForRange('STATUS_CHANGE', dates),
          fetchLogsForRange('WORKER_LOGIN', dates),
          fetchLogsForRange('BUTTON_CLICK', dates),
        ]);
        setLogs({ scans, statuses, logins, clicks });
      } catch (err) {
        console.error('[useDashboardData] Error:', err);
        setLogs({ scans: [], statuses: [], logins: [], clicks: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Real-time status counts (from orders_DB_V3)
  const ordersByStatus = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const sid = o.statusId ?? 'none';
      if (!map[sid]) {
        map[sid] = { statusId: sid, count: 0, info: getStatusInfo(Number(sid)) };
      }
      map[sid].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [orders]);

  // Period stats: today / yesterday / week
  const periodStats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

    const within = (ts, from, to) => ts >= from && ts < to;

    // Count delivered orders (status_change to status 24) per period from STATUS_CHANGE
    const deliveredToday = new Set();
    const deliveredYesterday = new Set();
    const deliveredWeek = new Set();

    logs.statuses.forEach((s) => {
      if (s.statusId !== 24 || !s.timestamp || !s.orderId) return;
      if (within(s.timestamp, todayStart, todayStart + 24 * 60 * 60 * 1000)) {
        deliveredToday.add(s.orderId);
      }
      if (within(s.timestamp, yesterdayStart, todayStart)) {
        deliveredYesterday.add(s.orderId);
      }
      if (s.timestamp >= weekStart) {
        deliveredWeek.add(s.orderId);
      }
    });

    // Scan stats per period
    let scansToday = 0;
    let scansYesterday = 0;
    let scansWeek = 0;
    let errorsToday = 0;

    logs.scans.forEach((s) => {
      if (!s.timestamp) return;
      if (within(s.timestamp, todayStart, todayStart + 24 * 60 * 60 * 1000)) {
        scansToday++;
        if (!s.success) errorsToday++;
      }
      if (within(s.timestamp, yesterdayStart, todayStart)) scansYesterday++;
      if (s.timestamp >= weekStart) scansWeek++;
    });

    return {
      deliveredToday: deliveredToday.size,
      deliveredYesterday: deliveredYesterday.size,
      deliveredWeek: deliveredWeek.size,
      scansToday,
      scansYesterday,
      scansWeek,
      errorsToday,
    };
  }, [logs]);

  // Recent activity feed (last 20 actions across all log types)
  const recentActivity = useMemo(() => {
    const all = [];
    logs.scans.forEach((i) => all.push({ ...i, _type: 'APP_SCAN' }));
    logs.statuses.forEach((i) => all.push({ ...i, _type: 'STATUS_CHANGE' }));
    logs.logins.forEach((i) => all.push({ ...i, _type: 'WORKER_LOGIN' }));
    logs.clicks.forEach((i) => all.push({ ...i, _type: 'BUTTON_CLICK' }));
    return all
      .filter((i) => i.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }, [logs]);

  return {
    loading,
    ordersByStatus,
    totalOrders: orders.length,
    periodStats,
    recentActivity,
  };
}

import { useState, useEffect, useMemo } from 'react';
import { ref, get, onValue } from 'firebase/database';
import { database } from '../firebase';
import { prefixPath, workersDbPath } from '../PathDb';

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

async function fetchLogsForRange(actionType, dates) {
  const snapshots = await Promise.all(
    dates.map((d) => {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();
      return get(ref(database, `${prefixPath}/logging_db/${actionType}/${y}/${m}/${day}`));
    })
  );
  const merged = [];
  snapshots.forEach((snap) => {
    if (snap.exists()) {
      Object.values(snap.val()).forEach((item) => merged.push(item));
    }
  });
  return merged;
}

export default function useWorkersPerformance() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const [workers, setWorkers] = useState({});
  const [scans, setScans] = useState([]);
  const [statusChanges, setStatusChanges] = useState([]);
  const [logins, setLogins] = useState([]);
  const [buttonClicks, setButtonClicks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to workers_db
  useEffect(() => {
    const workersRef = ref(database, workersDbPath);
    const unsub = onValue(workersRef, (snap) => {
      setWorkers(snap.exists() ? snap.val() : {});
    });
    return () => unsub();
  }, []);

  // Fetch logs for date range
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const dates = getDateRange(dateFrom, dateTo);
        const [scansData, statusData, loginsData, clicksData] = await Promise.all([
          fetchLogsForRange('APP_SCAN', dates),
          fetchLogsForRange('STATUS_CHANGE', dates),
          fetchLogsForRange('WORKER_LOGIN', dates),
          fetchLogsForRange('BUTTON_CLICK', dates),
        ]);
        setScans(scansData);
        setStatusChanges(statusData);
        setLogins(loginsData);
        setButtonClicks(clicksData);
      } catch (err) {
        console.error('[useWorkersPerformance] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateFrom, dateTo]);

  // Compute per-worker metrics
  const workerStats = useMemo(() => {
    // Map workerId -> aggregated metrics
    const map = {};

    // Initialize from workers_db
    Object.entries(workers).forEach(([id, w]) => {
      if (!w) return;
      map[id] = {
        workerId: id,
        name: w.name || 'Без імені',
        active: w.active !== false,
        color: w.color,
        ordersProcessed: new Set(), // unique orderIds
        scansSuccess: 0,
        scansFailed: 0,
        clicksCount: 0,
        loginsCount: 0,
        lastLogin: null,
        // For avg processing time: per orderId collect [first, last] timestamps of this worker's transitions
        orderTransitions: {}, // orderId -> [timestamps]
      };
    });

    // Helper to find worker entry by name (fallback for logs that only have workerName)
    const findByName = (workerName) => {
      if (!workerName) return null;
      return Object.values(map).find((w) => w.name === workerName);
    };

    // STATUS_CHANGE — orders processed + per-order timestamps
    statusChanges.forEach((item) => {
      const w = (item.workerId && map[item.workerId]) || findByName(item.workerName);
      if (!w) return;
      if (item.orderId) {
        w.ordersProcessed.add(item.orderId);
        if (!w.orderTransitions[item.orderId]) w.orderTransitions[item.orderId] = [];
        if (item.timestamp) w.orderTransitions[item.orderId].push(item.timestamp);
      }
    });

    // APP_SCAN — success/failed counts
    scans.forEach((item) => {
      const w = (item.workerId && map[item.workerId]) || findByName(item.workerName);
      if (!w) return;
      if (item.success) w.scansSuccess++;
      else w.scansFailed++;
    });

    // BUTTON_CLICK — total clicks
    buttonClicks.forEach((item) => {
      const w = (item.workerId && map[item.workerId]) || findByName(item.workerName);
      if (!w) return;
      w.clicksCount++;
    });

    // WORKER_LOGIN — last login + count
    logins.forEach((item) => {
      const w = (item.workerId && map[item.workerId]) || findByName(item.workerName);
      if (!w) return;
      w.loginsCount++;
      if (!w.lastLogin || item.timestamp > w.lastLogin) {
        w.lastLogin = item.timestamp;
      }
    });

    // Convert to array, compute derived metrics
    return Object.values(map).map((w) => {
      const ordersCount = w.ordersProcessed.size;
      // Avg processing time = avg of (last - first) per order in seconds
      let avgProcessingSec = 0;
      const durations = [];
      Object.values(w.orderTransitions).forEach((timestamps) => {
        if (timestamps.length >= 2) {
          const min = Math.min(...timestamps);
          const max = Math.max(...timestamps);
          durations.push((max - min) / 1000);
        }
      });
      if (durations.length) {
        avgProcessingSec = durations.reduce((a, b) => a + b, 0) / durations.length;
      }

      return {
        workerId: w.workerId,
        name: w.name,
        active: w.active,
        color: w.color,
        ordersCount,
        scansSuccess: w.scansSuccess,
        scansFailed: w.scansFailed,
        clicksCount: w.clicksCount,
        loginsCount: w.loginsCount,
        lastLogin: w.lastLogin,
        avgProcessingSec,
      };
    });
  }, [workers, scans, statusChanges, logins, buttonClicks]);

  // Activity heatmap data: hour x day matrix
  const heatmapData = useMemo(() => {
    // For all logs combined, count actions per (dayKey, hour)
    const all = [...scans, ...statusChanges, ...logins, ...buttonClicks];
    const matrix = {}; // 'YYYY-MM-DD' -> [24 hours]

    all.forEach((item) => {
      if (!item.timestamp) return;
      const d = new Date(item.timestamp);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const hour = d.getHours();
      if (!matrix[dayKey]) matrix[dayKey] = new Array(24).fill(0);
      matrix[dayKey][hour]++;
    });

    return matrix;
  }, [scans, statusChanges, logins, buttonClicks]);

  // Build per-worker action timeline for details view
  const workerActions = useMemo(() => {
    const map = {}; // workerId -> [actions sorted by ts]

    const push = (item, type) => {
      const id = item.workerId || `name:${item.workerName || ''}`;
      if (!id) return;
      if (!map[id]) map[id] = [];
      map[id].push({ ...item, _type: type });
    };

    scans.forEach((i) => push(i, 'APP_SCAN'));
    statusChanges.forEach((i) => push(i, 'STATUS_CHANGE'));
    logins.forEach((i) => push(i, 'WORKER_LOGIN'));
    buttonClicks.forEach((i) => push(i, 'BUTTON_CLICK'));

    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));
    return map;
  }, [scans, statusChanges, logins, buttonClicks]);

  return {
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    loading,
    workerStats,
    heatmapData,
    workerActions,
  };
}

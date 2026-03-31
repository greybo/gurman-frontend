import { useState, useEffect, useMemo } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { prefixPath } from '../PathDb';

export default function useAppUpdateData() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rawData, setRawData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  useEffect(() => {
    setLoading(true);
    const dayRef = ref(database, `${prefixPath}/logging_db/APP_UPDATE/${year}/${month}/${day}`);

    const unsubscribe = onValue(dayRef, (snapshot) => {
      if (snapshot.exists()) {
        setRawData(snapshot.val());
      } else {
        setRawData({});
      }
      setLoading(false);
    }, (error) => {
      console.error('[useAppUpdateData] Error:', error);
      setRawData({});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [year, month, day]);

  // Group by workerId
  const groupedWorkers = useMemo(() => {
    const entries = Object.values(rawData);
    const map = {};

    entries.forEach((item) => {
      const id = item.workerId;
      if (!id) return;
      if (!map[id]) {
        map[id] = {
          workerId: id,
          workerName: item.workerName || '—',
          updates: [],
        };
      }
      if (item.workerName) {
        map[id].workerName = item.workerName;
      }
      map[id].updates.push({
        timestamp: item.timestamp,
        fromVersion: item.fromVersion || '—',
        toVersion: item.toVersion || '—',
        deviceModel: item.deviceModel || '—',
        success: item.success,
      });
    });

    Object.values(map).forEach((worker) => {
      worker.updates.sort((a, b) => a.timestamp - b.timestamp);
    });

    return map;
  }, [rawData]);

  const filteredWorkers = useMemo(() => {
    const workers = Object.values(groupedWorkers);
    if (!searchQuery.trim()) return workers;

    const q = searchQuery.trim().toLowerCase();
    return workers.filter(
      (w) =>
        w.workerName.toLowerCase().includes(q) ||
        w.updates.some(u =>
          u.fromVersion.toLowerCase().includes(q) ||
          u.toVersion.toLowerCase().includes(q) ||
          u.deviceModel.toLowerCase().includes(q)
        )
    );
  }, [groupedWorkers, searchQuery]);

  return {
    selectedDate,
    setSelectedDate,
    loading,
    searchQuery,
    setSearchQuery,
    workers: filteredWorkers,
    totalWorkers: Object.keys(groupedWorkers).length,
    totalUpdates: Object.keys(rawData).length,
  };
}

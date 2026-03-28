import { useState, useEffect, useMemo } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { prefixPath } from '../PathDb';

export default function useWorkerLoginData() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rawData, setRawData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  useEffect(() => {
    setLoading(true);
    const dayRef = ref(database, `${prefixPath}/logging_db/WORKER_LOGIN/${year}/${month}/${day}`);

    const unsubscribe = onValue(dayRef, (snapshot) => {
      if (snapshot.exists()) {
        setRawData(snapshot.val());
      } else {
        setRawData({});
      }
      setLoading(false);
    }, (error) => {
      console.error('[useWorkerLoginData] Error:', error);
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
          logins: [],
        };
      }
      if (item.workerName) {
        map[id].workerName = item.workerName;
      }
      map[id].logins.push({
        timestamp: item.timestamp,
        deviceModel: item.deviceModel || '—',
        currentVersion: item.currentVersion || '—',
        success: item.success,
      });
    });

    // Sort logins by timestamp
    Object.values(map).forEach((worker) => {
      worker.logins.sort((a, b) => a.timestamp - b.timestamp);
    });

    return map;
  }, [rawData]);

  // Filter by search
  const filteredWorkers = useMemo(() => {
    const workers = Object.values(groupedWorkers);
    if (!searchQuery.trim()) return workers;

    const q = searchQuery.trim().toLowerCase();
    return workers.filter(
      (w) => w.workerName.toLowerCase().includes(q)
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
  };
}

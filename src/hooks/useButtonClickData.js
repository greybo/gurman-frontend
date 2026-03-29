import { useState, useEffect, useMemo } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { prefixPath } from '../PathDb';

export default function useButtonClickData() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rawData, setRawData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScreen, setFilterScreen] = useState('all');
  const [filterWorker, setFilterWorker] = useState('all');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  useEffect(() => {
    setLoading(true);
    const dayRef = ref(database, `${prefixPath}/logging_db/BUTTON_CLICK/${year}/${month}/${day}`);

    const unsubscribe = onValue(dayRef, (snapshot) => {
      if (snapshot.exists()) {
        setRawData(snapshot.val());
      } else {
        setRawData({});
      }
      setLoading(false);
    }, (error) => {
      console.error('[useButtonClickData] Error:', error);
      setRawData({});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [year, month, day]);

  // Extract filter options
  const { screens, workers } = useMemo(() => {
    const entries = Object.values(rawData);
    const screenSet = new Set();
    const workerSet = new Set();
    entries.forEach((item) => {
      if (item.screen) screenSet.add(item.screen);
      if (item.workerName) workerSet.add(item.workerName);
    });
    return {
      screens: [...screenSet].sort(),
      workers: [...workerSet].sort(),
    };
  }, [rawData]);

  // Group by composite key: screen + workerId + invoiceId + appVersion + deviceModel
  const groupedData = useMemo(() => {
    let entries = Object.values(rawData);

    // Apply filters
    if (filterScreen !== 'all') {
      entries = entries.filter((item) => item.screen === filterScreen);
    }
    if (filterWorker !== 'all') {
      entries = entries.filter((item) => item.workerName === filterWorker);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      entries = entries.filter(
        (item) =>
          String(item.barcode || '').toLowerCase().includes(q) ||
          String(item.buttonName || '').toLowerCase().includes(q) ||
          String(item.invoiceId || '').toLowerCase().includes(q)
      );
    }

    const map = {};
    entries.forEach((item) => {
      const key = `${item.screen || ''}__${item.workerId || ''}`;
      if (!map[key]) {
        map[key] = {
          key,
          screen: item.screen || '—',
          workerId: item.workerId || '—',
          workerName: item.workerName || '—',
          clicks: [],
        };
      }
      map[key].clicks.push({
        timestamp: item.timestamp,
        buttonName: item.buttonName || '—',
        barcode: item.barcode || '—',
        invoiceId: item.invoiceId || '—',
        appVersion: item.appVersion || '—',
        deviceModel: item.deviceModel || '—',
        success: item.success,
      });
    });

    Object.values(map).forEach((group) => {
      group.clicks.sort((a, b) => a.timestamp - b.timestamp);
    });

    return Object.values(map);
  }, [rawData, filterScreen, filterWorker, searchQuery]);

  const totalClicks = useMemo(() => Object.keys(rawData).length, [rawData]);

  return {
    selectedDate,
    setSelectedDate,
    loading,
    searchQuery,
    setSearchQuery,
    filterScreen,
    setFilterScreen,
    filterWorker,
    setFilterWorker,
    screens,
    workers,
    groups: groupedData,
    totalClicks,
  };
}

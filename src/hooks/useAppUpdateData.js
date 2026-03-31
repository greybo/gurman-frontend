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

  // Group by deviceModel
  const groupedDevices = useMemo(() => {
    const entries = Object.values(rawData);
    const map = {};

    entries.forEach((item) => {
      const device = item.deviceModel || 'Unknown';
      if (!map[device]) {
        map[device] = {
          deviceModel: device,
          updates: [],
        };
      }
      map[device].updates.push({
        timestamp: item.timestamp,
        fromVersion: item.fromVersion || '—',
        toVersion: item.toVersion || '—',
        workerName: item.workerName || '—',
        success: item.success,
      });
    });

    Object.values(map).forEach((group) => {
      group.updates.sort((a, b) => a.timestamp - b.timestamp);
    });

    return map;
  }, [rawData]);

  const filteredDevices = useMemo(() => {
    const devices = Object.values(groupedDevices);
    if (!searchQuery.trim()) return devices;

    const q = searchQuery.trim().toLowerCase();
    return devices.filter(
      (d) =>
        d.deviceModel.toLowerCase().includes(q) ||
        d.updates.some(u =>
          u.fromVersion.toLowerCase().includes(q) ||
          u.toVersion.toLowerCase().includes(q) ||
          u.workerName.toLowerCase().includes(q)
        )
    );
  }, [groupedDevices, searchQuery]);

  return {
    selectedDate,
    setSelectedDate,
    loading,
    searchQuery,
    setSearchQuery,
    devices: filteredDevices,
    totalDevices: Object.keys(groupedDevices).length,
    totalUpdates: Object.keys(rawData).length,
  };
}

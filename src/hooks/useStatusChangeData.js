import { useState, useEffect, useMemo } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { prefixPath } from '../PathDb';

export default function useStatusChangeData() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rawData, setRawData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  useEffect(() => {
    setLoading(true);
    const dayRef = ref(database, `${prefixPath}/logging_db/STATUS_CHANGE/${year}/${month}/${day}`);

    const unsubscribe = onValue(dayRef, (snapshot) => {
      if (snapshot.exists()) {
        setRawData(snapshot.val());
      } else {
        setRawData({});
      }
      setLoading(false);
    }, (error) => {
      console.error('[useStatusChangeData] Error:', error);
      setRawData({});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [year, month, day]);

  // Group by orderId and sort transitions by timestamp
  const groupedOrders = useMemo(() => {
    const entries = Object.values(rawData);
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
      // Update trackingNumber if this entry has one
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

    // Sort transitions within each order
    Object.values(map).forEach((order) => {
      order.transitions.sort((a, b) => a.timestamp - b.timestamp);
    });

    return map;
  }, [rawData]);

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
    selectedDate,
    setSelectedDate,
    loading,
    searchQuery,
    setSearchQuery,
    orders: filteredOrders,
    totalOrders: Object.keys(groupedOrders).length,
  };
}

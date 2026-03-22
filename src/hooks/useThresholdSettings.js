// src/hooks/useThresholdSettings.js
import { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { thresholdDataDBPath, thresholdMessageDBPath } from '../PathDb';

export default function useThresholdSettings() {
  // State
  const [threshold, setThreshold] = useState('');
  const [message, setMessage] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load settings from Firebase
  useEffect(() => {
    const r = ref(database, thresholdMessageDBPath);
    const unsub = onValue(r, (snap) => {
      const val = snap.val();
      if (val) {
        setThreshold(val.threshold ?? '');
        setMessage(val.message ?? '');
        setUpdateDate(val.updateDate ?? '');
      }
    });
    return () => unsub();
  }, []);

  // Format current date/time
  const formatNow = () => {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    setError('');
    try {
      const data = {
        threshold: Number(threshold) || 0,
        updateDate: formatNow(),
        message: message || ''
      };
      await set(ref(database, thresholdMessageDBPath), data);
      await update(ref(database, thresholdDataDBPath()), { messageSent: null });
      setUpdateDate(data.updateDate);
      alert('Налаштування збережено');
    } catch (e) {
      console.error(e);
      setError('Помилка збереження до Firebase');
    } finally {
      setSaving(false);
    }
  };

  return {
    threshold,
    setThreshold,
    message,
    setMessage,
    updateDate,
    error,
    saving,
    saveSettings,
  };
}
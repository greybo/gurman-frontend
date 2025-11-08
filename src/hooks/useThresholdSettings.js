// src/hooks/useThresholdSettings.js
import { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { DB_PATH, usersTgDbPath } from '../PathDb';

export default function useThresholdSettings() {
  // State
  const [threshold, setThreshold] = useState('');
  const [message, setMessage] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usersTg, setUsersTg] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});

  // Load settings from Firebase
  useEffect(() => {
    const r = ref(database, DB_PATH);
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

  // Load Telegram users
  useEffect(() => {
    const usersRef = ref(database, `${usersTgDbPath}/`);
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsersTg(data);
        // console.info('Користувачі:', Object.entries(data).map(([key, user]) => '#' + key + ', name: ' + (user.name || 'n/a')).join(', '));
      } else {
        setUsersTg({});
        setError('Користувачів не знайдено');
      }
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setError('Помилка завантаження даних');
    }, { onlyOnce: true });
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
      await set(ref(database, DB_PATH), data);
      setUpdateDate(data.updateDate);
      alert('Налаштування збережено');
    } catch (e) {
      console.error(e);
      setError('Помилка збереження до Firebase');
    } finally {
      setSaving(false);
    }
  };

  // Handle checkbox for Telegram users
  const handleUserCheckBox = (chatId, field, checked) => {
    setUsersTg(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: checked
      }
    }));

    update(ref(database, `${usersTgDbPath}/${chatId}`), {
      [field]: checked,
    //   chatId: chatId
    });
  };

  return {
    // State
    threshold,
    setThreshold,
    message,
    setMessage,
    updateDate,
    error,
    saving,
    usersTg,
    selectedUsers,
    // Methods
    saveSettings,
    handleUserCheckBox
  };
}
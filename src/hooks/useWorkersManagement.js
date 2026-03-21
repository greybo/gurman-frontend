// src/hooks/useWorkersManagement.js
import { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, update, remove, push } from 'firebase/database';
import { workersDbPath, settingsAppDbPath, usersDbPath } from '../PathDb';

export default function useWorkersManagement() {
  const [workers, setWorkers] = useState({});
  const [kioskSettings, setKioskSettings] = useState({});
  const [kioskKey, setKioskKey] = useState(null);
  const [userEmails, setUserEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', pin: '' });

  // Завантаження робітників
  useEffect(() => {
    setLoading(true);
    const workersRef = ref(database, workersDbPath);

    const unsubWorkers = onValue(workersRef, (snapshot) => {
      if (snapshot.exists()) {
        setWorkers(snapshot.val());
        setError('');
      } else {
        setWorkers({});
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження робітників:', err);
      setError('Помилка завантаження робітників');
      setLoading(false);
    });

    return () => unsubWorkers();
  }, []);

  // Завантаження налаштувань кіоска
  useEffect(() => {
    const settingsRef = ref(database, settingsAppDbPath);

    const unsubSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const firstKey = Object.keys(data)[0];
        setKioskKey(firstKey);
        setKioskSettings(data[firstKey] || {});
      } else {
        setKioskSettings({});
      }
    }, (err) => {
      console.error('Помилка завантаження налаштувань кіоска:', err);
    });

    return () => unsubSettings();
  }, []);

  // Завантаження email користувачів для dropdown кіоска
  useEffect(() => {
    const usersRef = ref(database, usersDbPath);

    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const emails = Object.values(data)
          .map(u => u.email)
          .filter(Boolean);
        setUserEmails(emails);
      }
    }, () => {}, { onlyOnce: true });

    return () => unsubUsers();
  }, []);

  // Додавання нового робітника
  const addWorker = async () => {
    if (!newWorker.name.trim() || !newWorker.pin.trim()) {
      alert('Заповніть ім\'я та PIN');
      return;
    }

    setSaving(true);
    try {
      const workersRef = ref(database, workersDbPath);
      const newRef = push(workersRef);
      const objectId = newRef.key;

      await update(newRef, {
        name: newWorker.name.trim(),
        pin: newWorker.pin.trim(),
        active: true,
        createdAt: Date.now(),
        objectId
      });

      setNewWorker({ name: '', pin: '' });
      setIsAdding(false);
    } catch (err) {
      console.error('Помилка додавання робітника:', err);
      alert('Помилка додавання');
    } finally {
      setSaving(false);
    }
  };

  // Локальне оновлення поля робітника
  const updateWorkerField = (id, field, value) => {
    setWorkers(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // Збереження робітника в Firebase
  const saveWorker = async (id) => {
    if (!id) return;
    setSaving(true);

    try {
      const worker = workers[id];
      const workerRef = ref(database, `${workersDbPath}/${id}`);
      await update(workerRef, {
        name: worker.name || '',
        pin: worker.pin || '',
        active: worker.active ?? true,
        createdAt: worker.createdAt || Date.now(),
        objectId: worker.objectId || id
      });
      alert('Збережено');
    } catch (err) {
      console.error('Помилка збереження:', err);
      alert('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  // Видалення робітника
  const deleteWorker = async (id) => {
    const worker = workers[id];
    if (!confirm(`Видалити робітника "${worker?.name}"?`)) return;

    setSaving(true);
    try {
      const workerRef = ref(database, `${workersDbPath}/${id}`);
      await remove(workerRef);
      if (selectedWorkerId === id) setSelectedWorkerId(null);
    } catch (err) {
      console.error('Помилка видалення:', err);
      alert('Помилка видалення');
    } finally {
      setSaving(false);
    }
  };

  // Перемикання active статусу
  const toggleActive = async (id) => {
    const worker = workers[id];
    if (!worker) return;

    try {
      const workerRef = ref(database, `${workersDbPath}/${id}`);
      await update(workerRef, { active: !worker.active });
    } catch (err) {
      console.error('Помилка зміни статусу:', err);
      alert('Помилка зміни статусу');
    }
  };

  // Toggle кіоск-режиму
  const toggleKioskMode = async () => {
    if (!kioskKey) return;
    try {
      const settingsRef = ref(database, `${settingsAppDbPath}/${kioskKey}`);
      await update(settingsRef, { workerPinEnabled: !kioskSettings.workerPinEnabled });
    } catch (err) {
      console.error('Помилка зміни кіоск-режиму:', err);
      alert('Помилка зміни кіоск-режиму');
    }
  };

  // Встановлення email кіоска
  const setKioskEmail = async (email) => {
    if (!kioskKey) return;
    try {
      const settingsRef = ref(database, `${settingsAppDbPath}/${kioskKey}`);
      await update(settingsRef, { kioskEmail: email });
    } catch (err) {
      console.error('Помилка зміни email кіоска:', err);
      alert('Помилка зміни email');
    }
  };

  return {
    workers,
    kioskSettings,
    userEmails,
    loading,
    error,
    selectedWorkerId,
    setSelectedWorkerId,
    saving,
    isAdding,
    setIsAdding,
    newWorker,
    setNewWorker,
    addWorker,
    updateWorkerField,
    saveWorker,
    deleteWorker,
    toggleActive,
    toggleKioskMode,
    setKioskEmail
  };
}

// src/hooks/useWorkersManagement.js
import { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue, update, remove, push } from 'firebase/database';
import { workersDbPath, settingsAppDbPath, usersDbPath, usersTgDbPath } from '../PathDb';

// Helper functions to convert between hex color and ARGB integer
const hexToARGB = (hex) => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = 255;
  return (a << 24) | (r << 16) | (g << 8) | b;
};

const argbToHex = (argb) => {
  if (!argb) return '#3b82f6';
  const r = (argb >> 16) & 0xFF;
  const g = (argb >> 8) & 0xFF;
  const b = argb & 0xFF;
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function useWorkersManagement() {
  // Workers state
  const [workers, setWorkers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Kiosk settings state
  const [kioskSettings, setKioskSettings] = useState({});
  const [kioskKey, setKioskKey] = useState(null);

  // User emails for kiosk dropdown (from user_db_V2)
  const [userEmails, setUserEmails] = useState([]);

  // Adding new worker
  const [isAdding, setIsAdding] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', pin: '' });

  // Telegram dropdown state
  const [usersTg, setUsersTg] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  // Завантаження Telegram користувачів
  useEffect(() => {
    const tgRef = ref(database, usersTgDbPath);

    const unsubTg = onValue(tgRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsersTg(snapshot.val());
      } else {
        setUsersTg({});
      }
    }, () => {}, { onlyOnce: true });

    return () => unsubTg();
  }, []);

  // Sync searchTerm when selected worker changes
  useEffect(() => {
    if (selectedWorkerId && workers[selectedWorkerId]) {
      setSearchTerm(workers[selectedWorkerId].chatId || '');
    } else {
      setSearchTerm('');
    }
  }, [selectedWorkerId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- CRUD Workers ----

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
      setSelectedWorkerId(objectId);
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

  // Handle checkbox change for permissions (userRestrict)
  const handleCheckboxChange = (id, field, checked) => {
    setWorkers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        userRestrict: {
          ...prev[id]?.userRestrict,
          [field]: checked
        }
      }
    }));
  };

  // Select Chat ID from telegram dropdown
  const handleSelectChatId = (chatId) => {
    if (!selectedWorkerId) return;
    setSearchTerm(chatId);
    updateWorkerField(selectedWorkerId, 'chatId', chatId);
    setShowDropdown(false);
  };

  // Збереження робітника в Firebase
  const saveWorker = async (id) => {
    if (!id) return;
    setSaving(true);

    try {
      const worker = workers[id];
      const workerRef = ref(database, `${workersDbPath}/${id}`);

      // Convert hex color to ARGB integer for saving
      const colorValue = worker.color
        ? (typeof worker.color === 'string' ? hexToARGB(worker.color) : worker.color)
        : hexToARGB('#3b82f6');

      await update(workerRef, {
        name: worker.name || '',
        pin: worker.pin || '',
        active: worker.active ?? true,
        createdAt: worker.createdAt || Date.now(),
        objectId: worker.objectId || id,
        color: colorValue,
        chatId: searchTerm || worker.chatId || 0,
        userRestrict: {
          admin: worker.userRestrict?.admin || false,
          invoice: worker.userRestrict?.invoice || false,
          invoiceAll: worker.userRestrict?.invoiceAll || false,
          orderAll: worker.userRestrict?.orderAll || false,
          volumeAndParams: worker.userRestrict?.volumeAndParams || false,
          searchCode: worker.userRestrict?.searchCode || false,
          shop: worker.userRestrict?.shop || false,
          tasks: worker.userRestrict?.tasks || false,
        }
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

  // ---- Kiosk Settings ----

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

  // Filter Telegram users by search term
  const filteredUsersTg = Object.entries(usersTg).filter(([chatId, user]) => {
    const searchLower = searchTerm?.toLowerCase() || '';
    return chatId.includes(searchLower) || (user.name || '').toLowerCase().includes(searchLower);
  });

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
    handleCheckboxChange,
    saveWorker,
    deleteWorker,
    toggleActive,
    toggleKioskMode,
    setKioskEmail,
    // Telegram dropdown
    searchTerm,
    setSearchTerm,
    showDropdown,
    setShowDropdown,
    filteredUsersTg,
    handleSelectChatId,
    dropdownRef,
    // Color helpers
    argbToHex
  };
}

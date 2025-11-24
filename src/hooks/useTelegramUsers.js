// src/hooks/useTelegramUsers.js
import { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { usersTgDbPath } from '../PathDb';

export default function useTelegramUsers() {
  const [telegramUsers, setTelegramUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Завантаження користувачів Telegram
  useEffect(() => {
    setLoading(true);
    setError('');
    
    const usersRef = ref(database, usersTgDbPath);
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTelegramUsers(data);
      } else {
        setTelegramUsers({});
        setError('Telegram користувачів не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження Telegram користувачів:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Оновлення поля користувача
  const handleFieldChange = (chatId, field, value) => {
    setTelegramUsers(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: value
      }
    }));
  };

  // Збереження змін користувача
  const saveUser = async (chatId) => {
    if (!chatId) return;
    
    setSaving(true);
    setError('');

    try {
      const userToSave = telegramUsers[chatId];
      const userRef = ref(database, `${usersTgDbPath}/${chatId}`);
      
      await update(userRef, {
        chatId: userToSave.chatId,
        name: userToSave.name || 'n/a',
        text: userToSave.text || '',
        addedToList: userToSave.addedToList ?? true,
        scanThreshold: userToSave.scanThreshold ?? false,
        sendErrorMessage: userToSave.sendErrorMessage ?? false,
        updateId: userToSave.updateId ?? 0
      });

      alert('Зміни успішно збережено');
    } catch (err) {
      console.error('Помилка збереження:', err);
      setError('Помилка збереження даних');
      alert('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  // Видалення користувача
  const deleteUser = async (chatId) => {
    if (!confirm(`Видалити користувача ${chatId}?`)) return;
    
    setSaving(true);
    setError('');

    try {
      const userRef = ref(database, `${usersTgDbPath}/${chatId}`);
      await remove(userRef);
      
      setTelegramUsers(prevUsers => {
        const newUsers = { ...prevUsers };
        delete newUsers[chatId];
        return newUsers;
      });
      
      if (selectedUserId === chatId) {
        setSelectedUserId(null);
      }
      
      alert('Користувача видалено');
    } catch (err) {
      console.error('Помилка видалення:', err);
      setError('Помилка видалення користувача');
      alert('Помилка видалення');
    } finally {
      setSaving(false);
    }
  };

  // Фільтрація користувачів по пошуку
  const filteredUsers = Object.entries(telegramUsers).filter(([chatId, user]) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      chatId.includes(searchLower) ||
      (user.name || '').toLowerCase().includes(searchLower) ||
      (user.text || '').toLowerCase().includes(searchLower)
    );
  });

  return {
    telegramUsers,
    loading,
    error,
    selectedUserId,
    setSelectedUserId,
    saving,
    searchTerm,
    setSearchTerm,
    filteredUsers,
    handleFieldChange,
    saveUser,
    deleteUser
  };
}
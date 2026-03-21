// src/hooks/useUsersManagement.js
import { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { usersDbPath } from '../PathDb';

export default function useUsersManagement() {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [usersError, setUsersError] = useState('');

  // Fetch users from Firebase
  useEffect(() => {
    setLoading(true);
    setUsersError('');
    const usersRef = ref(database, usersDbPath);

    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsers(snapshot.val());
        setUsersError('');
      } else {
        setUsers({});
        setUsersError('Користувачів не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження користувачів:', err);
      setUsersError('Помилка завантаження даних');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    users,
    loading,
    usersError,
    selectedUserId,
    setSelectedUserId,
  };
}

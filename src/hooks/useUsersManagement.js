// src/hooks/useUsersManagement.js
import { useState, useEffect, useRef } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { database, firebaseConfig } from '../firebase';
import { ref, set, push } from 'firebase/database';
import { usersDbPath, prefixPath } from '../PathDb';
import { useAuth } from '../contexts/AuthContext';
import { USER_API_URL } from '../config';

export default function useUsersManagement() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [usersError, setUsersError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const secondaryAppRef = useRef(null);

  // Log admin action to Firebase
  const logAction = (action, targetEmail) => {
    const logRef = ref(database, `${prefixPath}/logging_db/adminWeb`);
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestamp = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    push(logRef, {
      action,
      targetEmail,
      admin: currentUser?.email || 'unknown',
      timestamp,
    });
  };

  // Fetch users from Cloud Function (Firebase Auth)
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${USER_API_URL}/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      // Convert array to object keyed by uid
      const usersObj = {};
      (data.users || []).forEach(u => {
        usersObj[u.uid] = u;
      });
      setUsers(usersObj);
      setUsersError('');
    } catch (err) {
      console.error('Помилка завантаження користувачів:', err);
      setUsersError('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setUsersError('');
    fetchUsers();

    return () => {
      if (secondaryAppRef.current) {
        deleteApp(secondaryAppRef.current).catch(() => {});
      }
    };
  }, []);

  // Register new user via secondary Firebase app (so current admin stays logged in)
  const registerUser = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      setUsersError('Введіть email та пароль');
      return;
    }
    if (newPassword.length < 6) {
      setUsersError('Пароль має містити мінімум 6 символів');
      return;
    }

    setSaving(true);
    setUsersError('');

    try {
      const secondaryApp = initializeApp(firebaseConfig, 'secondary-' + Date.now());
      secondaryAppRef.current = secondaryApp;
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const { uid, email } = userCredential.user;

      // Write user to database
      await set(ref(database, `${usersDbPath}/${uid}`), { uid, email });

      // Sign out and cleanup secondary app
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
      secondaryAppRef.current = null;

      logAction('register', email);

      // Reset form and refresh list
      setNewEmail('');
      setNewPassword('');
      setShowAddForm(false);
      await fetchUsers();
      alert('Користувача зареєстровано');
    } catch (err) {
      console.error('Помилка реєстрації:', err);
      if (err.code === 'auth/email-already-in-use') {
        setUsersError('Цей email вже зареєстровано');
      } else if (err.code === 'auth/invalid-email') {
        setUsersError('Невірний формат email');
      } else {
        setUsersError('Помилка реєстрації: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete user via Cloud Function (removes from Auth + Database)
  const deleteUser = async (uid) => {
    if (!confirm('Видалити користувача повністю (Auth + база)?')) return;

    const targetEmail = users[uid]?.email || uid;
    setSaving(true);
    setUsersError('');

    try {
      const res = await fetch(`${USER_API_URL}/users/${uid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');

      logAction('delete', targetEmail);

      if (selectedUserId === uid) setSelectedUserId(null);
      await fetchUsers();
      alert('Користувача видалено');
    } catch (err) {
      console.error('Помилка видалення:', err);
      setUsersError('Помилка видалення користувача');
    } finally {
      setSaving(false);
    }
  };

  // Disable/enable user via Cloud Function
  const toggleUserDisabled = async (uid, currentDisabled) => {
    const action = currentDisabled ? 'enable' : 'disable';
    const label = currentDisabled ? 'розблокувати' : 'заблокувати';
    if (!confirm(`${currentDisabled ? 'Розблокувати' : 'Заблокувати'} користувача?`)) return;

    const targetEmail = users[uid]?.email || uid;
    setSaving(true);
    setUsersError('');

    try {
      const res = await fetch(`${USER_API_URL}/users/${uid}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error(`Failed to ${action} user`);

      logAction(action, targetEmail);

      await fetchUsers();
      alert(`Користувача ${currentDisabled ? 'розблоковано' : 'заблоковано'}`);
    } catch (err) {
      console.error(`Помилка (${label}):`, err);
      setUsersError(`Помилка: не вдалось ${label} користувача`);
    } finally {
      setSaving(false);
    }
  };

  return {
    users,
    loading,
    usersError,
    selectedUserId,
    setSelectedUserId,
    saving,
    showAddForm,
    setShowAddForm,
    newEmail,
    setNewEmail,
    newPassword,
    setNewPassword,
    registerUser,
    deleteUser,
    toggleUserDisabled,
  };
}

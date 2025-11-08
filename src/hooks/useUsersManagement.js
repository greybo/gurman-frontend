// src/hooks/useUsersManagement.js
import { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { usersTgDbPath, usersDbPath } from '../PathDb';

export default function useUsersManagement() {
  // State
  const [users, setUsers] = useState({});
  const [currentUsersTg, setCurrentUsersTg] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [backupUser, setBackupUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersError, setUsersError] = useState('');
  const [usersTg, setUsersTg] = useState({});

  const dropdownRef = useRef(null);

  // Fetch users from Firebase
  const fetchUsers = () => {
    setLoading(true);
    setUsersError('');
    const usersRef = ref(database, usersDbPath);

    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsers(data);
      } else {
        setUsers({});
        setUsersError('Користувачів не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setUsersError('Помилка завантаження даних');
      setLoading(false);
    }, { onlyOnce: true });
  };

  // Load users when component mounts or activeItem changes
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load Telegram users and current user details
  useEffect(() => {
    const chatId = users[selectedUserId]?.chatId;
    setSearchTerm(chatId || '');
    if (!selectedUserId) return;

    const usersRef = ref(database, `${usersTgDbPath}/`);
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsersTg(data);
        const tg = data[chatId] || {};
        setCurrentUsersTg(tg);

        if (tg) {
          setBackupUser((user) => ({
            ...user,
            overScan: tg?.overScan || false,
            sendErrorMessage: tg?.sendErrorMessage || false,
          }));
        }

      } else {
        setUsersTg({});
        setUsersError('Користувачів не знайдено');
      }
    }, (err) => {
      console.error('Помилка завантаження:', err);
      setUsersError('Помилка завантаження даних');
    }, { onlyOnce: true });
  }, [selectedUserId]);

  // Set backup user when selected user changes
  useEffect(() => {
    if (!users || !selectedUserId) return;
    const user = users[selectedUserId] || null;
    setBackupUser(user);
  }, [selectedUserId]);

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

  // Handle input change for user form
  const handleInputChange = (userId, field, value) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [userId]: {
        ...prevUsers[userId],
        [field]: value
      }
    }));
  };

  // Handle checkbox change for permissions
  const handleCheckboxChange = (chatId, field, checked) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [chatId]: {
        ...prevUsers[chatId],
        [field]: checked
      }
    }));
  };

  // Select Chat ID from dropdown
  const handleSelectChatId = (chatId) => {
    setSearchTerm(chatId || '');
    setShowDropdown(false);
  };

  // Save user data to Firebase
  const handleSaveUser = async () => {
    if (!selectedUserId) return;

    setIsSaving(true);

    const userToSave = users[selectedUserId];

    const userRef = ref(database, `${usersDbPath}/${selectedUserId}`);
    console.info('Check id:', searchTerm);
    handleInputChange(selectedUserId, 'chatId', searchTerm || 0);
    try {
      await update(userRef, {
        chatId: searchTerm || 0,
        userId: userToSave.userId || '',
        email: userToSave.email || '',
        name: userToSave.name || '',
        overScan: userToSave.overScan || false,
        sendErrorMessage: userToSave.sendErrorMessage || false,
        invoice: userToSave.invoice || false,
        orderAll: userToSave.orderAll || false,
        volumeAndParams: userToSave.volumeAndParams || false,
        searchCode: userToSave.searchCode || false,
      });
    } catch (err) {
      console.error('Помилка збереження:', err);
      alert(`Помилка збереження для ${selectedUserId}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter Telegram users by search term
  const filteredUsersTg = Object.entries(usersTg).filter(([chatId, user]) => {
    const searchLower = searchTerm?.toLowerCase() || '';
    return chatId.includes(searchLower) || (user.name || '').toLowerCase().includes(searchLower);
  });

  return {
    // State
    users,
    currentUsersTg,
    loading,
    isSaving,
    selectedUserId,
    setSelectedUserId,
    backupUser,
    showDropdown,
    setShowDropdown,
    searchTerm,
    setSearchTerm,
    usersError,
    usersTg,
    filteredUsersTg,
    dropdownRef,
    // Methods
    fetchUsers,
    handleInputChange,
    handleCheckboxChange,
    handleSelectChatId,
    handleSaveUser
  };
}
// src/hooks/useUsersManagement.js
import { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { usersTgDbPath, usersDbPath } from '../PathDb';

// Helper functions to convert between hex color and ARGB integer
const hexToARGB = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = 255; // Full opacity

  // Combine into ARGB integer (A << 24 | R << 16 | G << 8 | B)
  return (a << 24) | (r << 16) | (g << 8) | b;
};

const argbToHex = (argb) => {
  if (!argb) return '#3b82f6'; // Default blue color

  // Extract RGBA components
  const a = (argb >> 24) & 0xFF;
  const r = (argb >> 16) & 0xFF;
  const g = (argb >> 8) & 0xFF;
  const b = argb & 0xFF;

  // Convert to hex
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

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
        console.log('Users data loaded:', data);
        setUsers(data);
        setUsersError(''); // Clear any previous errors
      } else {
        console.warn('No users found at path:', usersDbPath);
        setUsers({});
        setUsersError('Користувачів не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження користувачів:', err);
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
        console.warn('No Telegram users found at path:', usersTgDbPath);
        setUsersTg({});
        // Don't set usersError here - it's for main users, not Telegram users
      }
    }, (err) => {
      console.error('Помилка завантаження Telegram користувачів:', err);
      // Don't set usersError here - it's for main users, not Telegram users
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

  // Handle checkbox change for permissions (now in userRestrict)
  const handleCheckboxChange = (userId, field, checked) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [userId]: {
        ...prevUsers[userId],
        userRestrict: {
          ...prevUsers[userId]?.userRestrict,
          [field]: checked
        }
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

    // Convert hex color to ARGB integer for saving
    const colorValue = userToSave.color
      ? (typeof userToSave.color === 'string' ? hexToARGB(userToSave.color) : userToSave.color)
      : hexToARGB('#3b82f6');

    try {
      await update(userRef, {
        chatId: searchTerm || 0,
        uid: userToSave.uid || selectedUserId,
        email: userToSave.email || '',
        name: userToSave.name || '',
        pin: userToSave.pin || '',
        color: colorValue,
        userRestrict: {
          admin: userToSave.userRestrict?.admin || false,
          invoice: userToSave.userRestrict?.invoice || false,
          invoiceAll: userToSave.userRestrict?.invoiceAll || false,
          orderAll: userToSave.userRestrict?.orderAll || false,
          volumeAndParams: userToSave.userRestrict?.volumeAndParams || false,
          searchCode: userToSave.userRestrict?.searchCode || false,
          shop: userToSave.userRestrict?.shop || false,
          tasks: userToSave.userRestrict?.tasks || false,
        }
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
    handleSaveUser,
    // Helpers
    argbToHex
  };
}
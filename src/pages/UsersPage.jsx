// src/pages/UsersPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue, update, push } from 'firebase/database';
import {
    Users, Hash, CheckCircle, AlertTriangle, Save, RefreshCw,
    Mail, FileText, Package, Boxes, SearchCode, UserCheck, ChevronDown
} from 'lucide-react';

// Використовуємо той самий префікс, що й в AnalyticsPage
const prefixPath = import.meta.env.VITE_FIREBASE_DB_PREFIX || 'release';

const usersDbPath = `${prefixPath}/user_db`;
const usersTgDbPath = `${prefixPath}/tg_user_db`;

export default function UsersPage() {
    const [users, setUsers] = useState({});
    const [usersTg, setUsersTg] = useState({});
    const [currentUsersTg, setCurrentUsersTg] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [backupUser, setBackupUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const dropdownRef = useRef(null);

    const fetchUsers = () => {
        setLoading(true);
        setError('');
        const usersRef = ref(database, usersDbPath);

        onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setUsers(data);
            } else {
                setUsers({});
                setError('Користувачів не знайдено');
            }
            setLoading(false);
        }, (err) => {
            console.error('Помилка завантаження:', err);
            setError('Помилка завантаження даних');
            setLoading(false);
        }, { onlyOnce: true });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
                setError('Користувачів не знайдено');
            }
        }, (err) => {
            console.error('Помилка завантаження:', err);
            setError('Помилка завантаження даних');
        }, { onlyOnce: true });
    }, [selectedUserId]);

    useEffect(() => {
        if (!users || !selectedUserId) return

        const user = users[selectedUserId] || null;
        setBackupUser(user);

    }, [selectedUserId]);

    // Закриття dropdown при кліку поза ним
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (userId, field, value) => {
        setUsers(prevUsers => ({
            ...prevUsers,
            [userId]: {
                ...prevUsers[userId],
                [field]: value
            }
        }));
    };

    const handleCheckboxChange = (chatId, field, checked) => {
        setUsers(prevUsers => ({
            ...prevUsers,
            [chatId]: {
                ...prevUsers[chatId],
                [field]: checked
            }
        }));
    };

    // Вибір chatId з dropdown
    const handleSelectChatId = (chatId) => {
        // handleInputChange(selectedUserId, 'chatId', chatId);
        setSearchTerm(chatId || '');
        setShowDropdown(false);
    };

    const handleSave = async () => {
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
        setBackupUser(userToSave);
    };

    const usersList = Object.entries(users);
    const selectedUser = selectedUserId ? users[selectedUserId] : null;
    // Фільтрація списку usersTg
    const chatIds = [];
    usersList?.forEach((u) => {
        console.info('chatIds:', u.chatId);

        chatIds.push(Number(u.chatId || 0));
    });
    console.info('chatIds:', JSON.stringify(chatIds));
    const filteredUsersTg = Object.entries(usersTg).filter(([chatId, user]) => {
        return !(user.chatId === Number(searchTerm) || chatIds?.includes(user.chatId));
    });
    const checkboxStyle = {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        accentColor: '#5b5fc7'
    };

    return (
        <div className="page-container">
            {/* Хедер та статистика */}
            <div className="analytics-header">
                <div className="analytics-title-section">
                    <Users size={32} className="analytics-icon" />
                    <div>
                        <h1 className="analytics-title">Управління користувачами</h1>
                    </div>
                </div>
            </div>

            <div className="files-layout">
                {/* Ліва панель - Список користувачів */}
                <div className="files-sidebar">
                    <div className="files-header">
                        <h2 className="files-title">
                            <Users size={20} />
                            Користувачі ({usersList.length})
                        </h2>
                    </div>
                    {loading ? (
                        <div className="sidebar-loading">
                            <div className="spinner"></div>
                        </div>
                    ) : <div className="files-list">
                        {usersList.map(([userId, user]) => (
                            <div
                                key={userId}
                                onClick={() => setSelectedUserId(userId)}
                                className={`file-item ${selectedUserId === userId ? 'active' : ''}`}
                            >
                                <div className="file-content">
                                    <div className="file-header">
                                        <div className="file-name">
                                            <UserCheck size={18} />
                                            {user.name || 'n/a'}
                                        </div>
                                    </div>
                                    <div className="file-details">
                                        <span className="file-stat">
                                            <Hash size={14} />
                                            {user.chatId}
                                        </span>
                                        <br />
                                        <span className="file-stat">
                                            <Mail size={14} />
                                            {user.email || 'n/a'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>

                {/* Права панель - Редактор */}
                <div className="files-content">
                    {loading && (
                        <div className="content-loading">
                            <div className="spinner"></div>
                        </div>
                    )}

                    {!selectedUser && !loading && (
                        <div className="empty-content">
                            <Users size={80} />
                            <h3>Виберіть користувача</h3>
                            <p>Натисніть на користувача у списку, щоб переглянути його дані</p>
                        </div>
                    )}

                    {selectedUser && !loading && (
                        <>
                            <div className="content-header" style={{ alignItems: 'center' }}>
                                <div>
                                    <h2 className="content-title">{selectedUser.name || 'n/a'}</h2>
                                    <div className="content-meta">
                                        <span>ID: {selectedUser.chatId}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    className="backend-upload-button"
                                    style={{ padding: '10px 24px', fontSize: '15px' }}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <RefreshCw size={18} className="animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                                </button>
                            </div>

                            {/* Форма редагування */}
                            <div className="user-edit-form">
                                {/* Основна інформація */}
                                <div className="form-grid">
                                    <div className="form-group-flex">
                                        <label className="form-label"><Users size={18} /> Name</label>
                                        <input
                                            type="text"
                                            value={selectedUser.name || ''}
                                            onChange={(e) => handleInputChange(selectedUserId, 'name', e.target.value)}
                                            placeholder="n/a"
                                            className="form-input"
                                            disabled={backupUser?.name}
                                        />
                                    </div>
                                    <div className="form-group-flex">
                                        <label className="form-label"><Mail size={18} /> Email</label>
                                        <input
                                            type="text"
                                            value={selectedUser.email || ''}
                                            onChange={(e) => handleInputChange(selectedUserId, 'email', e.target.value)}
                                            placeholder="n/a"
                                            className="form-input"
                                            disabled={backupUser?.email}
                                        />
                                    </div>
                                    <div className="form-group-flex">
                                        <label className="form-label"><Hash size={18} /> Chat ID</label>
                                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    value={searchTerm || selectedUser.chatId || ''}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        handleInputChange(selectedUserId, 'chatId', e.target.value);
                                                        setShowDropdown(true);
                                                    }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    placeholder="Почніть вводити chatId або ім'я"
                                                    className="form-input"
                                                    disabled={backupUser?.chatId}
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                {!backupUser?.chatId && <ChevronDown
                                                    size={20}
                                                    style={{
                                                        position: 'absolute',
                                                        // right: '12px', 
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        cursor: 'pointer',
                                                        color: '#666'
                                                    }}
                                                    onClick={() => !backupUser?.chatId && setShowDropdown(!showDropdown)}
                                                />}
                                            </div>

                                            {showDropdown && !backupUser?.chatId && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    zIndex: 1000,
                                                    marginTop: '4px'
                                                }}>
                                                    {filteredUsersTg.length > 0 ? (
                                                        filteredUsersTg.map(([chatId, user]) => (
                                                            <div
                                                                key={chatId}
                                                                onClick={() => handleSelectChatId(chatId)}
                                                                style={{
                                                                    padding: '12px 16px',
                                                                    cursor: 'pointer',
                                                                    borderBottom: '1px solid #f0f0f0',
                                                                    transition: 'background-color 0.2s',
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                                            >
                                                                <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                                                                    <Hash size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                                                    {chatId}
                                                                </div>
                                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                                    <Users size={12} style={{ display: 'inline', marginRight: '6px' }} />
                                                                    {user.name || 'Без імені'}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                                                            Користувачів не знайдено
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Чекбокси дозволів */}
                                <h3 className="form-section-title">Дозволи</h3>
                                <div className="checkbox-grid">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedUser.overScan}
                                            onChange={(e) => handleCheckboxChange(selectedUserId, 'overScan', e.target.checked)}
                                            style={checkboxStyle}
                                            disabled={!currentUsersTg?.chatId}
                                        />
                                        <CheckCircle /> Перевищення сканування
                                    </label>

                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedUser.sendErrorMessage}
                                            onChange={(e) => handleCheckboxChange(selectedUserId, 'sendErrorMessage', e.target.checked)}
                                            style={checkboxStyle}
                                            disabled={!currentUsersTg?.chatId}
                                        />
                                        <AlertTriangle /> Повідомляти про помилки
                                    </label>

                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedUser.invoice}
                                            onChange={(e) => handleCheckboxChange(selectedUserId, 'invoice', e.target.checked)}
                                            style={checkboxStyle}
                                        />
                                        <FileText /> Накладна
                                    </label>

                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedUser.orderAll}
                                            onChange={(e) => handleCheckboxChange(selectedUserId, 'orderAll', e.target.checked)}
                                            style={checkboxStyle}
                                        />
                                        <Package /> Замовленя
                                    </label>

                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedUser.volumeAndParams}
                                            onChange={(e) => handleCheckboxChange(selectedUserId, 'volumeAndParams', e.target.checked)}
                                            style={checkboxStyle}
                                        />
                                        <Boxes /> Об'єми та Розміщення
                                    </label>

                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedUser.searchCode}
                                            onChange={(e) => handleCheckboxChange(selectedUserId, 'searchCode', e.target.checked)}
                                            style={checkboxStyle}
                                        />
                                        <SearchCode /> Пошук коду
                                    </label>
                                </div>

                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
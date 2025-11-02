// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, update, push } from 'firebase/database';
import {
    Users, Hash, CheckCircle, AlertTriangle, Save, RefreshCw,
    Mail, FileText, Package, Boxes, SearchCode, UserCheck
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
    const [isSaving, setIsSaving] = useState(false); // Тепер це один прапорець
    const [selectedUserId, setSelectedUserId] = useState(null); // ID вибраного користувача
    const [backupUser, setBackupUser] = useState(null);

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
        setLoading(true);
        const usersRef = ref(database, `${usersTgDbPath}/`);
        onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setUsersTg(data);
                const chatId = users[selectedUserId]?.chatId;
                // console.info('Users (TG):', data);
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
            setLoading(false);
        }, (err) => {
            console.error('Помилка завантаження:', err);
            setError('Помилка завантаження даних');
            setLoading(false);
        }, { onlyOnce: true });
    }, [selectedUserId]);

    useEffect(() => {
        if (!users || !selectedUserId) {
            return;
        }

        const user = users[selectedUserId] || null;
        setBackupUser(user);

    }, [selectedUserId]);

    // Обробники, як і раніше, змінюють загальний стан 'users'
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

    // Збереження працює для вибраного користувача
    const handleSave = async () => {
        if (!selectedUserId) return;

        setIsSaving(true);

        const userToSave = users[selectedUserId];

        // const updates = {};
        // updates[`/some/tg_user_db/${userTgToSave.chatId}`] = { testField: "testField" };
        // updates[`/some/tg_user_db/${userTgToSave.chatId}/name`] = userToSave.name || '';
        // updates[`/some/tg_user_db/${userTgToSave.chatId}/email`] = userToSave.email || '';
        // updates[`/some/tg_user_db/${userTgToSave.chatId}/otherField`] = "otherValue 1";
        // await update(ref(database), updates);

        const userRef = ref(database, `${usersDbPath}/${selectedUserId}`);
        // console.info('objectId:', selectedUserId);

        try {
            await update(userRef, {
                chatId: userToSave.chatId || 0,
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
    // console.info('User check data:', selectedUser?.name);

    // Стиль для чекбоксів
    const checkboxStyle = {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        accentColor: '#5b5fc7'
    };

    return (
        <div className="page-container">
            {/* Хедер та статистика залишаються зверху */}
            <div className="analytics-header">
                <div className="analytics-title-section">
                    <Users size={32} className="analytics-icon" />
                    <div>
                        <h1 className="analytics-title">Управління користувачами</h1>
                        {/* <p className="analytics-subtitle">Список користувачів з `release/tg_user_db`</p> */}
                    </div>
                </div>
                {/* <button onClick={fetchUsers} className="refresh-button" disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Оновити список
                </button> */}
            </div>

            {/* <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-value">{usersList.length}</div>
                    <div className="stat-label">Всього користувачів</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-value">{usersList.filter(([, u]) => u.addedToList).length}</div>
                    <div className="stat-label">Added To List</div>
                </div>
                <div className="stat-card error">
                    <div className="stat-value">{usersList.filter(([, u]) => u.sendErrorMessage).length}</div>
                    <div className="stat-label">Send Error</div>
                </div>
            </div> */}

            {/* Новий макет (використовуємо класи з FilesListPage) */}
            <div className="files-layout">
                {/* ========================== */}
                {/* Ліва панель - Список     */}
                {/* ========================== */}
                <div className="files-sidebar">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Користувачі ({usersList.length})</h2>
                    </div>

                    {loading && (
                        <div className="sidebar-loading">
                            <div className="spinner"></div>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    {usersList.length > 0 && <div className="files-list">
                        {usersList.map(([objectId, user]) => (
                            <div
                                key={objectId}
                                className={`file-item ${selectedUserId === objectId ? 'active' : ''}`}
                                onClick={() => setSelectedUserId(objectId)}
                            >
                                <div className="file-item-content">
                                    <UserCheck size={20} className="file-icon" />
                                    <div className="file-info">
                                        <h3 className="file-name">{user.name || 'n/a'}</h3>
                                        <div className="file-meta" style={{ marginTop: '4px' }}>
                                            <span className="file-meta-item">
                                                <Mail size={14} />
                                                {user.email || 'n/a'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>

                {/* ========================== */}
                {/* Права панель - Редактор   */}
                {/* ========================== */}
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
                                {/* Кнопка збереження тепер тут */}
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
                                        {/* <p className="form-static-text">{selectedUser.email || 'n/a'}</p> */}
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
                                        {/*<p className="form-static-text">{selectedUser.chatId}</p>*/}
                                        <input
                                            type="text"
                                            value={selectedUser.chatId || ''}
                                            onChange={(e) => handleInputChange(selectedUserId, 'chatId', e.target.value)}
                                            placeholder="n/a"
                                            className="form-input"
                                            disabled={backupUser?.chatId}
                                        />
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
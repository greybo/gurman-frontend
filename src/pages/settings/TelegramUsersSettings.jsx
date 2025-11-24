// src/pages/settings/TelegramUsersSettings.jsx
import React from 'react';
import {
    Users,
    Hash,
    Save,
    Trash2,
    Search,
    MessageSquare,
    CheckCircle,
    AlertTriangle,
    UserCheck,
    X
} from 'lucide-react';

export default function TelegramUsersSettings({
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
}) {
    const selectedUser = telegramUsers[selectedUserId];

    return (
        <div>
            <h2 className="content-title">Telegram Користувачі</h2>
            <p className="page-subtitle settings-subtitle-margin">
                Керуйте користувачами Telegram бота
            </p>

            {error && (
                <div className="error-message settings-error-margin">{error}</div>
            )}

            <div className="files-layout">
                {/* Ліва панель - список користувачів */}
                <div className="files-sidebar">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">
                            Користувачі ({Object.keys(telegramUsers).length})
                        </h2>
                    </div>

                    {/* Пошук */}
                    <div
                        style={{
                            marginTop: '24px',
                            marginBottom: '24px',
                            marginLeft: 'auto',  // <--- Центрує блок зліва
                            marginRight: 'auto', // <--- Центрує блок справа
                            position: 'relative',    // Батьківський контейнер для абсолютного позиціонування іконок
                            width: '95%',            // Ширина контейнера
                            maxWidth: '20em',        // Обмеження ширини, щоб поле не було на весь екран
                        }}
                    >
                        {/* Іконка лупи (зліва) */}
                        <Search
                            size={20}
                            className="search-icon"
                        />

                        {/* Поле вводу */}
                        <input
                            type="text"
                            placeholder="Пошук..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />

                        {/* Кнопка очищення (справа) - з'являється тільки якщо є текст */}
                        {searchTerm && (
                            <button
                                className="search-clear-button"
                                onClick={() => setSearchTerm('')}
                                title="Очистити"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="sidebar-loading">
                            <div className="spinner"></div>
                            <p>Завантаження...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="empty-sidebar">
                            <Users size={48} />
                            <p>
                                {searchTerm ? 'Нічого не знайдено' : 'Немає користувачів'}
                            </p>
                        </div>
                    ) : (
                        <div className="files-list">
                            {filteredUsers.map(([chatId, user]) => (
                                <div
                                    key={chatId}
                                    className={`file-item ${selectedUserId === chatId ? 'active' : ''}`}
                                    onClick={() => setSelectedUserId(chatId)}
                                >
                                    <div className="file-item-content">
                                        <Users size={20} className="file-icon" />
                                        <div className="file-info">
                                            <h3 className="file-name">{user.name || 'n/a'}</h3>
                                            <div className="file-meta">
                                                <span className="file-meta-item">
                                                    <Hash size={14} />
                                                    {chatId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteUser(chatId);
                                        }}
                                        className="delete-icon-button"
                                        title="Видалити"
                                        disabled={saving}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Права панель - редагування користувача */}
                <div className="files-content">
                    {!selectedUser && !loading ? (
                        <div className="empty-content">
                            <Users size={80} />
                            <h3>Виберіть користувача</h3>
                            <p>Натисніть на користувача у списку для редагування</p>
                        </div>
                    ) : selectedUser ? (
                        <>
                            <div className="content-header" style={{ alignItems: 'center' }}>
                                <div>
                                    <h2 className="content-title">{selectedUser.name || 'n/a'}</h2>
                                    <div className="content-meta">
                                        <span>Chat ID: {selectedUserId}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => saveUser(selectedUserId)}
                                    className="backend-upload-button"
                                    style={{ padding: '10px 24px', fontSize: '15px' }}
                                    disabled={saving}
                                >
                                    <Save size={18} />
                                    {saving ? 'Збереження...' : 'Зберегти зміни'}
                                </button>
                            </div>

                            {/* Форма редагування */}
                            <div className="user-edit-form">
                                {/* Базова інформація */}
                                <h3 className="form-section-title">Базова інформація</h3>
                                <div className="form-grid">
                                    <div className="form-group-flex">
                                        <label className="form-label">
                                            <Hash size={18} />
                                            Chat ID
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedUser.chatId || ''}
                                            className="form-input"
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group-flex">
                                        <label className="form-label">
                                            <UserCheck size={18} />
                                            Ім'я
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedUser.name || ''}
                                            onChange={(e) =>
                                                handleFieldChange(selectedUserId, 'name', e.target.value)
                                            }
                                            placeholder="n/a"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                {/* Налаштування */}
                                <h3 className="form-section-title">Налаштування</h3>
                                <div className="checkbox-grid">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedUser.addedToList ?? true}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    selectedUserId,
                                                    'addedToList',
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <CheckCircle size={20} />
                                        Додано до списку
                                    </label>

                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedUser.scanThreshold ?? false}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    selectedUserId,
                                                    'scanThreshold',
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <CheckCircle size={20} />
                                        Поріг сканування
                                    </label>

                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedUser.sendErrorMessage ?? false}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    selectedUserId,
                                                    'sendErrorMessage',
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <AlertTriangle size={20} />
                                        Відправляти повідомлення про помилки
                                    </label>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
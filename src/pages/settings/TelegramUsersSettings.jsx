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
        Керуйте користувачами Telegram бота.
      </p>
      <p className="page-subtitle settings-subtitle-margin">
        Посилання на Bot: https://t.me/GurmanInvoiceBot
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
          <div style={{ padding: '1em' }}>
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Пошук по Chat ID або імені..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{ width: '80%' }}
              />
              {searchTerm && (
                <button
                  className="search-clear-button"
                  onClick={() => setSearchTerm('')}
                  title="Очистити пошук"
                >
                  <X size={18} />
                </button>
              )}
            </div>
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
                        {/* <span className="file-meta-item">
                          <MessageSquare size={14} />
                          {user.text || 'немає тексту'}
                        </span> */}
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

                  {/* <div className="form-group-flex">
                    <label className="form-label">
                      <MessageSquare size={18} />
                      Текст повідомлення
                    </label>
                    <input
                      type="text"
                      value={selectedUser.text || ''}
                      onChange={(e) =>
                        handleFieldChange(selectedUserId, 'text', e.target.value)
                      }
                      placeholder="Немає тексту"
                      className="form-input"
                    />
                  </div> */}

                  {/* <div className="form-group-flex">
                    <label className="form-label">
                      <Hash size={18} />
                      Update ID
                    </label>
                    <input
                      type="number"
                      value={selectedUser.updateId ?? 0}
                    //   onChange={(e) =>
                    //     handleFieldChange(
                    //       selectedUserId,
                    //       'updateId',
                    //       parseInt(e.target.value) || 0
                    //     )
                    //   }
                      className="form-input"
                      disabled
                    />
                  </div> */}
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
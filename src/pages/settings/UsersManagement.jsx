// src/pages/settings/UsersManagement.jsx
import React from 'react';
import {
  Users, Hash, CheckCircle, AlertTriangle, Save, RefreshCw,
  Mail, FileText, Package, Boxes, SearchCode, ChevronDown
} from 'lucide-react';

export default function UsersManagement({
  users,
  loading,
  usersError,
  selectedUserId,
  setSelectedUserId,
  isSaving,
  handleSaveUser,
  backupUser,
  searchTerm,
  setSearchTerm,
  showDropdown,
  setShowDropdown,
  filteredUsersTg,
  handleSelectChatId,
  handleInputChange,
  handleCheckboxChange,
  currentUsersTg,
  dropdownRef
}) {
  const selectedUser = users[selectedUserId] || {};

  return (
    <div className="users-management-container">
      <h2 className="content-title">Керування користувачами</h2>
      <p className="page-subtitle settings-subtitle-margin">Редагуйте дозволи та налаштування користувачів</p>

      {usersError && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {usersError}
        </div>
      )}

      <div className="users-management-grid">
        {/* Список користувачів */}
        <div className="users-list-panel">
          <h3>Користувачі</h3>
          {loading ? (
            <div className="users-loading">
              <RefreshCw size={20} />
              <p>Завантаження...</p>
            </div>
          ) : Object.keys(users).length > 0 ? (
            <div className="users-list-flex">
              {Object.entries(users).map(([userId, user]) => (
                <button
                  key={userId}
                  onClick={() => setSelectedUserId(userId)}
                  className={`user-list-button ${selectedUserId === userId ? 'active' : ''}`}
                >
                  <div className="user-list-item-name">{user.name || 'N/A'}</div>
                  <div className="user-list-item-email">{user.email || 'N/A'}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="users-empty-message">Користувачів не знайдено</p>
          )}
        </div>

        {/* Редагування користувача */}
        <div className="users-edit-panel">
          {selectedUserId ? (
            <div className="users-edit-content">
              <div className="users-edit-header">
                <h3>Редагування</h3>
                <button
                  onClick={handleSaveUser}
                  disabled={isSaving}
                  className="users-save-button"
                >
                  <Save size={16} />
                  {isSaving ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>

              {/* Базова інформація */}
              <div className="users-form-section">
                <h4 className="users-form-section-title">Базова інформація</h4>
                <div className="users-form-group">
                  <label className="users-form-label">
                    <Mail size={14} />
                    Email
                  </label>
                  <input
                    type="email"
                    className="users-form-input"
                    value={selectedUser.email || ''}
                    onChange={(e) => handleInputChange(selectedUserId, 'email', e.target.value)}
                    placeholder="user@example.com"
                    disabled
                  />
                </div>

                <div className="users-form-group">
                  <label className="users-form-label">
                    <Users size={14} />
                    Ім'я
                  </label>
                  <input
                    type="text"
                    className="users-form-input"
                    value={selectedUser.name || ''}
                    onChange={(e) => handleInputChange(selectedUserId, 'name', e.target.value)}
                    placeholder="Ім'я користувача"
                    disabled
                  />
                </div>

                <div className="users-form-group">
                  <label className="users-form-label">
                    <Hash size={14} />
                    Chat ID (Telegram)
                  </label>
                  <div className="users-form-input-wrapper" ref={dropdownRef}>
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
                      className="users-form-input"
                      disabled={backupUser?.chatId}
                    />
                    {!backupUser?.chatId && (
                      <button
                        className="users-dropdown-toggle"
                        onClick={() => !backupUser?.chatId && setShowDropdown(!showDropdown)}
                        type="button"
                      >
                        <ChevronDown size={18} />
                      </button>
                    )}

                    {showDropdown && !backupUser?.chatId && (
                      <div className="users-dropdown-menu">
                        {filteredUsersTg.length > 0 ? (
                          filteredUsersTg.map(([chatId, user]) => (
                            <div
                              key={chatId}
                              onClick={() => handleSelectChatId(chatId)}
                              className="users-dropdown-item"
                            >
                              <div className="users-dropdown-item-id">
                                <Hash size={12} />
                                {chatId}
                              </div>
                              <div className="users-dropdown-item-name">
                                <Users size={11} />
                                {user.name || 'Без імені'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="users-dropdown-empty">
                            Не знайдено
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Чекбокси дозволів */}
              <div>
                <h4 className="users-form-section-title">Дозволи</h4>
                <div className="users-permissions-grid">
                  <label className="users-permission-label">
                    <input
                      type="checkbox"
                      checked={!!selectedUser.overScan}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'overScan', e.target.checked)}
                      disabled={!currentUsersTg?.chatId}
                    />
                    <CheckCircle size={16} />
                    Перевищення сканування
                  </label>

                  <label className="users-permission-label">
                    <input
                      type="checkbox"
                      checked={!!selectedUser.sendErrorMessage}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'sendErrorMessage', e.target.checked)}
                      disabled={!currentUsersTg?.chatId}
                    />
                    <AlertTriangle size={16} />
                    Повідомляти про помилки
                  </label>

                  <label className="users-permission-label">
                    <input
                      type="checkbox"
                      checked={!!selectedUser.invoice}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'invoice', e.target.checked)}
                    />
                    <FileText size={16} />
                    Накладна
                  </label>

                  <label className="users-permission-label">
                    <input
                      type="checkbox"
                      checked={!!selectedUser.orderAll}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'orderAll', e.target.checked)}
                    />
                    <Package size={16} />
                    Замовленя
                  </label>

                  <label className="users-permission-label">
                    <input
                      type="checkbox"
                      checked={!!selectedUser.volumeAndParams}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'volumeAndParams', e.target.checked)}
                    />
                    <Boxes size={16} />
                    Об'єми та Розміщення
                  </label>

                  <label className="users-permission-label">
                    <input
                      type="checkbox"
                      checked={!!selectedUser.searchCode}
                      onChange={(e) => handleCheckboxChange(selectedUserId, 'searchCode', e.target.checked)}
                    />
                    <SearchCode size={16} />
                    Пошук коду
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="users-edit-placeholder">
              Виберіть користувача зі списку
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
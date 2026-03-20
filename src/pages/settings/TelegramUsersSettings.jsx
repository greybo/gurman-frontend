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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Telegram Користувачі</h2>
            <p className="text-gray-600 mb-6">
                Керуйте користувачами Telegram бота
            </p>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Ліва панель - список користувачів */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-4">
                        <h2 className="font-bold text-gray-900">
                            Користувачі ({Object.keys(telegramUsers).length})
                        </h2>
                    </div>

                    {/* Пошук */}
                    <div className="relative mb-6">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Пошук..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pl-10 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setSearchTerm('')}
                                title="Очистити"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm">Завантаження...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <Users size={48} className="text-gray-300" />
                            <p className="text-gray-500 text-sm">
                                {searchTerm ? 'Нічого не знайдено' : 'Немає користувачів'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers.map(([chatId, user]) => (
                                <div
                                    key={chatId}
                                    className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                                        selectedUserId === chatId
                                            ? 'bg-brand-50 border-brand-200'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setSelectedUserId(chatId)}
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 text-sm">{user.name || 'n/a'}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                            <Hash size={12} />
                                            {chatId}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteUser(chatId);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    {!selectedUser && !loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Users size={80} className="text-gray-300" />
                            <h3 className="font-semibold text-gray-900">Виберіть користувача</h3>
                            <p className="text-gray-600 text-sm">Натисніть на користувача у списку для редагування</p>
                        </div>
                    ) : selectedUser ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.name || 'n/a'}</h2>
                                    <div className="text-sm text-gray-600 mt-1">Chat ID: {selectedUserId}</div>
                                </div>
                                <button
                                    onClick={() => saveUser(selectedUserId)}
                                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={saving}
                                >
                                    <Save size={18} />
                                    {saving ? 'Збереження...' : 'Зберегти зміни'}
                                </button>
                            </div>

                            {/* Форма редагування */}
                            <div className="space-y-8">
                                {/* Базова інформація */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Базова інформація</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                <Hash size={18} />
                                                Chat ID
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedUser.chatId || ''}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Налаштування */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Налаштування</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                                                checked={selectedUser.addedToList ?? true}
                                                onChange={(e) =>
                                                    handleFieldChange(
                                                        selectedUserId,
                                                        'addedToList',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                <CheckCircle size={20} className="text-gray-600" />
                                                <span className="text-sm font-medium text-gray-900">Додано до списку</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                                                checked={selectedUser.scanThreshold ?? false}
                                                onChange={(e) =>
                                                    handleFieldChange(
                                                        selectedUserId,
                                                        'scanThreshold',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                <CheckCircle size={20} className="text-gray-600" />
                                                <span className="text-sm font-medium text-gray-900">Поріг сканування</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                                                checked={selectedUser.sendErrorMessage ?? false}
                                                onChange={(e) =>
                                                    handleFieldChange(
                                                        selectedUserId,
                                                        'sendErrorMessage',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                <AlertTriangle size={20} className="text-gray-600" />
                                                <span className="text-sm font-medium text-gray-900">Відправляти повідомлення про помилки</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
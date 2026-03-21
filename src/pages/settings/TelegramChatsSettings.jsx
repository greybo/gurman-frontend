// src/pages/settings/TelegramChatsSettings.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  User,
  X,
} from 'lucide-react';

export default function TelegramChatsSettings({
  conversations,
  messages,
  loading,
  messagesLoading,
  error,
  selectedChatId,
  setSelectedChatId,
  sending,
  searchTerm,
  setSearchTerm,
  filteredConversations,
  totalUnread,
  sendReply,
}) {
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Авто-скрол вниз при нових повідомленнях
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Форматування дати
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Ім'я користувача чату
  const getChatDisplayName = (chat) => {
    const parts = [chat.firstName, chat.lastName].filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
    if (chat.userName && chat.userName !== 'n/a') return `@${chat.userName}`;
    return `Chat ${chat.chatId}`;
  };

  // Відправка повідомлення
  const handleSend = async () => {
    if (!replyText.trim() || !selectedChatId || sending) return;

    try {
      await sendReply(selectedChatId, replyText.trim());
      setReplyText('');
    } catch {
      // Помилка обробляється в хуку
    }
  };

  // Enter для відправки, Shift+Enter для нового рядка
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedChat = conversations[selectedChatId];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Telegram Чати</h2>
      <p className="text-gray-600 mb-6">
        Перегляд та відповідь на повідомлення користувачів бота
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Ліва панель — Список бесід */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">
                Бесіди ({Object.keys(conversations).length})
              </h3>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>

            {/* Пошук */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-9 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Завантаження...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <MessageSquare size={40} className="text-gray-300" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'Нічого не знайдено' : 'Немає бесід'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map(([chatId, chat]) => (
                  <div
                    key={chatId}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      selectedChatId === chatId
                        ? 'bg-brand-50 border-l-2 border-l-brand-500'
                        : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                    }`}
                    onClick={() => setSelectedChatId(chatId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {getChatDisplayName(chat)}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {chat.lastMessage || 'Немає повідомлень'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-gray-400">
                          {formatTime(chat.lastMessageDate)}
                        </span>
                        {(chat.unreadCount || 0) > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Права панель — Чат */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          {!selectedChat ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <MessageSquare size={80} className="text-gray-300" />
              <h3 className="font-semibold text-gray-900">Виберіть бесіду</h3>
              <p className="text-gray-600 text-sm">Натисніть на бесіду у списку для перегляду</p>
            </div>
          ) : (
            <>
              {/* Заголовок чату */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <User size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getChatDisplayName(selectedChat)}
                  </h3>
                  <span className="text-xs text-gray-500">
                    ID: {selectedChatId}
                    {selectedChat.userName && selectedChat.userName !== 'n/a' && (
                      <> &middot; @{selectedChat.userName}</>
                    )}
                  </span>
                </div>
              </div>

              {/* Повідомлення */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50"
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <MessageSquare size={32} />
                    <p className="text-sm mt-2">Немає повідомлень</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg.messageId || index}
                      className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          msg.direction === 'out'
                            ? 'bg-brand-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        <div
                          className={`text-xs mt-1 ${
                            msg.direction === 'out' ? 'text-brand-200' : 'text-gray-400'
                          }`}
                        >
                          {formatTime(msg.date)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Інпут відповіді */}
              <div className="px-6 py-4 border-t border-gray-100 bg-white">
                <div className="flex items-end gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Введіть повідомлення..."
                    rows={1}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-none"
                    style={{ maxHeight: '120px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !replyText.trim()}
                    className="bg-brand-600 hover:bg-brand-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Надіслати"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// src/hooks/useTelegramChats.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { tgChatsDbPath } from '../PathDb';
import { TG_CHAT_API_URL } from '../config';

export default function useTelegramChats() {
  const [conversations, setConversations] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesUnsubscribeRef = useRef(null);

  // Завантаження списку бесід (без messages та _meta)
  useEffect(() => {
    setLoading(true);
    setError('');

    const chatsRef = ref(database, tgChatsDbPath);

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const filtered = {};
        for (const [key, value] of Object.entries(data)) {
          if (key === '_meta') continue;
          // Витягуємо тільки метадані чату, без messages
          const { messages: _msgs, ...chatMeta } = value;
          filtered[key] = chatMeta;
        }
        setConversations(filtered);
      } else {
        setConversations({});
      }
      setLoading(false);
    }, (err) => {
      console.error('Помилка завантаження чатів:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Підписка на повідомлення вибраного чату
  useEffect(() => {
    // Відписатись від попереднього чату
    if (messagesUnsubscribeRef.current) {
      messagesUnsubscribeRef.current();
      messagesUnsubscribeRef.current = null;
    }

    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);

    const messagesRef = ref(database, `${tgChatsDbPath}/${selectedChatId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const msgList = Object.values(data).sort((a, b) => a.date - b.date);
        setMessages(msgList);
      } else {
        setMessages([]);
      }
      setMessagesLoading(false);
    }, (err) => {
      console.error('Помилка завантаження повідомлень:', err);
      setMessagesLoading(false);
    });

    messagesUnsubscribeRef.current = unsubscribe;

    // Позначити чат як прочитаний
    markAsRead(selectedChatId);

    return () => {
      if (messagesUnsubscribeRef.current) {
        messagesUnsubscribeRef.current();
        messagesUnsubscribeRef.current = null;
      }
    };
  }, [selectedChatId]);

  // Загальна кількість непрочитаних
  const totalUnread = Object.values(conversations).reduce(
    (sum, chat) => sum + (chat.unreadCount || 0),
    0
  );

  // Фільтрація бесід по пошуку
  const filteredConversations = Object.entries(conversations)
    .filter(([chatId, chat]) => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        chatId.includes(searchLower) ||
        (chat.firstName || '').toLowerCase().includes(searchLower) ||
        (chat.lastName || '').toLowerCase().includes(searchLower) ||
        (chat.userName || '').toLowerCase().includes(searchLower)
      );
    })
    .sort(([, a], [, b]) => (b.lastMessageDate || 0) - (a.lastMessageDate || 0));

  // Відправити відповідь
  const sendReply = useCallback(async (chatId, text) => {
    if (!chatId || !text.trim()) return;

    setSending(true);
    setError('');

    try {
      const response = await fetch(`${TG_CHAT_API_URL}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: Number(chatId), text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Помилка відправки');
      }
    } catch (err) {
      console.error('Помилка відправки відповіді:', err);
      setError('Помилка відправки відповіді');
      throw err;
    } finally {
      setSending(false);
    }
  }, []);

  // Позначити як прочитане
  const markAsRead = useCallback(async (chatId) => {
    if (!chatId) return;

    try {
      await fetch(`${TG_CHAT_API_URL}/markRead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: Number(chatId) }),
      });
    } catch (err) {
      console.error('Помилка позначення як прочитане:', err);
    }
  }, []);

  return {
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
    markAsRead,
  };
}

import { useEffect, useState } from 'react';
import { onValue, ref, remove } from 'firebase/database';
import { database } from '../firebase';
import { auditSessionsDbPath } from '../PathDb';

/**
 * Hook для роботи зі списком сесій переобліку.
 * Реактивно слухає Firebase RTDB шлях `audit_sessions/`.
 */
export function useAuditSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionsRef = ref(database, auditSessionsDbPath);
    const unsubscribe = onValue(
      sessionsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const arr = Object.entries(data).map(([key, value]) => ({
            ...value,
            sessionId: key,
          }));
          // Сортуємо за датою створення (новіші зверху)
          arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setSessions(arr);
        } else {
          setSessions([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('useAuditSessions error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const deleteSession = async (sessionId) => {
    try {
      await remove(ref(database, `${auditSessionsDbPath}/${sessionId}`));
      return true;
    } catch (err) {
      console.error('deleteSession error:', err);
      setError(err.message);
      return false;
    }
  };

  return { sessions, loading, error, deleteSession };
}

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref, update } from 'firebase/database';
import { database } from '../firebase';
import { auditItemsDbPath } from '../PathDb';

/**
 * Hook для роботи з товарами конкретної сесії переобліку.
 * Реактивно слухає Firebase RTDB шлях `audit_items/{sessionId}/`.
 *
 * Повертає items + computed counts по статусах.
 */
export function useAuditItems(sessionId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const itemsRef = ref(database, auditItemsDbPath(sessionId));
    const unsubscribe = onValue(
      itemsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const arr = Object.entries(data).map(([key, value]) => ({
            ...value,
            productId: value.productId || key,
          }));
          setItems(arr);
        } else {
          setItems([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('useAuditItems error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [sessionId]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      unchecked: items.filter((i) => i.status === 'unchecked').length,
      checked: items.filter((i) => i.status === 'checked').length,
      discrepancy: items.filter((i) => i.status === 'discrepancy').length,
    };
  }, [items]);

  const resolveItem = async (productId, resolution, comment) => {
    if (!sessionId || !productId) return;
    const itemRef = ref(database, `${auditItemsDbPath(sessionId)}/${productId}`);
    await update(itemRef, {
      resolution, // 'approved' | 'rejected' | null
      resolutionComment: comment || '',
      resolvedAt: Date.now(),
    });
  };

  return { items, counts, loading, error, resolveItem };
}

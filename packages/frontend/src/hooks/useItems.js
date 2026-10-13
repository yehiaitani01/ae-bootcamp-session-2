import { useCallback, useEffect, useRef, useState } from 'react';
import { itemsApi } from '../api/items-api';

const toWritableFields = ({ name, description, due_date: dueDate, priority, color }) => ({
  name,
  description,
  due_date: dueDate,
  priority,
  color,
});

export function useItems(filters) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequest = useRef(0);

  const { status, priority, color, q, sort, order } = filters;

  const load = useCallback(async () => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    try {
      const result = await itemsApi.list({ status, priority, color, q, sort, order });
      if (requestId === latestRequest.current) {
        setItems(result);
        setError(null);
      }
    } catch (err) {
      if (requestId === latestRequest.current) {
        setError(`Couldn't load your tasks. ${err.message}`);
      }
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  }, [status, priority, color, q, sort, order]);

  useEffect(() => {
    load();
  }, [load]);

  const run = useCallback(
    async (action, failureMessage) => {
      try {
        const result = await action();
        setError(null);
        await load();
        return result;
      } catch (err) {
        await load();
        setError(`${failureMessage} ${err.message}`);
        throw err;
      }
    },
    [load],
  );

  const createItem = useCallback(
    (values) => run(() => itemsApi.create(values), "Couldn't save your task."),
    [run],
  );

  const updateItem = useCallback(
    (id, changes) => {
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
      );
      return run(() => itemsApi.update(id, changes), "Couldn't update your task.");
    },
    [run],
  );

  const removeItem = useCallback(
    (id) => run(() => itemsApi.remove(id), "Couldn't delete your task."),
    [run],
  );

  const restoreItem = useCallback(
    (item) =>
      run(async () => {
        const restored = await itemsApi.create(toWritableFields(item));
        return item.completed ? itemsApi.update(restored.id, { completed: true }) : restored;
      }, "Couldn't restore your task."),
    [run],
  );

  const duplicateItem = useCallback(
    (id) => run(() => itemsApi.duplicate(id), "Couldn't duplicate your task."),
    [run],
  );

  const reorderItems = useCallback(
    (ids) => {
      setItems((current) => {
        const byId = new Map(current.map((item) => [item.id, item]));
        const moved = ids.map((id) => byId.get(id)).filter(Boolean);
        const rest = current.filter((item) => !ids.includes(item.id));
        return [...moved, ...rest];
      });
      return run(() => itemsApi.reorder(ids), "Couldn't reorder your tasks.");
    },
    [run],
  );

  const clearCompleted = useCallback(
    () => run(() => itemsApi.removeCompleted(), "Couldn't clear completed tasks."),
    [run],
  );

  const dismissError = useCallback(() => setError(null), []);

  return {
    items,
    loading,
    error,
    dismissError,
    reload: load,
    createItem,
    updateItem,
    removeItem,
    restoreItem,
    duplicateItem,
    reorderItems,
    clearCompleted,
  };
}

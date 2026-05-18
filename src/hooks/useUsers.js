import { useState, useEffect, useCallback } from 'react';
import { fetchUsers } from '../api/users';

/**
 * Fetches the employee list from the API.
 * Exposes loading state, error state, and a retry function.
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchUsers();
      setUsers(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { users, loading, error, retry: load };
}

import { useState, useCallback, useEffect } from "react";
import { STORAGE_KEY } from "../constants";

/**
 * Manages authentication state.
 * - Reads saved session from localStorage on mount.
 * - Re-validates the saved user against the live `users` list.
 * - Exposes login / logout helpers.
 */
export function useAuth(users) {
  const [user, setUser] = useState(null);

  // Once users are loaded, restore session and validate
  useEffect(() => {
    if (!users.length) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      const found = users.find((u) => u.id === parsed.id);
      if (found) setUser(found);
      else localStorage.removeItem(STORAGE_KEY); // stale session
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [users]);

  const login = useCallback((u) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, login, logout };
}

import { useState, useEffect } from "react";
import Login from "./components/Login";
import Scanner from "./components/Scanner";
import "./index.css";

const BASE_URL = "https://fastapi.qurvii.com";
const STORAGE_KEY = "missing_pcs_user";

export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/getUsers`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        const list = json?.data ?? json;
        setUsers(Array.isArray(list) ? list : []);

        // Restore saved session after users are loaded
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            const found = (Array.isArray(list) ? list : []).find(
              (u) => u.id === parsed.id
            );
            if (found) setUser(found);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        setFetchError(err.message || "Users load nahi hue. Dobara try karein.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = (u) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin w-10 h-10 text-indigo-600 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-indigo-700 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  // ── Fetch error screen ──────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-1">Connection Error</p>
          <p className="text-red-500 text-sm mb-5">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) return <Login users={users} onLogin={handleLogin} />;
  return <Scanner user={user} onLogout={handleLogout} />;
}

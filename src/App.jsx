import { useState, useEffect } from 'react';
import Login from './components/Login';
import Scanner from './components/Scanner';
import UpdateScannedItem from './components/ui/UpdateScannedItem';
import './index.css';
import { BASE_URL, STORAGE_KEY } from './constants';

// ── Bottom Tab Bar (admin only) ───────────────────────────────────────────────

const ScanIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 8H3m18-8h.01M5 4H3m2 16H3" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function AdminTabBar({ activeTab, onChange }) {
  const tabs = [
    { key: 'scanner', label: 'Scanner', Icon: ScanIcon },
    { key: 'update', label: 'Update Times', Icon: ClockIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition
              ${activeTab === key
                ? 'text-indigo-600'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <Icon />
            <span>{label}</span>
            {activeTab === key && (
              <span className="absolute bottom-0 w-12 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeTab, setActiveTab] = useState('scanner');

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
            const found = (Array.isArray(list) ? list : []).find((u) => u.id === parsed.id);
            if (found) setUser(found);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        setFetchError(err.message || 'Users not found. Please try again.');
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
    setActiveTab('scanner');
  };

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (loadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-10 h-10 text-indigo-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-indigo-700 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  // ── Fetch error screen ────────────────────────────────────────────────────────
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

  // ── Role check ────────────────────────────────────────────────────────────────
  const isAdmin = user.locations?.some((loc) => loc.name === 'Updated Timestamps');

  // Regular user — Scanner only
  if (!isAdmin) {
    return <Scanner user={user} onLogout={handleLogout} />;
  }

  // Admin — Scanner + Update Timestamps with bottom tab bar
  return (
    <div className="relative">
      {/* Active tab content */}
      {activeTab === 'scanner' ? (
        <Scanner user={user} onLogout={handleLogout} />
      ) : (
        <UpdateScannedItem
          user={user}
          onLogout={handleLogout}
          users={users}
        />
      )}

      {/* Fixed bottom tab bar */}
      <AdminTabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

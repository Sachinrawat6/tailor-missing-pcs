import { useState, useEffect, useRef } from 'react';
import { ToastContainer, useToast } from './ui/Toast';
import { BASE_URL } from '../constants/index.js';

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'];
const AUTO_CLEAR_SECONDS = 5;

const STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SCANNING: 'scanning',
  DONE: 'done',
  ERROR: 'error',
};

export default function Scanner({ user, onLogout }) {
  const [styleNumber, setStyleNumber] = useState('');
  const [size, setSize] = useState('');
  const [status, setStatus] = useState(STATUS.IDLE);
  const [logs, setLogs] = useState([]);
  const [syncedCount, setSyncedCount] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [countdown, setCountdown] = useState(null);

  const countdownRef = useRef(null);
  const { toasts, toast, dismiss } = useToast();

  // ── Auto-clear after DONE ─────────────────────────────────────────────────
  useEffect(() => {
    if (status !== STATUS.DONE) return;

    setCountdown(AUTO_CLEAR_SECONDS);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          clearForm();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const addLog = (message, type = 'info') => {
    setLogs((prev) => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const clearForm = () => {
    clearInterval(countdownRef.current);
    setStyleNumber('');
    setSize('');
    setLogs([]);
    setSyncedCount(0);
    setScannedCount(0);
    setCountdown(null);
    setStatus(STATUS.IDLE);
  };

  const handleScan = async () => {
    if (!styleNumber.trim()) {
      toast.error('Enter style number.');
      return;
    }
    if (!size) {
      toast.error('Select a size.');
      return;
    }

    clearInterval(countdownRef.current);
    setLogs([]);
    setSyncedCount(0);
    setScannedCount(0);
    setCountdown(null);
    setStatus(STATUS.SYNCING);

    // ── Step 1: sync-orders ──────────────────────────────────────────────────
    const payload = [
      {
        channel: 'Missing Pcs',
        style_number: Number(styleNumber),
        size,
        color: 'other',
        found_in_inventory: false,
      },
    ];

    addLog(`Syncing — Style: ${styleNumber} | Size: ${size}`, 'info');
    toast.info(`Syncing style ${styleNumber} (${size})...`);

    let syncedOrders = [];
    try {
      const syncRes = await fetch(`${BASE_URL}/sync-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!syncRes.ok) throw new Error(`${syncRes.status} ${syncRes.statusText}`);

      const syncData = await syncRes.json();

      // Real API shape: { status, message, all_orders:[{order_id,...}], sync_id }
      if (syncData?.all_orders && Array.isArray(syncData.all_orders)) {
        syncedOrders = syncData.all_orders;
      } else if (Array.isArray(syncData)) {
        syncedOrders = syncData;
      } else if (syncData?.data && Array.isArray(syncData.data)) {
        syncedOrders = syncData.data;
      } else if (syncData?.order_id || syncData?.id) {
        syncedOrders = [syncData];
      } else {
        syncedOrders = [];
      }

      setSyncedCount(syncedOrders.length);
      addLog(`${syncedOrders.length} order(s) synced.`, 'success');
    } catch (err) {
      addLog(`Sync failed: ${err.message}`, 'error');
      toast.error(`Sync failed: ${err.message}`);
      setStatus(STATUS.ERROR);
      return;
    }

    if (syncedOrders.length === 0) {
      addLog('No orders to scan.', 'warn');
      toast.warn('No orders to scan.');
      setStatus(STATUS.DONE);
      return;
    }

    // ── Step 2: scan each order ──────────────────────────────────────────────
    setStatus(STATUS.SCANNING);
    let scanned = 0;

    for (const order of syncedOrders) {
      const orderId = order?.order_id ?? order?.id ?? order?.orderId;

      if (!orderId) {
        addLog(`Order ID not found: ${JSON.stringify(order).slice(0, 60)}`, 'warn');
        continue;
      }

      try {
        const scanRes = await fetch(`${BASE_URL}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId, user_id: user.id, user_location_id: 145 }),
        });

        if (!scanRes.ok) throw new Error(`${scanRes.status} ${scanRes.statusText}`);

        scanned++;
        setScannedCount(scanned);
        addLog(`Order #${orderId} scanned.`, 'success');
      } catch (err) {
        addLog(`Order #${orderId} scan error: ${err.message}`, 'error');
      }
    }

    const allOk = scanned === syncedOrders.length;
    setStatus(STATUS.DONE);
    addLog(
      `Complete! ${scanned}/${syncedOrders.length} orders scanned.`,
      allOk ? 'success' : 'warn'
    );

    if (allOk) {
      toast.success(
        `✓ ${scanned} order(s) scanned! Form will be automatically cleared in ${AUTO_CLEAR_SECONDS} seconds.`
      );
    } else {
      toast.warn(`${scanned}/${syncedOrders.length} orders scanned. Some failed.`);
    }
  };

  const isLoading = status === STATUS.SYNCING || status === STATUS.SCANNING;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 ">
      {/* Toast portal */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                {user.user_name.split('/')[0].trim()}
              </p>
              <p className="text-xs text-gray-400 leading-tight">ID: {user.id}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 rounded-lg px-3 py-1.5 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className=" max-w-xl mx-auto px-4 py-5 space-y-4 pb-24">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2
            className="text-lg font-bold text-gray-900 mb-5"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Missing Piece Scan
          </h2>

          <div className="space-y-4">
            {/* Style Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Style Number</label>
              <input
                type="number"
                value={styleNumber}
                onChange={(e) => setStyleNumber(e.target.value)}
                placeholder="Style number daalen..."
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
                {size && <span className="ml-2 text-indigo-600 font-semibold">— {size}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setSize(s)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold border transition active:scale-95
                      ${
                        size === s
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                      }
                      disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 text-base shadow-sm"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {status === STATUS.SYNCING ? 'Syncing...' : 'Scanning...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 8H3m18-8h.01M5 4H3m2 16H3"
                    />
                  </svg>
                  Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Card */}
        {(status !== STATUS.IDLE || logs.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {/* Summary + countdown */}
            {status === STATUS.DONE && (
              <>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                    <p
                      className="text-2xl font-bold text-green-600"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {syncedCount}
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-0.5">Orders Synced</p>
                  </div>
                  <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                    <p
                      className="text-2xl font-bold text-indigo-600"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {scannedCount}
                    </p>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">Orders Scanned</p>
                  </div>
                </div>

                {/* Countdown bar */}
                {countdown !== null && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">
                        Form {countdown}s mein clear hoga...
                      </span>
                      <button
                        onClick={() => {
                          clearInterval(countdownRef.current);
                          setCountdown(null);
                        }}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                      >
                        Stop
                      </button>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(countdown / AUTO_CLEAR_SECONDS) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Log list */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg
                    ${log.type === 'success' ? 'bg-green-50 text-green-700' : ''}
                    ${log.type === 'error' ? 'bg-red-50 text-red-600' : ''}
                    ${log.type === 'warn' ? 'bg-yellow-50 text-yellow-700' : ''}
                    ${log.type === 'info' ? 'bg-slate-50 text-gray-500' : ''}
                  `}
                >
                  <span className="text-xs opacity-40 mt-0.5 shrink-0 tabular-nums">
                    {log.time}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>

            {/* New Scan */}
            {status === STATUS.DONE && (
              <button
                onClick={clearForm}
                className="mt-4 w-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold py-2.5 rounded-xl transition text-sm"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

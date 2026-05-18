import { useState, useEffect, useCallback } from 'react';
import {
  fetchMissingPcsOrders,
  fetchScannedRecordsByOrderIds,
  updateScannedItems,
} from '../../api/nocodb.js';
import { ToastContainer, useToast } from './Toast.jsx';
import RecordCard, { toDatetimeLocal } from './RecordCard.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayIST() {
  return new Date().toLocaleDateString('en-CA');
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function RefreshIcon({ spin }) {
  return (
    <svg
      className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

// ── StatPill ──────────────────────────────────────────────────────────────────

function StatPill({ label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    green: 'bg-green-50 text-green-700 border-green-100',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${colors[color]}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-75">{label}</span>
    </div>
  );
}

// ── ScanRecordList ────────────────────────────────────────────────────────────

export default function ScanRecordList({ adminUser, targetEmployee, onChangeEmployee, onLogout }) {
  const [date, setDate] = useState(todayIST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [records, setRecords] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const { toasts, toast, dismiss } = useToast();

  const adminName = adminUser?.user_name?.split('/')[0]?.trim() ?? 'Admin';
  const targetName =
    targetEmployee?.user_name?.split('/')[0]?.trim() ?? `ID: ${targetEmployee?.id}`;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOrders([]);
    setRecords([]);
    setEditingId(null);

    try {
      const ordersList = await fetchMissingPcsOrders(date);
      setOrders(ordersList);

      const orderIds = [...new Set(ordersList.map((o) => o.order_id).filter(Boolean))];
      if (!orderIds.length) {
        setLoading(false);
        return;
      }

      const allRecords = await fetchScannedRecordsByOrderIds(orderIds);
      const filtered = allRecords.filter((r) => Number(r.user_id) === Number(targetEmployee?.id));
      setRecords(filtered);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [date, targetEmployee?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Edit / Save ────────────────────────────────────────────────────────────
  const handleEditStart = (record) => {
    setEditingId(record.system_id);
    setEditValue(toDatetimeLocal(record.scanned_timestamp));
  };

  const handleSave = async (record) => {
    if (!editValue) return;
    setSaving(true);
    try {
      await updateScannedItems(record.system_id, {
        scanned_timestamp: new Date(editValue).toISOString(),
      });
      toast.success(`Order #${record.order_id} updated!`);
      setEditingId(null);
      await loadData();
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br  from-slate-50 to-indigo-50">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardIcon />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                {adminName}
                <span className="ml-1.5 text-xs font-bold text-indigo-500">· Admin</span>
              </p>
              <p className="text-xs text-gray-400 leading-tight">ID: {adminUser?.id}</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200
                hover:border-red-300 hover:bg-red-50 rounded-lg px-3 py-1.5 transition shrink-0"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 pb-28">
        {/* Header card */}
        <div className="bg-white   rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold font-[Poppins] text-gray-900">
              Update Scan Timestamps
            </h2>
            <button
              onClick={onChangeEmployee}
              className="text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50
                rounded-lg px-3 py-1.5 transition shrink-0"
            >
              Change Employee
            </button>
          </div>

          {/* Selected employee badge */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
            <svg
              className="w-4 h-4 text-indigo-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm font-semibold text-indigo-700 truncate">{targetName}</span>
            <span className="text-xs text-indigo-400 ml-auto shrink-0">#{targetEmployee?.id}</span>
          </div>

          {/* Date picker + fetch */}
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              max={todayIST()}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700
                disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition active:scale-95"
            >
              <RefreshIcon spin={loading} />
              {loading ? 'Loading' : 'Fetch'}
            </button>
          </div>

          {/* Stats */}
          {!loading && !error && (
            <div className="flex gap-2 flex-wrap mt-4">
              <StatPill label="Orders Found" value={orders.length} color="indigo" />
              <StatPill label="Scans" value={records.length} color="green" />
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg className="animate-spin w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
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
            <p className="text-sm text-gray-400 font-medium">Fetching scan records…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-2">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button
              onClick={loadData}
              className="text-sm text-indigo-600 font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty — no orders */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-2xl mb-2">📦</p>
            <p className="text-gray-500 text-sm font-medium">No Missing Pcs orders found</p>
            <p className="text-gray-400 text-xs mt-1">Try a different date</p>
          </div>
        )}

        {/* Empty — no records for this employee */}
        {!loading && !error && orders.length > 0 && records.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-gray-500 text-sm font-medium">
              No scan records found for{' '}
              <span className="font-bold text-gray-700">{targetName}</span>
            </p>
            <p className="text-gray-400 text-xs mt-1">on {date}</p>
          </div>
        )}

        {/* Record grid — single col mobile, 2-col desktop */}
        {!loading && records.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-3">
              {targetName}&apos;s scans — {date}
            </p>
            <div className="grid grid-cols-1  gap-3">
              {records.map((record) => (
                <RecordCard
                  key={record.system_id}
                  record={record}
                  isEditing={editingId === record.system_id}
                  editValue={editValue}
                  onEditStart={handleEditStart}
                  onEditChange={setEditValue}
                  onCancel={() => {
                    setEditingId(null);
                    setEditValue('');
                  }}
                  onSave={handleSave}
                  saving={saving}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

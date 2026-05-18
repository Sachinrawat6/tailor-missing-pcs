// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatTimestamp(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function toDatetimeLocal(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── EditIcon ──────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

// ── RecordCard ────────────────────────────────────────────────────────────────

export default function RecordCard({
  record,
  props,
  isEditing,
  editValue,
  onEditStart,
  onEditChange,
  onCancel,
  onSave,
  saving,
}) {
  const getMatchedCreatedAt = (orderId) => {
    const createdAt = props.find((item) => item.order_id === orderId)?.created_at;
    return createdAt;
  };
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden
      ${isEditing ? 'border-indigo-300 shadow-md' : 'border-gray-100 shadow-sm'}`}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {record.style_number && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  Style #{record.style_number}
                </span>
              )}
              {record.size && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  {record.size}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Order ID: <span className="text-gray-700 font-semibold">#{record.order_id}</span>
            </p>

            {/* Created At and Scanned in same row */}
            {!isEditing && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                <p className="text-xs text-gray-400">
                  Created At:{' '}
                  <span className="text-gray-700 font-semibold">
                    {formatTimestamp(getMatchedCreatedAt(record.order_id))}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Scanned:{' '}
                  <span className="text-gray-700 font-medium">
                    {formatTimestamp(record.scanned_timestamp)}
                  </span>
                </p>
              </div>
            )}

            {!isEditing && (
              <>
                <p className="text-xs text-gray-400 mt-0.5">
                  Style No:{' '}
                  <span className="text-gray-700 font-medium">{record.orders_2?.style_number}</span>
                </p>
              </>
            )}
          </div>

          {!isEditing && (
            <button
              onClick={() => onEditStart(record)}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-indigo-600
                hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50
                rounded-lg px-3 py-1.5 transition"
            >
              <EditIcon />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-indigo-50/40">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Timestamp</label>
          <input
            type="datetime-local"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-indigo-200 rounded-xl text-sm text-gray-800
              bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Current: {formatTimestamp(record.scanned_timestamp)}
          </p>

          <p className="text-xs text-gray-400 mt-1">Style No: {record.orders_2?.style_number}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200
                rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(record)}
              disabled={saving || !editValue}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700
                rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

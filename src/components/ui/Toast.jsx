import { useEffect, useState } from 'react';

const ICONS = {
  success: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warn: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-500 text-white',
  warn:    'bg-yellow-500 text-white',
  info:    'bg-indigo-600 text-white',
};

/**
 * Single toast item — animates in, auto-dismisses after `duration` ms.
 */
function ToastItem({ id, message, type = 'info', duration = 3500, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in on next frame
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(id), 300); // wait for slide-out
    }, duration);

    return () => {
      cancelAnimationFrame(show);
      clearTimeout(hide);
    };
  }, [id, duration, onDismiss]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
        text-sm font-medium max-w-xs w-full
        transition-all duration-300
        ${STYLES[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {ICONS[type]}
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="opacity-70 hover:opacity-100 transition ml-1"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast container — fixed bottom-center on mobile, bottom-right on desktop.
 * Usage: <ToastContainer toasts={toasts} onDismiss={dismiss} />
 */
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 flex flex-col gap-2 items-center sm:items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/**
 * Hook — returns `toasts`, `toast(message, type)`, and `dismiss(id)`.
 *
 * toast.success('Done!')
 * toast.error('Failed!')
 * toast.warn('Warning')
 * toast.info('Info')
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const push = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  push.success = (msg) => push(msg, 'success');
  push.error   = (msg) => push(msg, 'error');
  push.warn    = (msg) => push(msg, 'warn');
  push.info    = (msg) => push(msg, 'info');

  return { toasts, toast: push, dismiss };
}

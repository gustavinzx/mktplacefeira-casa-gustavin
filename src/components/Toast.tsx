'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): Pick<ToastContextValue, 'showToast'> {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return { showToast: ctx.showToast };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 350);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, message, type, exiting: false }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast, toasts, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Icons & Colors ───────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const COLORS: Record<ToastType, { bg: string; icon: string; bar: string }> = {
  success: { bg: '#f0fdf4', icon: '#16a34a', bar: '#16a34a' },
  error:   { bg: '#fef2f2', icon: '#dc2626', bar: '#dc2626' },
  warning: { bg: '#fffbeb', icon: '#d97706', bar: '#d97706' },
  info:    { bg: '#eff6ff', icon: '#2563eb', bar: '#2563eb' },
};

// ─── Single Toast ─────────────────────────────────────────────────────────────

function ToastBubble({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { bg, icon: iconColor, bar: barColor } = COLORS[toast.type];
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const DURATION = 4000;

  useEffect(() => {
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className={`toast-item toast-${toast.exiting ? 'exit' : 'enter'}`}
      style={{ background: bg }}
      role="alert"
      aria-live="assertive"
    >
      <span className="toast-icon" style={{ color: iconColor }}>
        {ICONS[toast.type]}
      </span>
      <p className="toast-msg">{toast.message}</p>
      <button
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
      <div className="toast-progress-track">
        <div
          className="toast-progress-bar"
          style={{ width: `${progress}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

// ─── Container (reads from context — no props needed) ─────────────────────────

export function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, dismiss } = ctx;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(110%); }
        }
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }
        .toast-item {
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 14px 16px 20px;
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          min-width: 280px;
          max-width: 380px;
          overflow: hidden;
          pointer-events: all;
        }
        .toast-enter { animation: toastIn  0.35s cubic-bezier(0.22,1,0.36,1)    both; }
        .toast-exit  { animation: toastOut 0.35s cubic-bezier(0.55,0,1,0.45)   both; }
        .toast-icon  { display: flex; flex-shrink: 0; }
        .toast-msg   { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0; line-height: 1.4; }
        .toast-close {
          background: transparent; border: none; cursor: pointer;
          color: #999; display: flex; align-items: center; padding: 2px;
          border-radius: 6px; transition: color 0.15s;
        }
        .toast-close:hover { color: #333; }
        .toast-progress-track {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 4px; background: rgba(0,0,0,0.06);
        }
        .toast-progress-bar {
          height: 100%; border-radius: 0 0 14px 14px;
          transition: width 50ms linear;
        }
        @media (max-width: 480px) {
          .toast-container { top: 12px; right: 12px; left: 12px; }
          .toast-item { max-width: 100%; min-width: unset; }
        }
      `}</style>
      <div className="toast-container" aria-label="Notificações">
        {toasts.map(t => (
          <ToastBubble key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = { success: '✓', error: '✕', info: 'ℹ' };
const DURATION_MS = 3500;

/**
 * Remplace le `#toastMessage` unique de l'ancien frontend (qui ecrasait le
 * message precedent) par une vraie file empilable — plusieurs toasts peuvent
 * cohabiter, chacun se retire independamment.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className={styles.viewport} role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={[styles.toast, styles[toast.type]].join(' ')}>
              <span className={styles.icon} aria-hidden="true">
                {ICONS[toast.type]}
              </span>
              {toast.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast doit etre utilise a l\'interieur de <ToastProvider>');
  return context;
}

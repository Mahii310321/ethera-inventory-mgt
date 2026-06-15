import React, { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(
    () => ({
      notify(message, type = 'success') {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, message, type }]);
        window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => {
          const Icon = toast.type === 'error' ? XCircle : CheckCircle2;
          return (
            <div className={`toast ${toast.type}`} key={toast.id}>
              <Icon size={18} />
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, X, Info, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 4500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toast = React.useMemo(() => ({
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
  }), [addToast]);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950 border-emerald-800 text-slate-100',
          iconColor: 'text-emerald-400',
          progressBar: 'bg-emerald-500',
          Icon: CheckCircle2,
        };
      case 'error':
        return {
          bg: 'bg-rose-950 border-rose-800 text-slate-100',
          iconColor: 'text-rose-400',
          progressBar: 'bg-rose-500',
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-950 border-amber-800 text-slate-100',
          iconColor: 'text-amber-400',
          progressBar: 'bg-amber-500',
          Icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-100',
          iconColor: 'text-sky-400',
          progressBar: 'bg-sky-500',
          Icon: Info,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Alert Portal Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3.5 w-full max-w-sm pointer-events-none select-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const styles = getToastStyles(t.type);
            const Icon = styles.Icon;

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 100, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.25 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`pointer-events-auto border rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden flex items-start gap-3 w-full ${styles.bg}`}
              >
                {/* Status Indicator Icon */}
                <div className={`shrink-0 mt-0.5 ${styles.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Body Text */}
                <div className="flex-grow pr-4 space-y-0.5 text-left">
                  <span className="text-[10px] font-mono tracking-wider opacity-60 uppercase font-bold block">
                    {t.type} system signal
                  </span>
                  <p className="text-xs font-sans font-medium leading-relaxed leading-snug">
                    {t.message}
                  </p>
                </div>

                {/* Close Button Trigger */}
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Decorative Linear decay progress line */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (t.duration || 4500) / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-1 ${styles.progressBar}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

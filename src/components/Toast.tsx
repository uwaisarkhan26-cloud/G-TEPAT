import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div id="toast-container" className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        const colors = {
          success: 'bg-emerald-600 text-white shadow-emerald-200',
          error: 'bg-red-600 text-white shadow-red-200',
          info: 'bg-slate-900 text-white shadow-slate-200',
          warning: 'bg-amber-500 text-white shadow-amber-200'
        };

        const Icon = {
          success: CheckCircle2,
          error: AlertCircle,
          info: Info,
          warning: AlertTriangle
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl shadow-xl font-medium text-sm flex items-center justify-between gap-3 pointer-events-auto transition-all animate-fade-in ${colors[toast.type]}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/80 hover:text-white p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

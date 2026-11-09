import React from 'react';
import { DollarSign, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types/crm';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none select-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start space-x-3 p-3.5 rounded-xl shadow-xl border bg-white dark:bg-[#1a1f30] border-gray-200 dark:border-[#2b334d] transform transition-all duration-300 animate-in fade-in slide-in-from-top-3"
        >
          {toast.type === 'tip' || toast.type === 'ppv' ? (
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 font-bold" />
            </div>
          ) : toast.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {toast.title}
              </h4>
              {toast.amount && (
                <span className="text-xs font-bold font-mono-numbers text-amber-500">
                  +${toast.amount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
              {toast.description}
            </p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};


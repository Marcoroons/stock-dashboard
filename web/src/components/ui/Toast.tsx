import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, TriangleAlert as AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: { label: string; onClick: () => void }
}

interface NotificationContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 }
    setToasts(prev => [...prev, newToast])

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}

function NotificationContainer() {
  const { toasts, removeToast } = useNotification()

  return (
    <div className="fixed bottom-4 right-4 z-[1700] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  const colors = {
    success: {
      bg: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.25)',
      icon: '#10b981',
      text: '#10b981',
    },
    error: {
      bg: 'rgba(239,68,68,0.1)',
      border: 'rgba(239,68,68,0.25)',
      icon: '#ef4444',
      text: '#ef4444',
    },
    warning: {
      bg: 'rgba(245,158,11,0.1)',
      border: 'rgba(245,158,11,0.25)',
      icon: '#f59e0b',
      text: '#f59e0b',
    },
    info: {
      bg: 'rgba(59,130,246,0.1)',
      border: 'rgba(59,130,246,0.25)',
      icon: '#3b82f6',
      text: '#3b82f6',
    },
  }

  const color = colors[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 10, x: 100 }}
      className="pointer-events-auto"
    >
      <div
        className="rounded-[10px] p-4 border flex items-start gap-3 max-w-sm"
        style={{ background: color.bg, borderColor: color.border }}
      >
        <div style={{ color: color.icon }}>{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-[#f1f5f9]">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-[#94a3b8] mt-0.5">{toast.description}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-xs mt-2 font-medium transition-colors cursor-pointer"
              style={{ color: color.text }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[#64748b] hover:text-[#94a3b8] transition-colors flex-shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Convenience hooks
export function useToast() {
  const { addToast } = useNotification()
  return {
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),
  }
}

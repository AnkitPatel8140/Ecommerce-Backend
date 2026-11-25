import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev.slice(-3), { id, message, variant }])
      setTimeout(() => dismiss(id), 3600)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[#E6E3DC] bg-white px-4 py-3.5 shadow-xl"
            >
              {toast.variant === 'success' && <CheckCircle2 className="w-4 h-4 text-[#0D2D23] shrink-0 mt-0.5" />}
              {toast.variant === 'error' && <AlertCircle className="w-4 h-4 text-[#E15B44] shrink-0 mt-0.5" />}
              {toast.variant === 'info' && <Info className="w-4 h-4 text-[#627069] shrink-0 mt-0.5" />}
              <p className="text-xs sm:text-sm text-[#14221C] leading-relaxed flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-[#627069] hover:text-[#14221C] transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

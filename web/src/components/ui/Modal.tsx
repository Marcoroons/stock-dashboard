import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './Button'

interface Modal {
  id: string
  title?: string
  content: React.ReactNode
  actions?: { label: string; variant?: 'primary' | 'secondary' | 'danger'; onClick: () => void }[]
  onClose?: () => void
  size?: 'sm' | 'md' | 'lg'
  closeButton?: boolean
}

interface ModalContextValue {
  modals: Modal[]
  openModal: (modal: Omit<Modal, 'id'>) => string
  closeModal: (id: string) => void
  closeAll: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<Modal[]>([])

  const openModal = useCallback((modal: Omit<Modal, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setModals(prev => [...prev, { ...modal, id }])
    return id
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id)
      modal?.onClose?.()
      return prev.filter(m => m.id !== id)
    })
  }, [])

  const closeAll = useCallback(() => {
    setModals([])
  }, [])

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, closeAll }}>
      {children}
      <ModalContainer />
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}

function ModalContainer() {
  const { modals, closeModal } = useModal()

  return (
    <AnimatePresence>
      {modals.map((modal, index) => (
        <ModalBackdrop key={modal.id} onClose={() => closeModal(modal.id)}>
          <ModalContent
            modal={modal}
            onClose={() => closeModal(modal.id)}
            isTopmost={index === modals.length - 1}
          />
        </ModalBackdrop>
      ))}
    </AnimatePresence>
  )
}

function ModalBackdrop({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1500] flex items-center justify-center p-4"
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </motion.div>
  )
}

function ModalContent({
  modal,
  onClose,
  isTopmost,
}: {
  modal: Modal
  onClose: () => void
  isTopmost: boolean
}) {
  const sizeClass =
    modal.size === 'sm'
      ? 'max-w-sm'
      : modal.size === 'lg'
        ? 'max-w-2xl'
        : 'max-w-lg'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-card w-full ${sizeClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#1e1e3a]">
        {modal.title && (
          <h2 className="text-lg font-semibold text-[#f1f5f9]">{modal.title}</h2>
        )}
        <div className="flex-1" />
        {(modal.closeButton !== false || modal.title) && (
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-[#f1f5f9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 max-h-[60vh] overflow-y-auto">{modal.content}</div>

      {/* Actions */}
      {modal.actions && modal.actions.length > 0 && (
        <div className="flex gap-3 p-5 border-t border-[#1e1e3a] justify-end">
          {modal.actions.map((action, i) => (
            <Button
              key={i}
              variant={action.variant || 'secondary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Dialog helper
export function useDialog() {
  const { openModal, closeModal } = useModal()

  return {
    confirm: (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
    ) => {
      const id = openModal({
        title,
        content: <p className="text-sm text-[#94a3b8]">{message}</p>,
        actions: [
          { label: 'Cancel', variant: 'secondary', onClick: () => closeModal(id) },
          { label: 'Confirm', variant: 'primary', onClick: onConfirm },
        ],
        onClose: onCancel,
      })
    },
    alert: (title: string, message: string) => {
      const id = openModal({
        title,
        content: <p className="text-sm text-[#94a3b8]">{message}</p>,
        actions: [{ label: 'OK', variant: 'primary', onClick: () => closeModal(id) }],
      })
    },
  }
}

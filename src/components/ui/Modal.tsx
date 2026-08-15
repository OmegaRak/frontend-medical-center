import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  width?: string
}

export function Modal({ title, onClose, children, width = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${width} mx-4 overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-base font-bold text-dark">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-dark text-xl leading-none cursor-pointer transition-colors">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDeleteModal({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title="Confirmer la suppression" onClose={onClose}>
      <p className="text-sm text-dark mb-6">
        Supprimer <strong>{label}</strong> ? Cette action est irréversible.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button variant="danger" onClick={onConfirm}>Supprimer</Button>
      </div>
    </Modal>
  )
}

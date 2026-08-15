import type { ReactNode } from 'react'

type Variant = 'default' | 'success' | 'muted'

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'bg-primary-light text-primary',
  success: 'bg-success-light text-success',
  muted: 'bg-muted-light text-muted',
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: Variant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${VARIANT_CLASSES[variant]}`}>
      {children}
    </span>
  )
}

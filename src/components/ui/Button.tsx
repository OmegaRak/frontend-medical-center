import type { ReactNode } from 'react'

type Variant = 'primary' | 'teal' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primary text-white border-primary hover:bg-primary-hover active:scale-95',
  teal: 'bg-teal text-white border-teal hover:bg-teal-hover active:scale-95',
  ghost: 'bg-transparent text-primary border-transparent hover:bg-primary-light active:scale-95',
  danger: 'bg-white text-danger border-danger hover:bg-danger-light active:scale-95',
  outline: 'bg-white text-primary border-line hover:border-primary hover:bg-primary-light active:scale-95',
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}

export function Button({
  children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md transition-all cursor-pointer select-none border
        ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

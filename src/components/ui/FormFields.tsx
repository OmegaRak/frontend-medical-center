import type { ReactNode } from 'react'

interface InputProps {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoFocus?: boolean
  required?: boolean
}

export function Input({ label, value, onChange, placeholder, type = 'text', autoFocus, required }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-muted uppercase tracking-wide">
          {label}{required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required={required}
        className="w-full px-3 py-2 text-sm bg-white border border-line rounded-md text-dark placeholder-faint focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
      />
    </div>
  )
}

interface SelectProps {
  label?: string
  value: string
  onChange: (v: string) => void
  children: ReactNode
  required?: boolean
}

export function Select({ label, value, onChange, children, required }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-muted uppercase tracking-wide">
          {label}{required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 text-sm bg-white border border-line rounded-md text-dark focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all cursor-pointer"
      >
        {children}
      </select>
    </div>
  )
}

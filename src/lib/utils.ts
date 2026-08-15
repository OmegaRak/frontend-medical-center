export function newId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export const today = new Date().toISOString().split('T')[0]

export function formatDateFR(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString('fr-FR', options)
}

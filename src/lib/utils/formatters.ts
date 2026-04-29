export function formatPeso(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
  })
}

export function formatMonthShort(monthIndex: number): string {
  return new Date(2000, monthIndex, 1).toLocaleString('en-PH', { month: 'short' })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/** Strip Appwrite's non-plain prototype so objects can cross RSC → Client Component boundaries. */
export function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

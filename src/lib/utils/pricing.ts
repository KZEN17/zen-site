import type { RoomWithRates, RoomComboWithRates } from '@/types/admin'

export function getRateForGuestCount(room: RoomWithRates | RoomComboWithRates, guestCount: number): number | null {
  if (!room.rates || room.rates.length === 0) return null

  for (const rate of room.rates) {
    const label = rate.guests_label.toLowerCase()

    const upToMatch = label.match(/up to (\d+)/)
    if (upToMatch) {
      if (guestCount <= parseInt(upToMatch[1])) return rate.price
      continue
    }

    const rangeMatch = label.match(/(\d+)-(\d+)/)
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1])
      const max = parseInt(rangeMatch[2])
      if (guestCount >= min && guestCount <= max) return rate.price
      continue
    }

    const exactMatch = label.match(/^(\d+) pax/)
    if (exactMatch && guestCount === parseInt(exactMatch[1])) return rate.price
  }

  return room.rates[room.rates.length - 1]?.price ?? null
}

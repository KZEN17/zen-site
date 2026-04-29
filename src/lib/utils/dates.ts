import { eachDayOfInterval, format, getDaysInMonth, parseISO, subDays } from 'date-fns'
import type { Booking } from '@/types/admin'

export function getBookedDatesForRoom(bookings: Booking[]): Date[] {
  const dates: Date[] = []
  for (const booking of bookings) {
    if (booking.payment_status === 'cancelled') continue
    try {
      const start = parseISO(booking.check_in)
      const end = parseISO(booking.check_out)
      const lastBookedDate = subDays(end, 1)
      if (lastBookedDate < start) continue
      dates.push(...eachDayOfInterval({ start, end: lastBookedDate }))
    } catch {
      // skip malformed dates
    }
  }
  return dates
}

export function getCheckInDates(bookings: Booking[]): Date[] {
  return bookings
    .filter(b => b.payment_status !== 'cancelled')
    .map(b => parseISO(b.check_in))
}

export function getCheckOutDates(bookings: Booking[]): Date[] {
  return bookings
    .filter(b => b.payment_status !== 'cancelled')
    .map(b => parseISO(b.check_out))
}

export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function daysInMonth(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month - 1, 1))
}

export function getBookingForDate(date: Date, bookings: Booking[]): Booking | undefined {
  return bookings.find(b => {
    if (b.payment_status === 'cancelled') return false
    try {
      const start = parseISO(b.check_in)
      const end = parseISO(b.check_out)
      return date >= start && date < end
    } catch {
      return false
    }
  })
}

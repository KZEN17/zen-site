'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { parseISO } from 'date-fns'
import 'react-day-picker/style.css'
import { formatMonthYear } from '@/lib/utils/formatters'
import { formatISODate } from '@/lib/utils/dates'

interface Props {
  roomSlug: string
  roomName: string
}

interface AvailabilityResponse {
  roomName: string
  year: number
  month: number
  bookedDates: string[]
}

function toMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function shiftMonth(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

export default function RoomAvailabilityCalendar({ roomSlug, roomName }: Props) {
  const [month, setMonth] = useState(() => toMonthStart(new Date()))
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadAvailability() {
      try {
        setLoading(true)
        setError('')

        const year = month.getFullYear()
        const monthNumber = month.getMonth() + 1
        const response = await fetch(
          `/api/rooms/${roomSlug}/availability?year=${year}&month=${monthNumber}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(data?.error ?? 'Failed to load availability')
        }

        const data = (await response.json()) as AvailabilityResponse
        setBookedDates(data.bookedDates ?? [])
      } catch (err) {
        if (controller.signal.aborted) return
        setBookedDates([])
        setError(err instanceof Error ? err.message : 'Failed to load availability')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadAvailability()
    return () => controller.abort()
  }, [month, roomSlug])

  const bookedDateKeys = new Set(bookedDates)
  const bookedDateValues = bookedDates.map(date => parseISO(date))

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Availability Calendar</h2>
          <p className="text-sm text-gray-500 mt-1">Browse open and unavailable dates for {roomName}.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMonth(current => shiftMonth(current, -1))}
            className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
            aria-label="Previous month"
          >
            Prev
          </button>
          <span className="font-semibold text-gray-900 min-w-[150px] text-center">
            {formatMonthYear(month.getFullYear(), month.getMonth() + 1)}
          </span>
          <button
            type="button"
            onClick={() => setMonth(current => shiftMonth(current, 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
            aria-label="Next month"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-600 flex-wrap mt-4">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-100 border border-green-200 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-200 border border-red-300 inline-block" />
          Unavailable
        </span>
      </div>

      <div className="mt-6 min-h-[320px]">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="h-[320px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
        ) : (
          <>
            <DayPicker
              month={month}
              disableNavigation
              modifiers={{
                available: date =>
                  date.getFullYear() === month.getFullYear() &&
                  date.getMonth() === month.getMonth() &&
                  !bookedDateKeys.has(formatISODate(date)),
                booked: bookedDateValues,
              }}
              modifiersClassNames={{
                available: 'rdp-day-available',
                booked: 'rdp-day-booked',
              }}
              styles={{
                root: { '--rdp-font-size': '0.95rem' } as CSSProperties,
              }}
            />
            <p className="text-xs text-gray-500 mt-4">
              Dates marked unavailable already have an active booking for this room.
            </p>
          </>
        )}
      </div>

      <style>{`
        .rdp-day-available { background-color: #dcfce7; color: #166534; border-radius: 8px; }
        .rdp-day-booked { background-color: #fecaca; color: #991b1b; border-radius: 8px; font-weight: 600; }
        .rdp-day-available.rdp-today { color: #166534; box-shadow: inset 0 0 0 2px rgba(15, 23, 42, 0.18); }
        .rdp-day-booked.rdp-today { color: #991b1b; box-shadow: inset 0 0 0 2px rgba(15, 23, 42, 0.18); }
      `}</style>
    </section>
  )
}

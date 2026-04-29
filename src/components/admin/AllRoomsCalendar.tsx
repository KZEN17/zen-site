'use client'
import { useState } from 'react'
import type { Booking, Room } from '@/types/admin'
import RoomCalendar from '@/components/admin/RoomCalendar'
import { formatMonthYear } from '@/lib/utils/formatters'

interface Props {
  rooms: Room[]
  bookingsByRoom: Record<string, Booking[]>
  initialYear: number
  initialMonth: number
}

export default function AllRoomsCalendar({ rooms, bookingsByRoom, initialYear, initialMonth }: Props) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)

  const currentMonthDate = new Date(year, month - 1, 1)

  function prev() {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  function next() {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
        >
          ← Prev
        </button>
        <span className="font-semibold text-gray-900 min-w-[140px] text-center">
          {formatMonthYear(year, month)}
        </span>
        <button
          onClick={next}
          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
        >
          Next →
        </button>
      </div>

      <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-amber-100 inline-block" /> Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-200 inline-block" /> Check-in
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-blue-200 inline-block" /> Check-out
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map(room => (
          <RoomCalendar
            key={room.$id}
            roomName={room.name}
            bookings={bookingsByRoom[room.$id] ?? []}
            month={currentMonthDate}
          />
        ))}
      </div>
    </div>
  )
}

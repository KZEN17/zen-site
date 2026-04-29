'use client'
import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const year = initialYear
  const month = initialMonth

  const currentMonthDate = new Date(year, month - 1, 1)

  function goToMonth(nextYear: number, nextMonth: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', String(nextYear))
    params.set('month', String(nextMonth))

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  function prev() {
    if (month === 1) {
      goToMonth(year - 1, 12)
      return
    }

    goToMonth(year, month - 1)
  }

  function next() {
    if (month === 12) {
      goToMonth(year + 1, 1)
      return
    }

    goToMonth(year, month + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 text-sm transition-colors"
        >
          Prev
        </button>
        <span className="font-semibold text-gray-900 min-w-[140px] text-center">
          {formatMonthYear(year, month)}
        </span>
        <button
          onClick={next}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 text-sm transition-colors"
        >
          Next
        </button>
      </div>

      <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-100 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-red-200 inline-block" /> Booked
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

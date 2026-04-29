import { getRooms } from '@/lib/db/rooms'
import { getBookingsForCalendar } from '@/lib/db/bookings'
import AllRoomsCalendar from '@/components/admin/AllRoomsCalendar'
import type { Booking, Room } from '@/types/admin'

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.year ?? String(now.getFullYear()))
  const month = parseInt(params.month ?? String(now.getMonth() + 1))

  const [rawRooms, rawBookings] = await Promise.all([
    getRooms(),
    getBookingsForCalendar(year, month),
  ])

  // Appwrite rows have non-plain prototypes — serialize before passing to Client Component
  const rooms: Room[] = JSON.parse(JSON.stringify(rawRooms))
  const bookings: Booking[] = JSON.parse(JSON.stringify(rawBookings))
  const roomIds = new Set(rooms.map(room => room.$id))
  const roomIdsByName = new Map(rooms.map(room => [room.name.trim().toLowerCase(), room.$id]))

  const bookingsByRoom = bookings.reduce<Record<string, Booking[]>>((acc, b) => {
    const roomKey = roomIds.has(b.room_id)
      ? b.room_id
      : roomIdsByName.get(b.room_name.trim().toLowerCase()) ?? b.room_id

    if (!acc[roomKey]) acc[roomKey] = []
    acc[roomKey].push(b)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Room Calendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Availability overview for all rooms</p>
      </div>

      <AllRoomsCalendar
        rooms={rooms}
        bookingsByRoom={bookingsByRoom}
        initialYear={year}
        initialMonth={month}
      />
    </div>
  )
}

import Link from 'next/link'
import { getBookings } from '@/lib/db/bookings'
import { getRooms } from '@/lib/db/rooms'
import BookingTable from '@/components/admin/BookingTable'
import { formatMonthYear } from '@/lib/utils/formatters'

interface Props {
  searchParams: Promise<{ page?: string; status?: string; room_id?: string; month?: string }>
}

function getMonthRange(monthValue?: string): { from?: string; to?: string; label?: string } {
  if (!monthValue || !/^\d{4}-\d{2}$/.test(monthValue)) {
    return {}
  }

  const [year, month] = monthValue.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return {}
  }

  const lastDay = new Date(year, month, 0).getDate()
  return {
    from: `${monthValue}-01`,
    to: `${monthValue}-${String(lastDay).padStart(2, '0')}`,
    label: formatMonthYear(year, month),
  }
}

export default async function BookingsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const limit = 25
  const monthFilter = getMonthRange(params.month)

  const [bookingsResult, rooms] = await Promise.all([
    getBookings({
      status: params.status as import('@/types/admin').PaymentStatus | undefined,
      roomId: params.room_id,
      from: monthFilter.from,
      to: monthFilter.to,
      page,
      limit,
    }),
    getRooms(false),
  ])

  const { rows: bookings, total } = bookingsResult
  const selectedRoomId = params.room_id ?? ''
  const selectedRoom = rooms.find(room => room.$id === selectedRoomId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} {selectedRoom || monthFilter.label ? 'matching' : 'total'}
          </p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          + New Booking
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <form className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="room_id" className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              id="room_id"
              name="room_id"
              defaultValue={selectedRoomId}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All rooms</option>
              {rooms.map(room => (
                <option key={room.$id} value={room.$id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px]">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              id="month"
              name="month"
              type="month"
              defaultValue={params.month ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {params.status && <input type="hidden" name="status" value={params.status} />}

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Apply Filters
            </button>
            <Link
              href="/admin/bookings"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Clear
            </Link>
          </div>
        </form>

        {(selectedRoom || monthFilter.label) && (
          <p className="text-xs text-gray-500 mt-3">
            {selectedRoom ? `Room: ${selectedRoom.name}` : 'Room: all'}{selectedRoom && monthFilter.label ? ' · ' : ''}
            {monthFilter.label ? `Month: ${monthFilter.label}` : ''}
          </p>
        )}
      </div>

      <BookingTable bookings={bookings} total={total} page={page} limit={limit} />
    </div>
  )
}

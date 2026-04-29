import Link from 'next/link'
import { getBookings } from '@/lib/db/bookings'
import BookingTable from '@/components/admin/BookingTable'

interface Props {
  searchParams: Promise<{ page?: string; status?: string; room_id?: string }>
}

export default async function BookingsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const limit = 25

  const { rows: bookings, total } = await getBookings({
    status: params.status as import('@/types/admin').PaymentStatus | undefined,
    roomId: params.room_id,
    page,
    limit,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          + New Booking
        </Link>
      </div>

      <BookingTable bookings={bookings} total={total} page={page} limit={limit} />
    </div>
  )
}

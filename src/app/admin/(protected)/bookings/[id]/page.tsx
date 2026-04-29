import { notFound } from 'next/navigation'
import { getBookingById } from '@/lib/db/bookings'
import BookingForm from '@/components/admin/BookingForm'
import { formatDate, formatPeso } from '@/lib/utils/formatters'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params

  let booking
  try {
    booking = await getBookingById(id)
  } catch {
    notFound()
  }

  const balance = booking.total_amount - booking.down_payment

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Booking</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {booking.room_name} · {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
          {balance > 0 && (
            <span className="ml-2 text-amber-600 font-medium">Balance: {formatPeso(balance)}</span>
          )}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <BookingForm mode="edit" initialData={booking} />
      </div>
    </div>
  )
}

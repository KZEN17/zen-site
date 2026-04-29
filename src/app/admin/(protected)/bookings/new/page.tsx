import BookingForm from '@/components/admin/BookingForm'

export default function NewBookingPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Booking</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <BookingForm mode="create" />
      </div>
    </div>
  )
}

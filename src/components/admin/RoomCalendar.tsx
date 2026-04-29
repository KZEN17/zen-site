'use client'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import type { Booking } from '@/types/admin'
import { getBookedDatesForRoom, getCheckInDates, getCheckOutDates } from '@/lib/utils/dates'
import { formatPeso } from '@/lib/utils/formatters'

interface Props {
  roomName: string
  bookings: Booking[]
  month: Date
}

export default function RoomCalendar({ roomName, bookings, month }: Props) {
  const bookedDates = getBookedDatesForRoom(bookings)
  const checkInDates = getCheckInDates(bookings)
  const checkOutDates = getCheckOutDates(bookings)

  function getDayBooking(date: Date): Booking | undefined {
    return bookings.find(b => {
      if (b.payment_status === 'cancelled') return false
      const start = new Date(b.check_in + 'T00:00:00')
      const end = new Date(b.check_out + 'T00:00:00')
      return date >= start && date <= end
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 text-sm mb-3 truncate">{roomName}</h3>
      <DayPicker
        month={month}
        disableNavigation
        modifiers={{
          booked: bookedDates,
          checkIn: checkInDates,
          checkOut: checkOutDates,
        }}
        modifiersClassNames={{
          booked: 'rdp-day-booked',
          checkIn: 'rdp-day-checkin',
          checkOut: 'rdp-day-checkout',
        }}
        components={{
          Day: ({ day, ...props }) => {
            const booking = getDayBooking(day.date)
            return (
              <td {...props}>
                <div
                  title={
                    booking
                      ? `${booking.guest_name} · ${formatPeso(booking.total_amount)}`
                      : undefined
                  }
                >
                  {day.date.getDate()}
                </div>
              </td>
            )
          },
        }}
        styles={{
          root: { '--rdp-font-size': '0.75rem' } as React.CSSProperties,
        }}
      />
      <style>{`
        .rdp-day-booked { background-color: #fef3c7; color: #92400e; border-radius: 4px; }
        .rdp-day-checkin { background-color: #d1fae5 !important; color: #065f46 !important; font-weight: 700; }
        .rdp-day-checkout { background-color: #dbeafe !important; color: #1e40af !important; font-weight: 700; }
      `}</style>
    </div>
  )
}

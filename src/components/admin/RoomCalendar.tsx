'use client'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import type { Booking } from '@/types/admin'
import { getBookedDatesForRoom, getBookingForDate } from '@/lib/utils/dates'
import { formatPeso } from '@/lib/utils/formatters'

interface Props {
  roomName: string
  bookings: Booking[]
  month: Date
}

export default function RoomCalendar({ roomName, bookings, month }: Props) {
  const bookedDates = getBookedDatesForRoom(bookings)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 text-sm mb-3 truncate">{roomName}</h3>
      <DayPicker
        month={month}
        disableNavigation
        modifiers={{
          available: date =>
            date.getFullYear() === month.getFullYear() &&
            date.getMonth() === month.getMonth() &&
            !getBookingForDate(date, bookings),
          booked: bookedDates,
        }}
        modifiersClassNames={{
          available: 'rdp-day-available',
          booked: 'rdp-day-booked',
        }}
        components={{
          Day: ({ day, ...props }) => {
            const booking = getBookingForDate(day.date, bookings)
            return (
              <td {...props}>
                <div title={booking ? `${booking.guest_name} - ${formatPeso(booking.total_amount)}` : undefined}>
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
        .rdp-day-available { background-color: #dcfce7; color: #166534; border-radius: 6px; }
        .rdp-day-booked { background-color: #fecaca; color: #991b1b; border-radius: 6px; font-weight: 600; }
        .rdp-day-available.rdp-today { color: #166534; box-shadow: inset 0 0 0 2px rgba(15, 23, 42, 0.18); }
        .rdp-day-booked.rdp-today { color: #991b1b; box-shadow: inset 0 0 0 2px rgba(15, 23, 42, 0.18); }
      `}</style>
    </div>
  )
}

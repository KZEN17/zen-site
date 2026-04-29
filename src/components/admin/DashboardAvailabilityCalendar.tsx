import { getBookingForDate } from '@/lib/utils/dates'
import type { Booking, Room } from '@/types/admin'

interface Props {
  rooms: Room[]
  bookingsByRoom: Record<string, Booking[]>
  year: number
  month: number
}

function getMonthDays(year: number, month: number): Date[] {
  const lastDay = new Date(year, month, 0).getDate()
  return Array.from({ length: lastDay }, (_, index) => new Date(year, month - 1, index + 1))
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DashboardAvailabilityCalendar({
  rooms,
  bookingsByRoom,
  year,
  month,
}: Props) {
  const monthDays = getMonthDays(year, month)
  const monthStartsOn = new Date(year, month - 1, 1).getDay()
  const leadingEmptyCells = Array.from({ length: monthStartsOn }, (_, index) => `empty-${index}`)

  return (
    <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-800">Room Availability Calendar</h2>
          <p className="text-sm text-gray-500 mt-1">
            See which rooms are still open on each date. Days with no availability are marked fully booked.
          </p>
        </div>

        <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" />
            All rooms available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200 inline-block" />
            Some rooms available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-200 inline-block" />
            Fully booked
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px] space-y-3">
          <div className="grid grid-cols-7 gap-3">
            {WEEKDAY_LABELS.map(label => (
              <div
                key={label}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 text-center"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {leadingEmptyCells.map(key => (
              <div key={key} className="min-h-[150px] rounded-xl border border-transparent" />
            ))}

            {monthDays.map(date => {
              const availableRooms = rooms.filter(room => !getBookingForDate(date, bookingsByRoom[room.$id] ?? []))
              const isFullyBooked = availableRooms.length === 0
              const isAllAvailable = availableRooms.length === rooms.length
              const isToday = date.toDateString() === new Date().toDateString()

              const toneClasses = isFullyBooked
                ? 'border-red-200 bg-red-50'
                : isAllAvailable
                  ? 'border-green-200 bg-green-50'
                  : 'border-amber-200 bg-amber-50'

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[150px] rounded-xl border p-3 ${toneClasses}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        {date.toLocaleDateString('en-PH', { month: 'short' })}
                      </p>
                      <p className="text-xl font-bold text-gray-900">{date.getDate()}</p>
                    </div>
                    {isToday && (
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-900 text-white">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {isFullyBooked ? (
                      <p className="text-sm font-semibold text-red-700">Fully booked</p>
                    ) : (
                      <>
                        <p className={`text-sm font-semibold ${isAllAvailable ? 'text-green-700' : 'text-amber-700'}`}>
                          {isAllAvailable
                            ? `All ${rooms.length} rooms available`
                            : `${availableRooms.length} room${availableRooms.length === 1 ? '' : 's'} available`}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {availableRooms.map(room => (
                            <span
                              key={room.$id}
                              className="px-1.5 py-1 rounded-md text-[10px] leading-tight font-medium bg-white/80 text-gray-700 border border-white text-center"
                            >
                              {room.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

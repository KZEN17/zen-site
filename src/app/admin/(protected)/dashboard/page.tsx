import Link from 'next/link'
import { getBookings, getBookingsForCalendar, getCheckoutsOnDate, getUpcomingBookings } from '@/lib/db/bookings'
import { getRooms } from '@/lib/db/rooms'
import { getMonthlyReport } from '@/lib/db/reports'
import DashboardAvailabilityCalendar from '@/components/admin/DashboardAvailabilityCalendar'
import StatCard from '@/components/admin/StatCard'
import MonthNav from '@/components/admin/MonthNav'
import { formatPeso, formatDate, formatMonthYear } from '@/lib/utils/formatters'
import { groupBookingsByRoom } from '@/lib/utils/availability'

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.year ?? String(now.getFullYear()))
  const month = parseInt(params.month ?? String(now.getMonth() + 1))
  const today = now.toISOString().split('T')[0]

  const [report, upcoming, checkinsToday, checkoutsToday, rooms, monthBookings] = await Promise.all([
    getMonthlyReport(year, month),
    getUpcomingBookings(7),
    getBookings({ from: today, to: today, limit: 50 }),
    getCheckoutsOnDate(today),
    getRooms(),
    getBookingsForCalendar(year, month),
  ])

  const checkinToday = checkinsToday.rows.filter(b => b.check_in === today)
  const bookingsByRoom = groupBookingsByRoom(rooms, monthBookings)

  const avgOccupancy =
    report.occupancy.byRoom.length > 0
      ? Math.round(
          (report.occupancy.byRoom.reduce((s, r) => s + r.rate, 0) /
            report.occupancy.byRoom.length) *
            100
        )
      : 0

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {now.toLocaleDateString('en-PH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <MonthNav year={year} month={month} basePath="/admin/dashboard" />
      </div>

      <div>
        {!isCurrentMonth && (
          <p className="text-xs text-amber-600 font-medium mb-3">
            Viewing {formatMonthYear(year, month)}
          </p>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={isCurrentMonth ? 'This Month Revenue' : 'Revenue'}
            value={formatPeso(report.revenue.total)}
            subtitle={`${report.bookingCount} bookings`}
            accent="amber"
          />
          <StatCard
            title={isCurrentMonth ? 'This Month Expenses' : 'Expenses'}
            value={formatPeso(report.expenses.total)}
            accent="red"
          />
          <StatCard
            title="Net Income"
            value={formatPeso(report.netIncome)}
            accent={report.netIncome >= 0 ? 'green' : 'red'}
          />
          <StatCard
            title="Avg Occupancy"
            value={`${avgOccupancy}%`}
            subtitle={formatMonthYear(year, month)}
            accent="blue"
          />
        </div>
      </div>

      <DashboardAvailabilityCalendar
        rooms={rooms}
        bookingsByRoom={bookingsByRoom}
        year={year}
        month={month}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Today</h2>
            <span className="text-xs text-gray-400">{formatDate(today)}</span>
          </div>
          {checkinToday.length === 0 && checkoutsToday.length === 0 ? (
            <p className="text-sm text-gray-400">No check-ins or check-outs today</p>
          ) : (
            <div className="space-y-2">
              {checkinToday.map(b => (
                <div key={b.$id} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="font-medium text-gray-900">{b.guest_name}</span>
                  <span className="text-gray-400">→ {b.room_name}</span>
                  <span className="ml-auto text-green-600 text-xs">
                    Check-in {b.check_in_time}
                  </span>
                </div>
              ))}
              {checkoutsToday.map(b => (
                <div key={b.$id} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-medium text-gray-900">{b.guest_name}</span>
                  <span className="text-gray-400">← {b.room_name}</span>
                  <span className="ml-auto text-blue-600 text-xs">
                    Check-out {b.check_out_time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Upcoming Check-ins (7 days)</h2>
            <Link
              href="/admin/bookings"
              className="text-xs text-amber-600 hover:text-amber-800"
            >
              View all →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming bookings</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(b => (
                <div key={b.$id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-20 shrink-0 text-xs">
                    {formatDate(b.check_in)}
                  </span>
                  <span className="font-medium text-gray-900 truncate">{b.guest_name}</span>
                  <span className="text-gray-400 shrink-0 text-xs">{b.room_name}</span>
                  <span className="ml-auto text-amber-600 text-xs shrink-0">
                    {formatPeso(b.total_amount - b.down_payment)} due
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { Query } from 'node-appwrite'
import { getDaysInMonth } from 'date-fns'
import { createAdminClient, TABLES } from '@/lib/appwrite/server'
import type { Booking, Expense, MonthlyReport, YearlyData } from '@/types/admin'

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const { tables, databaseId } = createAdminClient()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const daysCount = getDaysInMonth(new Date(year, month - 1, 1))
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysCount).padStart(2, '0')}`

  const [bookingsRes, expensesRes, roomsRes] = await Promise.all([
    tables.listRows(databaseId, TABLES.bookings, [
      Query.equal('payment_status', ['pending', 'partial', 'paid']),
      Query.greaterThanEqual('check_in', startDate),
      Query.lessThanEqual('check_in', endDate),
      Query.limit(1000),
    ]),
    tables.listRows(databaseId, TABLES.expenses, [
      Query.greaterThanEqual('expense_date', startDate),
      Query.lessThanEqual('expense_date', endDate),
      Query.limit(1000),
    ]),
    tables.listRows(databaseId, TABLES.rooms, [
      Query.equal('is_active', true),
      Query.orderAsc('sort_order'),
      Query.limit(50),
    ]),
  ])

  const bookings = bookingsRes.rows as unknown as Booking[]
  const expenses = expensesRes.rows as unknown as Expense[]

  const totalRevenue = bookings.reduce((s, b) => s + b.total_amount, 0)
  const revenueByRoom: Record<string, number> = {}
  for (const b of bookings) {
    revenueByRoom[b.room_name] = (revenueByRoom[b.room_name] ?? 0) + b.total_amount
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const expensesByCategory: Record<string, number> = {}
  for (const e of expenses) {
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount
  }

  const occupancyByRoom = (roomsRes.rows as unknown as { $id: string; name: string }[]).map(room => {
    const roomBookings = bookings.filter(b => b.room_id === room.$id)
    const bookedNights = roomBookings.reduce((sum, b) => {
      const checkIn = new Date(b.check_in + 'T00:00:00')
      const checkOut = new Date(b.check_out + 'T00:00:00')
      const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
      return sum + Math.max(0, nights)
    }, 0)
    const capped = Math.min(bookedNights, daysCount)
    return {
      room_name: room.name,
      bookedNights: capped,
      totalNights: daysCount,
      rate: daysCount > 0 ? capped / daysCount : 0,
    }
  })

  return {
    revenue: {
      total: totalRevenue,
      byRoom: Object.entries(revenueByRoom).map(([room_name, amount]) => ({ room_name, amount })),
    },
    expenses: {
      total: totalExpenses,
      byCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount,
      })),
    },
    netIncome: totalRevenue - totalExpenses,
    occupancy: { byRoom: occupancyByRoom },
    bookingCount: bookings.length,
  }
}

export async function getYearlyData(year: number): Promise<YearlyData[]> {
  const { tables, databaseId } = createAdminClient()

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const [bookingsRes, expensesRes] = await Promise.all([
    tables.listRows(databaseId, TABLES.bookings, [
      Query.equal('payment_status', ['pending', 'partial', 'paid']),
      Query.greaterThanEqual('check_in', startDate),
      Query.lessThanEqual('check_in', endDate),
      Query.limit(5000),
    ]),
    tables.listRows(databaseId, TABLES.expenses, [
      Query.greaterThanEqual('expense_date', startDate),
      Query.lessThanEqual('expense_date', endDate),
      Query.limit(5000),
    ]),
  ])

  const result: YearlyData[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    revenue: 0,
    expenses: 0,
  }))

  for (const b of bookingsRes.rows as unknown as Booking[]) {
    const m = parseInt(b.check_in.split('-')[1]) - 1
    if (m >= 0 && m < 12) result[m].revenue += b.total_amount
  }

  for (const e of expensesRes.rows as unknown as Expense[]) {
    const m = parseInt(e.expense_date.split('-')[1]) - 1
    if (m >= 0 && m < 12) result[m].expenses += e.amount
  }

  return result
}

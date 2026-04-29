import { Query } from 'node-appwrite'
import { getDaysInMonth } from 'date-fns'
import { createAdminClient, TABLES } from '@/lib/appwrite/server'
import type { Booking, Expense, MonthlyReport, YearlyData } from '@/types/admin'

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const { tables, databaseId } = createAdminClient()

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const daysCount = getDaysInMonth(new Date(year, month - 1, 1))
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(daysCount).padStart(2, '0')}`
  const nextMonthStart =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const monthStartMs = new Date(monthStart + 'T00:00:00').getTime()
  const nextMonthStartMs = new Date(nextMonthStart + 'T00:00:00').getTime()

  const [revenueRes, expensesRes, occupancyRes, roomsRes] = await Promise.all([
    // Revenue: bookings that START this month (booking "belongs to" the month it's made)
    tables.listRows(databaseId, TABLES.bookings, [
      Query.equal('payment_status', ['pending', 'partial', 'paid']),
      Query.greaterThanEqual('check_in', monthStart),
      Query.lessThanEqual('check_in', monthEnd),
      Query.limit(1000),
    ]),
    // Expenses within this month
    tables.listRows(databaseId, TABLES.expenses, [
      Query.greaterThanEqual('expense_date', monthStart),
      Query.lessThanEqual('expense_date', monthEnd),
      Query.limit(1000),
    ]),
    // Occupancy: bookings that OVERLAP with this month (started before end, ended after start)
    tables.listRows(databaseId, TABLES.bookings, [
      Query.equal('payment_status', ['pending', 'partial', 'paid']),
      Query.lessThan('check_in', nextMonthStart),
      Query.greaterThan('check_out', monthStart),
      Query.limit(1000),
    ]),
    // Active rooms for occupancy denominator
    tables.listRows(databaseId, TABLES.rooms, [
      Query.equal('is_active', true),
      Query.orderAsc('sort_order'),
      Query.limit(50),
    ]),
  ])

  const revenueBookings = revenueRes.rows as unknown as Booking[]
  const expenses = expensesRes.rows as unknown as Expense[]
  const occupancyBookings = occupancyRes.rows as unknown as Booking[]
  const rooms = roomsRes.rows as unknown as { $id: string; name: string }[]

  // Revenue
  const totalRevenue = revenueBookings.reduce((s, b) => s + b.total_amount, 0)
  const revenueByRoom: Record<string, number> = {}
  for (const b of revenueBookings) {
    revenueByRoom[b.room_name] = (revenueByRoom[b.room_name] ?? 0) + b.total_amount
  }

  // Expenses
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const expensesByCategory: Record<string, number> = {}
  for (const e of expenses) {
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount
  }

  // Occupancy — clip each booking's nights to the month boundary
  const occupancyByRoom = rooms.map(room => {
    const roomBookings = occupancyBookings.filter(b => b.room_id === room.$id)
    const bookedNights = roomBookings.reduce((sum, b) => {
      const checkInMs = new Date(b.check_in + 'T00:00:00').getTime()
      const checkOutMs = new Date(b.check_out + 'T00:00:00').getTime()
      const effectiveIn = Math.max(checkInMs, monthStartMs)
      const effectiveOut = Math.min(checkOutMs, nextMonthStartMs)
      return sum + Math.max(0, Math.round((effectiveOut - effectiveIn) / 86400000))
    }, 0)
    const nights = Math.min(bookedNights, daysCount)
    return {
      room_name: room.name,
      bookedNights: nights,
      totalNights: daysCount,
      rate: daysCount > 0 ? nights / daysCount : 0,
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
    bookingCount: revenueBookings.length,
  }
}

export async function getYearlyData(year: number): Promise<YearlyData[]> {
  const { tables, databaseId } = createAdminClient()

  const [bookingsRes, expensesRes] = await Promise.all([
    tables.listRows(databaseId, TABLES.bookings, [
      Query.equal('payment_status', ['pending', 'partial', 'paid']),
      Query.greaterThanEqual('check_in', `${year}-01-01`),
      Query.lessThanEqual('check_in', `${year}-12-31`),
      Query.limit(5000),
    ]),
    tables.listRows(databaseId, TABLES.expenses, [
      Query.greaterThanEqual('expense_date', `${year}-01-01`),
      Query.lessThanEqual('expense_date', `${year}-12-31`),
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

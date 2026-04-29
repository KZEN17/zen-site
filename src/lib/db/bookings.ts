import { Query, ID } from 'node-appwrite'
import type { Models } from 'node-appwrite'
import { createAdminClient, TABLES } from '@/lib/appwrite/server'
import { plain } from '@/lib/utils/formatters'
import type { Booking, PaymentStatus, BookingSource } from '@/types/admin'

type BookingRow = Models.Row & Booking

export interface BookingFilters {
  roomId?: string
  from?: string
  to?: string
  status?: PaymentStatus
  page?: number
  limit?: number
}

export interface BookingData {
  room_id: string
  room_name: string
  guest_name: string
  guest_count?: number | null
  check_in: string
  check_out: string
  check_in_time?: string
  check_out_time?: string
  total_amount: number
  down_payment: number
  payment_status?: PaymentStatus
  source?: BookingSource | null
  discount_code?: string | null
  notes?: string | null
  aux_room_ids?: string | null
}

export async function getBookings(filters: BookingFilters = {}): Promise<{ rows: Booking[]; total: number }> {
  const { tables, databaseId } = createAdminClient()
  const { roomId, from, to, status, page = 1, limit = 20 } = filters

  const queries = [
    Query.orderDesc('check_in'),
    Query.limit(limit),
    Query.offset((page - 1) * limit),
  ]

  if (roomId) queries.push(Query.equal('room_id', roomId))
  if (status) queries.push(Query.equal('payment_status', status))
  if (from) queries.push(Query.greaterThanEqual('check_in', from))
  if (to) queries.push(Query.lessThanEqual('check_in', to))

  const res = await tables.listRows<BookingRow>(databaseId, TABLES.bookings, queries)
  return { rows: plain(res.rows), total: res.total }
}

export async function getBookingById(id: string): Promise<Booking> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.getRow<BookingRow>(databaseId, TABLES.bookings, id)
  return plain(row)
}

export async function checkOverlap(
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: string
): Promise<boolean> {
  const { tables, databaseId } = createAdminClient()
  const res = await tables.listRows(databaseId, TABLES.bookings, [
    Query.equal('room_id', roomId),
    Query.equal('payment_status', ['pending', 'partial', 'paid']),
    Query.lessThan('check_in', checkOut),
    Query.greaterThan('check_out', checkIn),
    Query.limit(10),
  ])
  const overlapping = excludeId
    ? res.rows.filter((r: { $id: string }) => r.$id !== excludeId)
    : res.rows
  return overlapping.length > 0
}

export async function createBooking(data: BookingData): Promise<Booking> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.createRow<BookingRow>(databaseId, TABLES.bookings, ID.unique(), {
    room_id: data.room_id,
    room_name: data.room_name,
    guest_name: data.guest_name,
    guest_count: data.guest_count ?? null,
    check_in: data.check_in,
    check_out: data.check_out,
    check_in_time: data.check_in_time ?? '14:00',
    check_out_time: data.check_out_time ?? '12:00',
    total_amount: data.total_amount,
    down_payment: data.down_payment,
    payment_status: data.payment_status ?? 'pending',
    source: data.source ?? null,
    discount_code: data.discount_code ?? null,
    notes: data.notes ?? null,
    aux_room_ids: data.aux_room_ids ?? null,
  })
  return plain(row)
}

export async function updateBooking(
  id: string,
  data: Partial<BookingData> & { payment_status?: PaymentStatus }
): Promise<Booking> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.updateRow<BookingRow>(databaseId, TABLES.bookings, id, data)
  return plain(row)
}

export async function cancelBooking(id: string): Promise<Booking> {
  return updateBooking(id, { payment_status: 'cancelled' })
}

export async function deleteBooking(id: string): Promise<void> {
  const { tables, databaseId } = createAdminClient()
  await tables.deleteRow(databaseId, TABLES.bookings, id)
}

export async function getBookingsForCalendar(year: number, month: number): Promise<Booking[]> {
  const { tables, databaseId } = createAdminClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const res = await tables.listRows<BookingRow>(databaseId, TABLES.bookings, [
    Query.equal('payment_status', ['pending', 'partial', 'paid']),
    Query.lessThan('check_in', endDate),
    Query.greaterThan('check_out', startDate),
    Query.orderAsc('check_in'),
    Query.limit(500),
  ])
  return plain(res.rows)
}

export async function getCheckoutsOnDate(date: string): Promise<Booking[]> {
  const { tables, databaseId } = createAdminClient()
  const res = await tables.listRows(databaseId, TABLES.bookings, [
    Query.equal('payment_status', ['pending', 'partial', 'paid']),
    Query.equal('check_out', date),
    Query.orderAsc('check_out'),
    Query.limit(50),
  ])
  return plain(res.rows) as unknown as Booking[]
}

export async function getUpcomingBookings(days = 7): Promise<Booking[]> {
  const { tables, databaseId } = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const future = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]

  const res = await tables.listRows<BookingRow>(databaseId, TABLES.bookings, [
    Query.equal('payment_status', ['pending', 'partial', 'paid']),
    Query.greaterThanEqual('check_in', today),
    Query.lessThanEqual('check_in', future),
    Query.orderAsc('check_in'),
    Query.limit(20),
  ])
  return plain(res.rows)
}

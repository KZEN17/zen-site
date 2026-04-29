import { NextRequest, NextResponse } from 'next/server'
import { getBookingsForCalendar } from '@/lib/db/bookings'
import { getRoomBySlug } from '@/lib/db/rooms'
import { groupBookingsByRoom } from '@/lib/utils/availability'
import { formatISODate, getBookedDatesForRoom } from '@/lib/utils/dates'

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params
    const now = new Date()
    const yearParam = Number(request.nextUrl.searchParams.get('year') ?? now.getFullYear())
    const monthParam = Number(request.nextUrl.searchParams.get('month') ?? now.getMonth() + 1)

    if (!Number.isInteger(yearParam) || !Number.isInteger(monthParam) || monthParam < 1 || monthParam > 12) {
      return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 })
    }

    const room = await getRoomBySlug(id)
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const bookings = await getBookingsForCalendar(yearParam, monthParam)
    const bookingsByRoom = groupBookingsByRoom([room], bookings)
    const bookedDates = [
      ...new Set(
        getBookedDatesForRoom(bookingsByRoom[room.$id] ?? [])
          .filter(date => date.getFullYear() === yearParam && date.getMonth() === monthParam - 1)
          .map(formatISODate)
      ),
    ]

    return NextResponse.json({
      roomName: room.name,
      year: yearParam,
      month: monthParam,
      bookedDates,
    })
  } catch (err) {
    console.error('GET /api/rooms/[id]/availability:', err)
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}

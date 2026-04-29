import { NextRequest, NextResponse } from 'next/server'
import { getBookings, createBooking, checkOverlap } from '@/lib/db/bookings'
import type { PaymentStatus } from '@/types/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const result = await getBookings({
      roomId: searchParams.get('room_id') ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      status: (searchParams.get('status') as PaymentStatus) ?? undefined,
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/admin/bookings:', err)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { room_id, check_in, check_out } = data

    if (!room_id || !check_in || !check_out || !data.guest_name || data.total_amount == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (check_out <= check_in) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
    }

    const hasOverlap = await checkOverlap(room_id, check_in, check_out)
    if (hasOverlap) {
      return NextResponse.json(
        { error: 'Room is already booked for these dates' },
        { status: 409 }
      )
    }

    const booking = await createBooking(data)
    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/bookings:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

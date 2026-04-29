import { NextRequest, NextResponse } from 'next/server'
import { getBookingById, updateBooking, cancelBooking, checkOverlap } from '@/lib/db/bookings'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const booking = await getBookingById(id)
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()

    if (data.check_in && data.check_out) {
      if (data.check_out <= data.check_in) {
        return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
      }
      const current = await getBookingById(id)
      const roomId = data.room_id ?? current.room_id
      const hasOverlap = await checkOverlap(roomId, data.check_in, data.check_out, id)
      if (hasOverlap) {
        return NextResponse.json(
          { error: 'Room is already booked for these dates' },
          { status: 409 }
        )
      }
    }

    const booking = await updateBooking(id, data)
    return NextResponse.json(booking)
  } catch (err) {
    console.error('PATCH /api/admin/bookings/[id]:', err)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await cancelBooking(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
}

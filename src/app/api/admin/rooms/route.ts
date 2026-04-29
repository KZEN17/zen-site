import { NextRequest, NextResponse } from 'next/server'
import { getAllRoomsWithRates, createRoom } from '@/lib/db/rooms'

export async function GET() {
  try {
    const rooms = await getAllRoomsWithRates(false)
    return NextResponse.json(rooms)
  } catch (err) {
    console.error('GET /api/admin/rooms:', err)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, capacity, slug } = body
    if (!name || !capacity || !slug) {
      return NextResponse.json({ error: 'name, capacity, slug required' }, { status: 400 })
    }
    const room = await createRoom({ name, capacity, slug })
    return NextResponse.json(room, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/rooms:', err)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

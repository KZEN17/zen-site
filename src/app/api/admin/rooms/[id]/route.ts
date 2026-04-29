import { NextRequest, NextResponse } from 'next/server'
import { getRoomById, updateRoom } from '@/lib/db/rooms'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = await getRoomById(id)
    return NextResponse.json(room)
  } catch (err) {
    console.error('GET /api/admin/rooms/[id]:', err)
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const room = await updateRoom(id, body)
    return NextResponse.json(room)
  } catch (err) {
    console.error('PATCH /api/admin/rooms/[id]:', err)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

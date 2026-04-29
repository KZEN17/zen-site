import { NextRequest, NextResponse } from 'next/server'
import { updateRoomRate, deleteRoomRate } from '@/lib/db/rooms'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ rateId: string }> }
) {
  try {
    const { rateId } = await params
    const body = await request.json()
    const rate = await updateRoomRate(rateId, body)
    return NextResponse.json(rate)
  } catch (err) {
    console.error('PATCH /api/admin/rooms/[id]/rates/[rateId]:', err)
    return NextResponse.json({ error: 'Failed to update rate' }, { status: 500 })
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ rateId: string }> }
) {
  try {
    const { rateId } = await params
    await deleteRoomRate(rateId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/rooms/[id]/rates/[rateId]:', err)
    return NextResponse.json({ error: 'Failed to delete rate' }, { status: 500 })
  }
}

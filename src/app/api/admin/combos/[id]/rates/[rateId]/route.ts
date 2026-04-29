import { NextRequest, NextResponse } from 'next/server'
import { deleteRoomRate } from '@/lib/db/rooms'

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ rateId: string }> }
) {
  try {
    const { rateId } = await params
    await deleteRoomRate(rateId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/combos/[id]/rates/[rateId]:', err)
    return NextResponse.json({ error: 'Failed to delete rate' }, { status: 500 })
  }
}

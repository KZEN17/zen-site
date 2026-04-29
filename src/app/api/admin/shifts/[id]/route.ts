import { NextRequest, NextResponse } from 'next/server'
import { updateShift, deleteShift } from '@/lib/db/shifts'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const shift = await updateShift(id, body)
    return NextResponse.json(shift)
  } catch (err) {
    console.error('PATCH /api/admin/shifts/[id]:', err)
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteShift(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/shifts/[id]:', err)
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 })
  }
}

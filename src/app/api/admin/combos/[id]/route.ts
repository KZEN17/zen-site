import { NextRequest, NextResponse } from 'next/server'
import { updateCombo, deleteCombo } from '@/lib/db/combos'
import { addRoomRate } from '@/lib/db/rooms'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const combo = await updateCombo(id, body)
    return NextResponse.json(combo)
  } catch (err) {
    console.error('PATCH /api/admin/combos/[id]:', err)
    return NextResponse.json({ error: 'Failed to update combo' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteCombo(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/combos/[id]:', err)
    return NextResponse.json({ error: 'Failed to delete combo' }, { status: 500 })
  }
}

// Add a rate to a combo (reuses room_rates table with combo.$id as room_id)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { guests_label, price } = await request.json()
    if (!guests_label || price == null) {
      return NextResponse.json({ error: 'guests_label and price required' }, { status: 400 })
    }
    const rate = await addRoomRate(id, { guests_label, price: Number(price) })
    return NextResponse.json(rate, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/combos/[id] (add rate):', err)
    return NextResponse.json({ error: 'Failed to add rate' }, { status: 500 })
  }
}

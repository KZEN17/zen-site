import { NextRequest, NextResponse } from 'next/server'
import { addRoomRate } from '@/lib/db/rooms'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { guests_label, price } = body
    if (!guests_label || price == null) {
      return NextResponse.json({ error: 'guests_label and price required' }, { status: 400 })
    }
    const rate = await addRoomRate(id, { guests_label, price: Number(price) })
    return NextResponse.json(rate, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/rooms/[id]/rates:', err)
    return NextResponse.json({ error: 'Failed to add rate' }, { status: 500 })
  }
}

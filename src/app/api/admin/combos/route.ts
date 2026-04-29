import { NextRequest, NextResponse } from 'next/server'
import { getAllCombosWithRates, createCombo } from '@/lib/db/combos'

export async function GET() {
  try {
    const combos = await getAllCombosWithRates(false)
    return NextResponse.json(combos)
  } catch (err) {
    console.error('GET /api/admin/combos:', err)
    return NextResponse.json({ error: 'Failed to fetch combos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, room_ids, capacity } = await request.json()
    if (!name || !room_ids || !capacity) {
      return NextResponse.json({ error: 'name, room_ids, capacity required' }, { status: 400 })
    }
    const combo = await createCombo({ name, room_ids, capacity })
    return NextResponse.json(combo, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/combos:', err)
    return NextResponse.json({ error: 'Failed to create combo' }, { status: 500 })
  }
}

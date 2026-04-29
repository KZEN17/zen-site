import { NextRequest, NextResponse } from 'next/server'
import { getShiftsForWeek, createShift } from '@/lib/db/shifts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') ?? ''
    const to = searchParams.get('to') ?? ''
    if (!from || !to) {
      return NextResponse.json({ error: 'from and to query params required' }, { status: 400 })
    }
    const shifts = await getShiftsForWeek(from, to)
    return NextResponse.json(shifts)
  } catch (err) {
    console.error('GET /api/admin/shifts:', err)
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_id, employee_name, shift_date, start_time, end_time, notes } = body
    if (!employee_id || !shift_date || !start_time || !end_time) {
      return NextResponse.json({ error: 'employee_id, shift_date, start_time, end_time required' }, { status: 400 })
    }
    const shift = await createShift({ employee_id, employee_name, shift_date, start_time, end_time, notes })
    return NextResponse.json(shift, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/shifts:', err)
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 })
  }
}

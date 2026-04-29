import { NextRequest, NextResponse } from 'next/server'
import { updateEmployee } from '@/lib/db/employees'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const employee = await updateEmployee(id, body)
    return NextResponse.json(employee)
  } catch (err) {
    console.error('PATCH /api/admin/employees/[id]:', err)
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

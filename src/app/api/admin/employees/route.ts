import { NextRequest, NextResponse } from 'next/server'
import { getEmployees, createEmployee } from '@/lib/db/employees'
import type { EmployeeRole } from '@/types/admin'

export async function GET() {
  try {
    const employees = await getEmployees(false)
    return NextResponse.json(employees)
  } catch (err) {
    console.error('GET /api/admin/employees:', err)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, role } = await request.json()
    if (!name || !role) {
      return NextResponse.json({ error: 'name and role required' }, { status: 400 })
    }
    const employee = await createEmployee({ name, role: role as EmployeeRole })
    return NextResponse.json(employee, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/employees:', err)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}

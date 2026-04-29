import { NextRequest, NextResponse } from 'next/server'
import { getExpenses, createExpense } from '@/lib/db/expenses'
import type { ExpenseCategory } from '@/types/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const result = await getExpenses({
      category: (searchParams.get('category') as ExpenseCategory) ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/admin/expenses:', err)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.category || data.amount == null || !data.expense_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expense = await createExpense(data)
    return NextResponse.json(expense, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/expenses:', err)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}

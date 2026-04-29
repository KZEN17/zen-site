import { NextRequest, NextResponse } from 'next/server'
import { getExpenseById, updateExpense, deleteExpense } from '@/lib/db/expenses'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const expense = await getExpenseById(id)
    return NextResponse.json(expense)
  } catch {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const expense = await updateExpense(id, data)
    return NextResponse.json(expense)
  } catch (err) {
    console.error('PATCH /api/admin/expenses/[id]:', err)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteExpense(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }
}

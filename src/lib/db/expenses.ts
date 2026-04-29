import { Query, ID } from 'node-appwrite'
import { createAdminClient, TABLES } from '@/lib/appwrite/server'
import type { Expense, ExpenseCategory } from '@/types/admin'

export interface ExpenseFilters {
  category?: ExpenseCategory
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface ExpenseData {
  category: ExpenseCategory
  amount: number
  expense_date: string
  description?: string | null
}

export async function getExpenses(filters: ExpenseFilters = {}): Promise<{ rows: Expense[]; total: number }> {
  const { tables, databaseId } = createAdminClient()
  const { category, from, to, page = 1, limit = 20 } = filters

  const queries = [
    Query.orderDesc('expense_date'),
    Query.limit(limit),
    Query.offset((page - 1) * limit),
  ]

  if (category) queries.push(Query.equal('category', category))
  if (from) queries.push(Query.greaterThanEqual('expense_date', from))
  if (to) queries.push(Query.lessThanEqual('expense_date', to))

  const res = await tables.listRows(databaseId, TABLES.expenses, queries)
  return { rows: res.rows as unknown as Expense[], total: res.total }
}

export async function getExpenseById(id: string): Promise<Expense> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.getRow(databaseId, TABLES.expenses, id)
  return row as unknown as Expense
}

export async function createExpense(data: ExpenseData): Promise<Expense> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.createRow(databaseId, TABLES.expenses, ID.unique(), {
    category: data.category,
    amount: data.amount,
    expense_date: data.expense_date,
    description: data.description ?? null,
  })
  return row as unknown as Expense
}

export async function updateExpense(id: string, data: Partial<ExpenseData>): Promise<Expense> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.updateRow(databaseId, TABLES.expenses, id, data)
  return row as unknown as Expense
}

export async function deleteExpense(id: string): Promise<void> {
  const { tables, databaseId } = createAdminClient()
  await tables.deleteRow(databaseId, TABLES.expenses, id)
}

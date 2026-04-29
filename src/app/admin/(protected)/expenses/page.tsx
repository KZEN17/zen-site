import Link from 'next/link'
import { getExpenses } from '@/lib/db/expenses'
import ExpenseTable from '@/components/admin/ExpenseTable'

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>
}

export default async function ExpensesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const limit = 25

  const { rows: expenses, total } = await getExpenses({
    category: params.category as import('@/types/admin').ExpenseCategory | undefined,
    page,
    limit,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total records</p>
        </div>
        <Link
          href="/admin/expenses/new"
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          + Add Expense
        </Link>
      </div>

      <ExpenseTable expenses={expenses} total={total} page={page} limit={limit} />
    </div>
  )
}

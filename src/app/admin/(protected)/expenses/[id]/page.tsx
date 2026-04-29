import { notFound } from 'next/navigation'
import { getExpenseById } from '@/lib/db/expenses'
import ExpenseForm from '@/components/admin/ExpenseForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: Props) {
  const { id } = await params

  let expense
  try {
    expense = await getExpenseById(id)
  } catch {
    notFound()
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Expense</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <ExpenseForm mode="edit" initialData={expense} />
      </div>
    </div>
  )
}

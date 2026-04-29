import ExpenseForm from '@/components/admin/ExpenseForm'

export default function NewExpensePage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <ExpenseForm mode="create" />
      </div>
    </div>
  )
}

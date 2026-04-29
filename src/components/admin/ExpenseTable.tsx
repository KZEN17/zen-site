'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Expense } from '@/types/admin'
import { EXPENSE_CATEGORY_LABELS } from '@/types/admin'
import { formatPeso, formatDate } from '@/lib/utils/formatters'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Props {
  expenses: Expense[]
  total: number
  page: number
  limit: number
}

export default function ExpenseTable({ expenses, total, page, limit }: Props) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const totalPages = Math.ceil(total / limit)

  async function handleDelete() {
    if (!deleteId) return
    await fetch(`/api/admin/expenses/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    router.refresh()
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No expenses found
                  </td>
                </tr>
              )}
              {expenses.map(e => (
                <tr key={e.$id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {EXPENSE_CATEGORY_LABELS[e.category]}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    {formatPeso(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(e.expense_date)}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {e.description ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/expenses/${e.$id}`}
                        className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteId(e.$id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}`}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}`}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Expense"
        message="This will permanently delete the expense record."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}

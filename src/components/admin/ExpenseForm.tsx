'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Expense, ExpenseCategory } from '@/types/admin'
import { EXPENSE_CATEGORY_LABELS } from '@/types/admin'
import { todayISO } from '@/lib/utils/formatters'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Props {
  mode: 'create' | 'edit'
  initialData?: Partial<Expense>
}

const CATEGORIES = Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]

export default function ExpenseForm({ mode, initialData }: Props) {
  const router = useRouter()
  const [category, setCategory] = useState<ExpenseCategory>(
    initialData?.category ?? 'other'
  )
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '')
  const [date, setDate] = useState(initialData?.expense_date ?? todayISO())
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url =
        mode === 'edit' && initialData?.$id
          ? `/api/admin/expenses/${initialData.$id}`
          : '/api/admin/expenses'
      const method = mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: parseInt(amount),
          expense_date: date,
          description: description || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save expense')
      }

      router.push('/admin/expenses')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!initialData?.$id) return
    await fetch(`/api/admin/expenses/${initialData.$id}`, { method: 'DELETE' })
    router.push('/admin/expenses')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as ExpenseCategory)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱) *</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            min={1}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Optional details…"
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Saving…' : mode === 'edit' ? 'Update Expense' : 'Add Expense'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Cancel
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="ml-auto border border-red-300 hover:bg-red-50 text-red-600 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Delete Expense
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Expense"
        message="This will permanently delete this expense record. This cannot be undone."
        confirmLabel="Delete Permanently"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  )
}

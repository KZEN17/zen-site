'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Booking, PaymentStatus } from '@/types/admin'
import { formatPeso, formatDate } from '@/lib/utils/formatters'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Props {
  bookings: Booking[]
  total: number
  page: number
  limit: number
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500 line-through',
}

export default function BookingTable({ bookings, total, page, limit }: Props) {
  const router = useRouter()
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const totalPages = Math.ceil(total / limit)

  async function handleCancel() {
    if (!cancelId) return
    await fetch(`/api/admin/bookings/${cancelId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: 'cancelled' }),
    })
    setCancelId(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleteId) return
    await fetch(`/api/admin/bookings/${deleteId}`, { method: 'DELETE' })
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
                <th className="px-4 py-3 text-left font-medium text-gray-600">Room</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Guest</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Check-in</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Check-out</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Balance</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No bookings found
                  </td>
                </tr>
              )}
              {bookings.map(b => {
                const balance = b.total_amount - b.down_payment
                return (
                  <tr key={b.$id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.room_name}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {b.guest_name}
                      {b.guest_count && (
                        <span className="text-gray-400 ml-1">({b.guest_count} pax)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(b.check_in)}
                      <span className="text-gray-400 ml-1 text-xs">{b.check_in_time}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(b.check_out)}
                      <span className="text-gray-400 ml-1 text-xs">{b.check_out_time}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {formatPeso(b.total_amount)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        balance === 0 ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {formatPeso(balance)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[b.payment_status]}`}
                      >
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/bookings/${b.$id}`}
                          className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                        >
                          Edit
                        </Link>
                        {b.payment_status !== 'cancelled' && (
                          <button
                            onClick={() => setCancelId(b.$id)}
                            className="text-orange-500 hover:text-orange-700 text-xs font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(b.$id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
        open={!!cancelId}
        title="Cancel Booking"
        message="This will mark the booking as cancelled. The record will be kept for history."
        confirmLabel="Cancel Booking"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Booking"
        message="This will permanently delete the booking. This cannot be undone."
        confirmLabel="Delete Permanently"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}

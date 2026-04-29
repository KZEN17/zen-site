'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Booking, RoomWithRates, RoomComboWithRates } from '@/types/admin'
import { getRateForGuestCount } from '@/lib/utils/pricing'
import { formatPeso } from '@/lib/utils/formatters'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Props {
  mode: 'create' | 'edit'
  initialData?: Partial<Booking>
}

const STATUS_OPTIONS = ['pending', 'partial', 'paid', 'cancelled'] as const
const SOURCE_OPTIONS = ['walk-in', 'facebook', 'website', 'phone'] as const

// selection value format: "room:<id>" | "combo:<id>"
function parseSelection(val: string) {
  const [type, id] = val.split(':')
  return { type: type as 'room' | 'combo', id }
}

export default function BookingForm({ mode, initialData }: Props) {
  const router = useRouter()
  const [rooms, setRooms] = useState<RoomWithRates[]>([])
  const [combos, setCombos] = useState<RoomComboWithRates[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Build initial selection value from initialData
  const initialSelection = initialData?.room_id ? `room:${initialData.room_id}` : ''

  const [selection, setSelection] = useState(initialSelection)
  const [guestName, setGuestName] = useState(initialData?.guest_name ?? '')
  const [guestCount, setGuestCount] = useState(initialData?.guest_count?.toString() ?? '')
  const [checkIn, setCheckIn] = useState(initialData?.check_in ?? '')
  const [checkOut, setCheckOut] = useState(initialData?.check_out ?? '')
  const [checkInTime, setCheckInTime] = useState(initialData?.check_in_time ?? '14:00')
  const [checkOutTime, setCheckOutTime] = useState(initialData?.check_out_time ?? '12:00')
  const [totalAmount, setTotalAmount] = useState(initialData?.total_amount?.toString() ?? '')
  const [downPayment, setDownPayment] = useState(initialData?.down_payment?.toString() ?? '')
  const [status, setStatus] = useState(initialData?.payment_status ?? 'pending')
  const [source, setSource] = useState(initialData?.source ?? '')
  const [discountCode, setDiscountCode] = useState(initialData?.discount_code ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')

  const balance = (parseInt(totalAmount) || 0) - (parseInt(downPayment) || 0)

  const { type: selType, id: selId } = selection ? parseSelection(selection) : { type: undefined, id: undefined }
  const selectedRoom = selType === 'room' ? rooms.find(r => r.$id === selId) : undefined
  const selectedCombo = selType === 'combo' ? combos.find(c => c.$id === selId) : undefined
  const activeRates = selectedRoom?.rates ?? selectedCombo?.rates ?? []

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/rooms').then(r => r.json()),
      fetch('/api/admin/combos').then(r => r.json()),
    ])
      .then(([r, c]) => {
        setRooms(r)
        setCombos(c)
      })
      .catch(() => {})
  }, [])

  // Auto-fill total from rate when guest count or selection changes
  useEffect(() => {
    if (!guestCount || activeRates.length === 0) return
    const rateSource = selectedRoom ?? selectedCombo
    if (!rateSource) return
    const rate = getRateForGuestCount(rateSource, parseInt(guestCount))
    if (rate != null) setTotalAmount(rate.toString())
  }, [selection, guestCount]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selId || !selType) return
    setLoading(true)
    setError('')

    let room_id = selId
    let room_name = ''
    let aux_room_ids: string | null = null

    if (selType === 'room') {
      room_name = rooms.find(r => r.$id === selId)?.name ?? ''
    } else if (selType === 'combo' && selectedCombo) {
      room_name = selectedCombo.name
      const ids = selectedCombo.room_ids.split(',').map(s => s.trim()).filter(Boolean)
      room_id = ids[0] ?? selId          // primary room = first in combo
      aux_room_ids = ids.slice(1).join(',') || null
    }

    const payload = {
      room_id,
      room_name,
      aux_room_ids,
      guest_name: guestName,
      guest_count: guestCount ? parseInt(guestCount) : null,
      check_in: checkIn,
      check_out: checkOut,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      total_amount: parseInt(totalAmount),
      down_payment: parseInt(downPayment) || 0,
      payment_status: status,
      source: source || null,
      discount_code: discountCode || null,
      notes: notes || null,
    }

    try {
      const url =
        mode === 'edit' && initialData?.$id
          ? `/api/admin/bookings/${initialData.$id}`
          : '/api/admin/bookings'
      const method = mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save booking')
      }

      router.push('/admin/bookings')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!initialData?.$id) return
    await fetch(`/api/admin/bookings/${initialData.$id}`, { method: 'DELETE' })
    router.push('/admin/bookings')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room / Combination *</label>
          <select
            value={selection}
            onChange={e => { setSelection(e.target.value); setGuestCount(''); setTotalAmount('') }}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Select a room or combo</option>
            {rooms.length > 0 && (
              <optgroup label="Individual Rooms">
                {rooms.filter(r => r.is_active).map(r => (
                  <option key={r.$id} value={`room:${r.$id}`}>
                    {r.name} ({r.capacity})
                  </option>
                ))}
              </optgroup>
            )}
            {combos.length > 0 && (
              <optgroup label="Room Combinations">
                {combos.filter(c => c.is_active).map(c => (
                  <option key={c.$id} value={`combo:${c.$id}`}>
                    {c.name} ({c.capacity})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {selectedCombo && (
            <p className="text-xs text-amber-700 mt-1 font-medium">
              Combo: blocks all rooms simultaneously on the calendar
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
          <input
            type="text"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guest Count</label>
          <input
            type="number"
            value={guestCount}
            onChange={e => setGuestCount(e.target.value)}
            min={1}
            max={50}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="No. of guests"
          />
          {activeRates.length > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              {activeRates.map(r => `${r.guests_label} – ${formatPeso(r.price)}`).join(' · ')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select
            value={source}
            onChange={e => setSource(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Not specified</option>
            {SOURCE_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
          <input
            type="date"
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
          <input
            type="date"
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            required
            min={checkIn}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
          <input
            type="time"
            value={checkInTime}
            onChange={e => setCheckInTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
          <input
            type="time"
            value={checkOutTime}
            onChange={e => setCheckOutTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₱) *</label>
          <input
            type="number"
            value={totalAmount}
            onChange={e => setTotalAmount(e.target.value)}
            required
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (₱)</label>
          <input
            type="number"
            value={downPayment}
            onChange={e => setDownPayment(e.target.value)}
            min={0}
            max={parseInt(totalAmount) || undefined}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Balance</label>
          <div
            className={`w-full border rounded-lg px-3 py-2 font-semibold ${
              balance > 0
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-green-300 bg-green-50 text-green-700'
            }`}
          >
            {formatPeso(balance)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as typeof status)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
          <input
            type="text"
            value={discountCode}
            onChange={e => setDiscountCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g. ZENWEB10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Any special requests or notes…"
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Saving…' : mode === 'edit' ? 'Update Booking' : 'Create Booking'}
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
            Delete Booking
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Booking"
        message="This will permanently delete the booking. This cannot be undone."
        confirmLabel="Delete Permanently"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  )
}

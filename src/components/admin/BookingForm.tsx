'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Booking, RoomWithRates } from '@/types/admin'
import { getRateForGuestCount } from '@/lib/utils/pricing'
import { formatPeso } from '@/lib/utils/formatters'

interface Props {
  mode: 'create' | 'edit'
  initialData?: Partial<Booking>
}

const STATUS_OPTIONS = ['pending', 'partial', 'paid', 'cancelled'] as const
const SOURCE_OPTIONS = ['walk-in', 'facebook', 'website', 'phone'] as const

export default function BookingForm({ mode, initialData }: Props) {
  const router = useRouter()
  const [rooms, setRooms] = useState<RoomWithRates[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [roomId, setRoomId] = useState(initialData?.room_id ?? '')
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
  const selectedRoom = rooms.find(r => r.$id === roomId)

  useEffect(() => {
    fetch('/api/admin/rooms')
      .then(r => r.json())
      .then(setRooms)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedRoom || !guestCount) return
    const rate = getRateForGuestCount(selectedRoom, parseInt(guestCount))
    if (rate != null) setTotalAmount(rate.toString())
  }, [selectedRoom, guestCount])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const room = rooms.find(r => r.$id === roomId)
    const payload = {
      room_id: roomId,
      room_name: room?.name ?? '',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
          <select
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Select a room</option>
            {rooms.map(r => (
              <option key={r.$id} value={r.$id}>
                {r.name} ({r.capacity})
              </option>
            ))}
          </select>
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
            max={30}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="No. of guests"
          />
          {selectedRoom && guestCount && (
            <p className="text-xs text-amber-600 mt-1">
              Rates: {selectedRoom.rates.map(r => `${r.guests_label} – ${formatPeso(r.price)}`).join(' · ')}
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

      <div className="flex gap-3">
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
      </div>
    </form>
  )
}

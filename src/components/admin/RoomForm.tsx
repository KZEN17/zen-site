'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RoomWithRates, RoomRate } from '@/types/admin'
import { formatPeso } from '@/lib/utils/formatters'

interface Props {
  room?: RoomWithRates
}

export default function RoomForm({ room }: Props) {
  const router = useRouter()
  const isEdit = !!room

  const [name, setName] = useState(room?.name ?? '')
  const [slug, setSlug] = useState(room?.slug ?? '')
  const [capacity, setCapacity] = useState(room?.capacity ?? '')
  const [isActive, setIsActive] = useState(room?.is_active ?? true)
  const [rates, setRates] = useState<RoomRate[]>(room?.rates ?? [])
  const [newGuests, setNewGuests] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function autoSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = { name, slug, capacity, is_active: isActive }
      const url = isEdit ? `/api/admin/rooms/${room.$id}` : '/api/admin/rooms'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save room')
      }
      router.push('/admin/rooms')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function addRate() {
    if (!newGuests.trim() || !newPrice) return
    if (!isEdit) return
    try {
      const res = await fetch(`/api/admin/rooms/${room.$id}/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests_label: newGuests.trim(), price: Number(newPrice) }),
      })
      if (!res.ok) throw new Error('Failed to add rate')
      const rate = await res.json() as RoomRate
      setRates(prev => [...prev, rate])
      setNewGuests('')
      setNewPrice('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function removeRate(rateId: string) {
    if (!isEdit) return
    try {
      const res = await fetch(`/api/admin/rooms/${room.$id}/rates/${rateId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete rate')
      setRates(prev => prev.filter(r => r.$id !== rateId))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Room Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value)
              if (!isEdit) setSlug(autoSlug(e.target.value))
            }}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g. Big Loft"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g. big-loft"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
          <input
            type="text"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g. 7-10 pax"
          />
        </div>

        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-amber-600"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible in bookings)</label>
          </div>
        )}
      </div>

      {isEdit && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Rate Tiers</h2>

          {rates.length > 0 && (
            <div className="divide-y divide-gray-100">
              {rates.map(rate => (
                <div key={rate.$id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{rate.guests_label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{formatPeso(rate.price)}</span>
                    <button
                      type="button"
                      onClick={() => removeRate(rate.$id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newGuests}
              onChange={e => setNewGuests(e.target.value)}
              placeholder="Guests label (e.g. 5-6 pax)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="number"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              placeholder="Price (₱)"
              min={0}
              className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={addRate}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      )}

      {!isEdit && (
        <p className="text-xs text-gray-400">Save the room first, then add rate tiers.</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium py-2 px-5 rounded-lg transition-colors text-sm"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Room'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="py-2 px-5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

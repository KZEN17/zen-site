'use client'
import { useState } from 'react'
import type { RoomWithRates, RoomComboWithRates, RoomRate } from '@/types/admin'
import { formatPeso } from '@/lib/utils/formatters'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Props {
  rooms: RoomWithRates[]
  initialCombos: RoomComboWithRates[]
}

export default function ComboManager({ rooms, initialCombos }: Props) {
  const [combos, setCombos] = useState<RoomComboWithRates[]>(initialCombos)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')

  // New combo form
  const [newName, setNewName] = useState('')
  const [newCapacity, setNewCapacity] = useState('')
  const [newRoomIds, setNewRoomIds] = useState<string[]>([])

  // Rate add per combo
  const [addRateFor, setAddRateFor] = useState<string | null>(null)
  const [deleteComboId, setDeleteComboId] = useState<string | null>(null)
  const [rateGuests, setRateGuests] = useState('')
  const [ratePrice, setRatePrice] = useState('')

  async function createCombo() {
    if (!newName.trim() || !newCapacity.trim() || newRoomIds.length < 2) {
      setError('Name, capacity, and at least 2 rooms are required')
      return
    }
    setError('')
    try {
      const res = await fetch('/api/admin/combos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          room_ids: newRoomIds.join(','),
          capacity: newCapacity.trim(),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const combo = await res.json() as RoomComboWithRates
      setCombos(prev => [...prev, { ...combo, rates: [] }])
      setNewName('')
      setNewCapacity('')
      setNewRoomIds([])
      setShowNew(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function toggleActive(combo: RoomComboWithRates) {
    try {
      const res = await fetch(`/api/admin/combos/${combo.$id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !combo.is_active }),
      })
      const updated = await res.json() as RoomComboWithRates
      setCombos(prev => prev.map(c => c.$id === updated.$id ? { ...updated, rates: combo.rates } : c))
    } catch {
      setError('Failed to update combo')
    }
  }

  async function addRate(comboId: string) {
    if (!rateGuests.trim() || !ratePrice) return
    try {
      const res = await fetch(`/api/admin/combos/${comboId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests_label: rateGuests.trim(), price: Number(ratePrice) }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const rate = await res.json() as RoomRate
      setCombos(prev =>
        prev.map(c => c.$id === comboId ? { ...c, rates: [...c.rates, rate] } : c)
      )
      setRateGuests('')
      setRatePrice('')
      setAddRateFor(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function deleteCombo(comboId: string) {
    try {
      await fetch(`/api/admin/combos/${comboId}`, { method: 'DELETE' })
      setCombos(prev => prev.filter(c => c.$id !== comboId))
      setDeleteComboId(null)
    } catch {
      setError('Failed to delete combo')
    }
  }

  async function removeRate(comboId: string, rateId: string) {
    try {
      await fetch(`/api/admin/combos/${comboId}/rates/${rateId}`, { method: 'DELETE' })
      setCombos(prev =>
        prev.map(c => c.$id === comboId ? { ...c, rates: c.rates.filter(r => r.$id !== rateId) } : c)
      )
    } catch {
      setError('Failed to remove rate')
    }
  }

  function toggleRoom(id: string) {
    setNewRoomIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function getRoomName(id: string) {
    return rooms.find(r => r.$id === id)?.name ?? id
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Existing combos */}
      {combos.map(combo => (
        <div key={combo.$id} className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{combo.name}</h3>
                {!combo.is_active && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {combo.capacity} ·{' '}
                {combo.room_ids
                  .split(',')
                  .map(id => getRoomName(id.trim()))
                  .join(' + ')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleActive(combo)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {combo.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
              <button
                onClick={() => setDeleteComboId(combo.$id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Rates */}
          {combo.rates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {combo.rates.map(rate => (
                <span
                  key={rate.$id}
                  className="group flex items-center gap-1 text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full"
                >
                  {rate.guests_label} — {formatPeso(rate.price)}
                  <button
                    onClick={() => removeRate(combo.$id, rate.$id)}
                    className="text-amber-400 hover:text-red-500 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add rate */}
          {addRateFor === combo.$id ? (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={rateGuests}
                onChange={e => setRateGuests(e.target.value)}
                placeholder="Guests label (e.g. 10-14 pax)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                value={ratePrice}
                onChange={e => setRatePrice(e.target.value)}
                placeholder="₱ Price"
                min={0}
                className="w-28 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => addRate(combo.$id)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg"
              >
                Add
              </button>
              <button
                onClick={() => setAddRateFor(null)}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAddRateFor(combo.$id); setRateGuests(''); setRatePrice('') }}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              + Add rate tier
            </button>
          )}
        </div>
      ))}

      {/* New combo form */}
      {showNew ? (
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4 border-2 border-amber-200">
          <h3 className="font-semibold text-gray-800">New Combination</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Room 1 + Room 2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Combined Capacity</label>
              <input
                type="text"
                value={newCapacity}
                onChange={e => setNewCapacity(e.target.value)}
                placeholder="e.g. up to 20 pax"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Select rooms to combine (pick at least 2)
            </label>
            <div className="flex flex-wrap gap-2">
              {rooms.filter(r => r.is_active).map(room => (
                <button
                  key={room.$id}
                  type="button"
                  onClick={() => toggleRoom(room.$id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    newRoomIds.includes(room.$id)
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
            {newRoomIds.length >= 2 && (
              <p className="text-xs text-amber-600 mt-2">
                Will combine: {newRoomIds.map(id => getRoomName(id)).join(' + ')}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={createCombo}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Combination
            </button>
            <button
              onClick={() => { setShowNew(false); setError('') }}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50 text-gray-500 hover:text-amber-700 text-sm rounded-xl transition-colors"
        >
          + New Room Combination
        </button>
      )}
    <ConfirmDialog
      open={!!deleteComboId}
      title="Delete Combination"
      message="This will permanently delete this room combination and all its rate tiers. This cannot be undone."
      confirmLabel="Delete Permanently"
      danger
      onConfirm={() => deleteComboId && deleteCombo(deleteComboId)}
      onCancel={() => setDeleteComboId(null)}
    />
    </div>
  )
}

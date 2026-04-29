import Link from 'next/link'
import { getAllRoomsWithRates } from '@/lib/db/rooms'
import { formatPeso } from '@/lib/utils/formatters'

export default async function RoomsPage() {
  const rooms = await getAllRoomsWithRates(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rooms.length} rooms configured</p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          + Add Room
        </Link>
      </div>

      <div className="grid gap-4">
        {rooms.map(room => (
          <div key={room.$id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{room.name}</h2>
                  {!room.is_active && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{room.capacity} · slug: {room.slug}</p>
              </div>
              <Link
                href={`/admin/rooms/${room.$id}`}
                className="text-sm text-amber-600 hover:text-amber-800 font-medium"
              >
                Edit
              </Link>
            </div>

            {room.rates.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {room.rates.map(rate => (
                  <span
                    key={rate.$id}
                    className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full"
                  >
                    {rate.guests_label} — {formatPeso(rate.price)}
                  </span>
                ))}
              </div>
            )}

            {room.rates.length === 0 && (
              <p className="mt-2 text-xs text-gray-400 italic">No rate tiers — add them on the edit page.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

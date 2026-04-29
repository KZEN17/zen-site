import { notFound } from 'next/navigation'
import { getRoomById, getRoomRates } from '@/lib/db/rooms'
import RoomForm from '@/components/admin/RoomForm'
import type { RoomWithRates } from '@/types/admin'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditRoomPage({ params }: Props) {
  const { id } = await params

  let room: RoomWithRates
  try {
    const [r, rates] = await Promise.all([getRoomById(id), getRoomRates(id)])
    // Serialize to plain objects for Client Component
    room = JSON.parse(JSON.stringify({ ...r, rates }))
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Room</h1>
        <p className="text-sm text-gray-500 mt-0.5">{room.name}</p>
      </div>
      <RoomForm room={room} />
    </div>
  )
}

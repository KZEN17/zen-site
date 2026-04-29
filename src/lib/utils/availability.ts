import type { Booking, Room } from '@/types/admin'

type RoomReference = Pick<Room, '$id' | 'name'>

function normalizeRoomName(name: string): string {
  return name.trim().toLowerCase()
}

function parseAuxRoomIds(auxRoomIds: string | null): string[] {
  if (!auxRoomIds) return []

  return auxRoomIds
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
}

export function groupBookingsByRoom(
  rooms: RoomReference[],
  bookings: Booking[]
): Record<string, Booking[]> {
  const roomIds = new Set(rooms.map(room => room.$id))
  const roomIdsByName = new Map(rooms.map(room => [normalizeRoomName(room.name), room.$id]))

  return bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    const matchingRoomIds = new Set<string>()

    if (roomIds.has(booking.room_id)) {
      matchingRoomIds.add(booking.room_id)
    }

    const roomIdByName = roomIdsByName.get(normalizeRoomName(booking.room_name))
    if (roomIdByName) {
      matchingRoomIds.add(roomIdByName)
    }

    for (const auxRoomId of parseAuxRoomIds(booking.aux_room_ids)) {
      if (roomIds.has(auxRoomId)) {
        matchingRoomIds.add(auxRoomId)
      }
    }

    for (const roomId of matchingRoomIds) {
      if (!acc[roomId]) acc[roomId] = []
      acc[roomId].push(booking)
    }

    return acc
  }, {})
}

import { Query, ID } from 'node-appwrite'
import { createAdminClient, TABLES } from '@/lib/appwrite/server'
import type { Room, RoomRate, RoomWithRates } from '@/types/admin'

export async function getRooms(activeOnly = true): Promise<Room[]> {
  const { tables, databaseId } = createAdminClient()
  const queries = [Query.orderAsc('sort_order'), Query.limit(50)]
  if (activeOnly) queries.push(Query.equal('is_active', true))
  const res = await tables.listRows(databaseId, TABLES.rooms, queries)
  return res.rows as unknown as Room[]
}

export async function getRoomById(id: string): Promise<Room> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.getRow(databaseId, TABLES.rooms, id)
  return row as unknown as Room
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const { tables, databaseId } = createAdminClient()
  const res = await tables.listRows(databaseId, TABLES.rooms, [
    Query.equal('slug', slug),
    Query.limit(1),
  ])

  if (res.rows.length === 0) return null
  return res.rows[0] as unknown as Room
}

export async function getRoomRates(roomId: string): Promise<RoomRate[]> {
  const { tables, databaseId } = createAdminClient()
  const res = await tables.listRows(databaseId, TABLES.roomRates, [
    Query.equal('room_id', roomId),
    Query.orderAsc('sort_order'),
    Query.limit(20),
  ])
  return res.rows as unknown as RoomRate[]
}

export async function getAllRoomsWithRates(activeOnly = true): Promise<RoomWithRates[]> {
  const rooms = await getRooms(activeOnly)
  return Promise.all(
    rooms.map(async room => {
      const rates = await getRoomRates(room.$id)
      return { ...room, rates }
    })
  )
}

export async function createRoom(data: {
  slug: string
  name: string
  capacity: string
  sort_order?: number
}): Promise<Room> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.createRow(databaseId, TABLES.rooms, ID.unique(), {
    slug: data.slug,
    name: data.name,
    capacity: data.capacity,
    sort_order: data.sort_order ?? 99,
    is_active: true,
  })
  return row as unknown as Room
}

export async function updateRoom(
  id: string,
  data: Partial<{ name: string; capacity: string; slug: string; sort_order: number; is_active: boolean }>
): Promise<Room> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.updateRow(databaseId, TABLES.rooms, id, data)
  return row as unknown as Room
}

export async function addRoomRate(
  roomId: string,
  data: { guests_label: string; price: number; sort_order?: number }
): Promise<RoomRate> {
  const { tables, databaseId } = createAdminClient()
  const existing = await getRoomRates(roomId)
  const row = await tables.createRow(databaseId, TABLES.roomRates, ID.unique(), {
    room_id: roomId,
    guests_label: data.guests_label,
    price: data.price,
    sort_order: data.sort_order ?? existing.length,
  })
  return row as unknown as RoomRate
}

export async function updateRoomRate(
  rateId: string,
  data: Partial<{ guests_label: string; price: number; sort_order: number }>
): Promise<RoomRate> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.updateRow(databaseId, TABLES.roomRates, rateId, data)
  return row as unknown as RoomRate
}

export async function deleteRoomRate(rateId: string): Promise<void> {
  const { tables, databaseId } = createAdminClient()
  await tables.deleteRow(databaseId, TABLES.roomRates, rateId)
}

export async function deleteRoom(id: string): Promise<void> {
  const { tables, databaseId } = createAdminClient()
  const rates = await getRoomRates(id)
  await Promise.all(rates.map(r => tables.deleteRow(databaseId, TABLES.roomRates, r.$id)))
  await tables.deleteRow(databaseId, TABLES.rooms, id)
}

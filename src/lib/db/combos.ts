import { Query, ID } from 'node-appwrite'
import { createAdminClient, TABLES } from '@/lib/appwrite/server'
import { plain } from '@/lib/utils/formatters'
import type { RoomCombo, RoomComboWithRates, RoomRate } from '@/types/admin'

const TABLE = 'room_combos'

export async function getCombos(activeOnly = true): Promise<RoomCombo[]> {
  const { tables, databaseId } = createAdminClient()
  const queries = [Query.orderAsc('name'), Query.limit(50)]
  if (activeOnly) queries.push(Query.equal('is_active', true))
  const res = await tables.listRows(databaseId, TABLE, queries)
  return plain(res.rows) as unknown as RoomCombo[]
}

export async function getComboById(id: string): Promise<RoomCombo> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.getRow(databaseId, TABLE, id)
  return plain(row) as unknown as RoomCombo
}

export async function getAllCombosWithRates(activeOnly = true): Promise<RoomComboWithRates[]> {
  const combos = await getCombos(activeOnly)
  return Promise.all(
    combos.map(async combo => {
      const rates = await getComboRates(combo.$id)
      return { ...combo, rates }
    })
  )
}

export async function getComboRates(comboId: string): Promise<RoomRate[]> {
  const { tables, databaseId } = createAdminClient()
  const res = await tables.listRows(databaseId, TABLES.roomRates, [
    Query.equal('room_id', comboId),
    Query.orderAsc('sort_order'),
    Query.limit(20),
  ])
  return plain(res.rows) as unknown as RoomRate[]
}

export async function createCombo(data: {
  name: string
  room_ids: string
  capacity: string
}): Promise<RoomCombo> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.createRow(databaseId, TABLE, ID.unique(), {
    name: data.name,
    room_ids: data.room_ids,
    capacity: data.capacity,
    is_active: true,
  })
  return plain(row) as unknown as RoomCombo
}

export async function updateCombo(
  id: string,
  data: Partial<{ name: string; room_ids: string; capacity: string; is_active: boolean }>
): Promise<RoomCombo> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.updateRow(databaseId, TABLE, id, data)
  return plain(row) as unknown as RoomCombo
}

export async function deleteCombo(id: string): Promise<void> {
  const { tables, databaseId } = createAdminClient()
  const rates = await getComboRates(id)
  await Promise.all(rates.map(r => tables.deleteRow(databaseId, TABLES.roomRates, r.$id)))
  await tables.deleteRow(databaseId, TABLE, id)
}

import { Query, ID } from 'node-appwrite'
import { createAdminClient } from '@/lib/appwrite/server'
import type { Shift } from '@/types/admin'

const TABLE = 'shifts'

export async function getShiftsForWeek(startDate: string, endDate: string): Promise<Shift[]> {
  const { tables, databaseId } = createAdminClient()
  const res = await tables.listRows(databaseId, TABLE, [
    Query.greaterThanEqual('shift_date', startDate),
    Query.lessThanEqual('shift_date', endDate),
    Query.orderAsc('shift_date'),
    Query.limit(500),
  ])
  return res.rows as unknown as Shift[]
}

export async function createShift(data: {
  employee_id: string
  employee_name: string
  shift_date: string
  start_time: string
  end_time: string
  notes?: string | null
}): Promise<Shift> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.createRow(databaseId, TABLE, ID.unique(), {
    employee_id: data.employee_id,
    employee_name: data.employee_name,
    shift_date: data.shift_date,
    start_time: data.start_time,
    end_time: data.end_time,
    notes: data.notes ?? null,
  })
  return row as unknown as Shift
}

export async function updateShift(
  id: string,
  data: Partial<{ start_time: string; end_time: string; notes: string | null }>
): Promise<Shift> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.updateRow(databaseId, TABLE, id, data)
  return row as unknown as Shift
}

export async function deleteShift(id: string): Promise<void> {
  const { tables, databaseId } = createAdminClient()
  await tables.deleteRow(databaseId, TABLE, id)
}

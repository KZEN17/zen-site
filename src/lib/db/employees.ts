import { Query, ID } from 'node-appwrite'
import { createAdminClient } from '@/lib/appwrite/server'
import type { Employee, EmployeeRole } from '@/types/admin'

const TABLE = 'employees'

export async function getEmployees(activeOnly = true): Promise<Employee[]> {
  const { tables, databaseId } = createAdminClient()
  const queries = [Query.orderAsc('name'), Query.limit(100)]
  if (activeOnly) queries.push(Query.equal('is_active', true))
  const res = await tables.listRows(databaseId, TABLE, queries)
  return res.rows as unknown as Employee[]
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.getRow(databaseId, TABLE, id)
  return row as unknown as Employee
}

export async function createEmployee(data: {
  name: string
  role: EmployeeRole
}): Promise<Employee> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.createRow(databaseId, TABLE, ID.unique(), {
    name: data.name,
    role: data.role,
    is_active: true,
  })
  return row as unknown as Employee
}

export async function updateEmployee(
  id: string,
  data: Partial<{ name: string; role: EmployeeRole; is_active: boolean }>
): Promise<Employee> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.updateRow(databaseId, TABLE, id, data)
  return row as unknown as Employee
}

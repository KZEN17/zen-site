/**
 * Creates the `employees` and `shifts` Appwrite tables.
 * Run with: npm run seed:schedule
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
import { Client, TablesDB, TablesDBIndexType } from 'node-appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
const apiKey = process.env.APPWRITE_API_KEY!
const databaseId = process.env.APPWRITE_DATABASE_ID!

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error('Missing required environment variables. Fill in .env.local first.')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
const db = new TablesDB(client)

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function createTableIfNotExists(tableId: string, name: string) {
  try {
    await db.getTable(databaseId, tableId)
    console.log(`  Table '${tableId}' already exists, skipping`)
  } catch {
    await db.createTable(databaseId, tableId, name)
    console.log(`  Created table '${tableId}'`)
  }
}

async function main() {
  console.log('ZEN House Calayo — Schedule Seed Script')
  console.log(`Endpoint: ${endpoint}`)
  console.log(`Database: ${databaseId}`)

  console.log('\n── Creating tables ──')

  // employees
  await createTableIfNotExists('employees', 'Employees')
  await sleep(500)
  try {
    await db.createVarcharColumn(databaseId, 'employees', 'name', 100, true)
    await db.createVarcharColumn(databaseId, 'employees', 'role', 50, true)
    await db.createBooleanColumn(databaseId, 'employees', 'is_active', false, true)
    console.log('  Added employees columns')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 409) console.log('  employees columns may already exist:', (e as Error).message)
  }

  // shifts
  await createTableIfNotExists('shifts', 'Shifts')
  await sleep(500)
  try {
    await db.createVarcharColumn(databaseId, 'shifts', 'employee_id', 50, true)
    await db.createVarcharColumn(databaseId, 'shifts', 'employee_name', 100, true)
    await db.createVarcharColumn(databaseId, 'shifts', 'shift_date', 10, true)
    await db.createVarcharColumn(databaseId, 'shifts', 'start_time', 5, true)
    await db.createVarcharColumn(databaseId, 'shifts', 'end_time', 5, true)
    await db.createVarcharColumn(databaseId, 'shifts', 'notes', 200, false)
    console.log('  Added shifts columns')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 409) console.log('  shifts columns may already exist:', (e as Error).message)
  }

  console.log('\n  Waiting 8s for Appwrite to index columns...')
  await sleep(8000)

  console.log('\n── Creating indexes ──')
  const indexes = [
    ['employees', 'idx_name', TablesDBIndexType.Key, ['name']],
    ['employees', 'idx_active', TablesDBIndexType.Key, ['is_active']],
    ['shifts', 'idx_employee', TablesDBIndexType.Key, ['employee_id']],
    ['shifts', 'idx_date', TablesDBIndexType.Key, ['shift_date']],
  ] as const

  for (const [tableId, key, type, columns] of indexes) {
    try {
      await db.createIndex(databaseId, tableId, key, type, [...columns])
      console.log(`  Created index ${tableId}.${key}`)
    } catch (e: unknown) {
      const err = e as { code?: number }
      if (err?.code !== 409) console.log(`  Index ${key} may already exist:`, (e as Error).message)
    }
  }

  console.log('\n✓ Done! Schedule tables created successfully.')
  console.log('\nNext steps:')
  console.log('  Visit /admin/schedule to start adding employees and shifts.')
}

main().catch(err => {
  console.error('\nFatal error:', err)
  process.exit(1)
})

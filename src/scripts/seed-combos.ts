/**
 * Creates the `room_combos` table and adds `aux_room_ids` to bookings.
 * Run with: npm run seed:combos
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
import { Client, TablesDB, TablesDBIndexType } from 'node-appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
const apiKey = process.env.APPWRITE_API_KEY!
const databaseId = process.env.APPWRITE_DATABASE_ID!

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error('Missing required environment variables.')
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
  console.log('ZEN House Calayo — Combos Seed Script')

  console.log('\n── Creating room_combos table ──')
  await createTableIfNotExists('room_combos', 'Room Combos')
  await sleep(500)
  try {
    await db.createVarcharColumn(databaseId, 'room_combos', 'name', 100, true)
    await db.createVarcharColumn(databaseId, 'room_combos', 'room_ids', 500, true)
    await db.createVarcharColumn(databaseId, 'room_combos', 'capacity', 50, true)
    await db.createBooleanColumn(databaseId, 'room_combos', 'is_active', false, true)
    console.log('  Added room_combos columns')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 409) console.log('  room_combos columns may already exist:', (e as Error).message)
  }

  console.log('\n── Adding aux_room_ids to bookings ──')
  try {
    await db.createVarcharColumn(databaseId, 'bookings', 'aux_room_ids', 500, false)
    console.log('  Added aux_room_ids column to bookings')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code === 409) {
      console.log('  aux_room_ids column already exists')
    } else {
      console.log('  Error adding aux_room_ids:', (e as Error).message)
    }
  }

  console.log('\n  Waiting 8s for Appwrite to index columns...')
  await sleep(8000)

  console.log('\n── Creating indexes ──')
  try {
    await db.createIndex(databaseId, 'room_combos', 'idx_active', TablesDBIndexType.Key, ['is_active'])
    console.log('  Created room_combos.idx_active')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 409) console.log('  Index may exist:', (e as Error).message)
  }

  console.log('\n✓ Done!')
  console.log('\nNext steps:')
  console.log('  Visit /admin/rooms and scroll down to create room combinations.')
}

main().catch(err => {
  console.error('\nFatal error:', err)
  process.exit(1)
})

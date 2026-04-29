/**
 * One-time seed script — creates Appwrite tables and loads room data.
 * Run with: npm run seed
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
import { Client, TablesDB, ID, TablesDBIndexType } from 'node-appwrite'
import { rooms } from '../data/siteData'

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

async function setupTables() {
  console.log('\n── Creating tables ──')

  // rooms
  await createTableIfNotExists('rooms', 'Rooms')
  await sleep(500)
  try {
    await db.createVarcharColumn(databaseId, 'rooms', 'slug', 100, true)
    await db.createVarcharColumn(databaseId, 'rooms', 'name', 100, true)
    await db.createVarcharColumn(databaseId, 'rooms', 'capacity', 50, true)
    await db.createIntegerColumn(databaseId, 'rooms', 'sort_order', false, undefined, undefined, 0)
    await db.createBooleanColumn(databaseId, 'rooms', 'is_active', false, true)
    console.log('  Added rooms columns')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 409) console.log('  rooms columns may already exist:', (e as Error).message)
  }

  // room_rates
  await createTableIfNotExists('room_rates', 'Room Rates')
  await sleep(500)
  try {
    await db.createVarcharColumn(databaseId, 'room_rates', 'room_id', 50, true)
    await db.createVarcharColumn(databaseId, 'room_rates', 'guests_label', 50, true)
    await db.createIntegerColumn(databaseId, 'room_rates', 'price', true)
    await db.createIntegerColumn(databaseId, 'room_rates', 'sort_order', false, undefined, undefined, 0)
    console.log('  Added room_rates columns')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 409) console.log('  room_rates columns may already exist:', (e as Error).message)
  }

  // bookings
  await createTableIfNotExists('bookings', 'Bookings')
  await sleep(500)
  try {
    await db.createVarcharColumn(databaseId, 'bookings', 'room_id', 50, true)
    await db.createVarcharColumn(databaseId, 'bookings', 'room_name', 100, true)
    await db.createVarcharColumn(databaseId, 'bookings', 'guest_name', 200, true)
    await db.createIntegerColumn(databaseId, 'bookings', 'guest_count', false)
    await db.createVarcharColumn(databaseId, 'bookings', 'check_in', 10, true)
    await db.createVarcharColumn(databaseId, 'bookings', 'check_out', 10, true)
    await db.createVarcharColumn(databaseId, 'bookings', 'check_in_time', 5, false, '14:00')
    await db.createVarcharColumn(databaseId, 'bookings', 'check_out_time', 5, false, '12:00')
    await db.createIntegerColumn(databaseId, 'bookings', 'total_amount', true)
    await db.createIntegerColumn(databaseId, 'bookings', 'down_payment', false, undefined, undefined, 0)
    await db.createEnumColumn(databaseId, 'bookings', 'payment_status', ['pending', 'partial', 'paid', 'cancelled'], false, 'pending')
    await db.createEnumColumn(databaseId, 'bookings', 'source', ['walk-in', 'facebook', 'website', 'phone'], false)
    await db.createVarcharColumn(databaseId, 'bookings', 'discount_code', 50, false)
    await db.createStringColumn(databaseId, 'bookings', 'notes', 2000, false)
    console.log('  Added bookings columns')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 409) console.log('  bookings columns may already exist:', (e as Error).message)
  }

  // expenses
  await createTableIfNotExists('expenses', 'Expenses')
  await sleep(500)
  try {
    await db.createEnumColumn(databaseId, 'expenses', 'category', ['salary', 'parking', 'cleaning', 'maintenance', 'utilities', 'supplies', 'other'], true)
    await db.createIntegerColumn(databaseId, 'expenses', 'amount', true)
    await db.createVarcharColumn(databaseId, 'expenses', 'expense_date', 10, true)
    await db.createStringColumn(databaseId, 'expenses', 'description', 500, false)
    console.log('  Added expenses columns')
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 409) console.log('  expenses columns may already exist:', (e as Error).message)
  }

  console.log('\n  Waiting 8s for Appwrite to index columns...')
  await sleep(8000)

  // Indexes
  console.log('\n── Creating indexes ──')
  const indexes = [
    ['rooms', 'idx_slug', TablesDBIndexType.Unique, ['slug']],
    ['rooms', 'idx_active', TablesDBIndexType.Key, ['is_active']],
    ['room_rates', 'idx_room_id', TablesDBIndexType.Key, ['room_id']],
    ['bookings', 'idx_room_id', TablesDBIndexType.Key, ['room_id']],
    ['bookings', 'idx_check_in', TablesDBIndexType.Key, ['check_in']],
    ['bookings', 'idx_check_out', TablesDBIndexType.Key, ['check_out']],
    ['bookings', 'idx_status', TablesDBIndexType.Key, ['payment_status']],
    ['expenses', 'idx_date', TablesDBIndexType.Key, ['expense_date']],
    ['expenses', 'idx_category', TablesDBIndexType.Key, ['category']],
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
}

async function seedRooms() {
  console.log('\n── Seeding rooms ──')
  await sleep(2000)

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i]
    try {
      const row = await db.createRow(databaseId, 'rooms', ID.unique(), {
        slug: room.id,
        name: room.name,
        capacity: room.capacity,
        sort_order: i,
        is_active: true,
      })
      console.log(`  Created room: ${room.name} (${row.$id})`)

      for (let j = 0; j < room.rates.length; j++) {
        const rate = room.rates[j]
        await db.createRow(databaseId, 'room_rates', ID.unique(), {
          room_id: row.$id,
          guests_label: rate.guests,
          price: rate.price,
          sort_order: j,
        })
      }
      console.log(`    Added ${room.rates.length} rate(s)`)
    } catch (e) {
      console.error(`  Error seeding ${room.name}:`, (e as Error).message)
    }
  }
}

async function main() {
  console.log('ZEN House Calayo — Appwrite Seed Script')
  console.log(`Endpoint: ${endpoint}`)
  console.log(`Project:  ${projectId}`)
  console.log(`Database: ${databaseId}`)

  await setupTables()
  await seedRooms()

  console.log('\n✓ Done! Tables and rooms created successfully.')
  console.log('\nNext steps:')
  console.log('  1. Create an admin user in Appwrite Console → Auth → Users.')
  console.log('  2. Visit /admin/login on your site to sign in.')
}

main().catch(err => {
  console.error('\nFatal error:', err)
  process.exit(1)
})

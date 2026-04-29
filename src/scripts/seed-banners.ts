/**
 * Creates the `banners` table in Appwrite.
 * Run with: npm run seed:banners
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
import { Client, TablesDB } from 'node-appwrite'

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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function hasColumn(tableId: string, colId: string): Promise<boolean> {
  try {
    const res = await db.listColumns(databaseId, tableId)
    const cols = (res.columns ?? []) as Array<{ key: string }>
    return cols.some(c => c.key === colId)
  } catch { return false }
}

async function main() {
  console.log('Setting up banners table…')

  // Create table if missing
  try {
    await db.getTable(databaseId, 'banners')
    console.log("  'banners' already exists")
  } catch {
    await db.createTable(databaseId, 'banners', 'Banners')
    console.log("  created 'banners'")
    await sleep(600)
  }

  // title — string(120), required
  if (!await hasColumn('banners', 'title')) {
    await db.createStringColumn(databaseId, 'banners', 'title', 120, true)
    console.log("  added 'title'")
    await sleep(300)
  } else { console.log("  'title' exists") }

  // image_url — string(1000), required
  if (!await hasColumn('banners', 'image_url')) {
    await db.createStringColumn(databaseId, 'banners', 'image_url', 1000, true)
    console.log("  added 'image_url'")
    await sleep(300)
  } else { console.log("  'image_url' exists") }

  // link_url — string(500), optional
  if (!await hasColumn('banners', 'link_url')) {
    await db.createStringColumn(databaseId, 'banners', 'link_url', 500, false)
    console.log("  added 'link_url'")
    await sleep(300)
  } else { console.log("  'link_url' exists") }

  // is_active — boolean, optional with default true
  if (!await hasColumn('banners', 'is_active')) {
    await db.createBooleanColumn(databaseId, 'banners', 'is_active', false, true)
    console.log("  added 'is_active'")
    await sleep(300)
  } else { console.log("  'is_active' exists") }

  console.log('\nDone!')
}

main().catch(e => { console.error(e); process.exit(1) })

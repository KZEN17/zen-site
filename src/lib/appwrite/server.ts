import { Client, TablesDB, Account } from 'node-appwrite'

export const TABLES = {
  rooms: 'rooms',
  roomRates: 'room_rates',
  bookings: 'bookings',
  expenses: 'expenses',
} as const

function getEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing environment variable: ${key}`)
  return val
}

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(getEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'))
    .setProject(getEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID'))
    .setKey(getEnv('APPWRITE_API_KEY'))

  return {
    account: new Account(client),
    tables: new TablesDB(client),
    databaseId: getEnv('APPWRITE_DATABASE_ID'),
  }
}

export function createSessionClient(sessionSecret: string) {
  const client = new Client()
    .setEndpoint(getEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'))
    .setProject(getEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID'))
    .setSession(sessionSecret)

  return {
    account: new Account(client),
  }
}

export function createUnauthClient() {
  const client = new Client()
    .setEndpoint(getEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'))
    .setProject(getEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID'))

  return {
    account: new Account(client),
  }
}

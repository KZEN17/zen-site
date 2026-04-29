import { NextRequest, NextResponse } from 'next/server'
import { createSessionClient } from '@/lib/appwrite/server'

export async function POST(request: NextRequest) {
  const sessionSecret = request.cookies.get('appwrite-session')?.value

  if (sessionSecret) {
    try {
      const { account } = createSessionClient(sessionSecret)
      await account.deleteSession('current')
    } catch {
      // Session may already be expired
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('appwrite-session')
  return response
}

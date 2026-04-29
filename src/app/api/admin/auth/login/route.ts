import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/appwrite/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const { account } = createAdminClient()
    const session = await account.createEmailPasswordSession({ email, password })

    const response = NextResponse.json({ success: true })
    response.cookies.set('appwrite-session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
}

import { NextResponse } from 'next/server'
import { getActiveBanners } from '@/lib/db/banners'

export async function GET() {
  try {
    const banners = await getActiveBanners()
    return NextResponse.json(banners)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

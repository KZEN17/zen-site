import { NextRequest, NextResponse } from 'next/server'
import { getAllBanners, createBanner } from '@/lib/db/banners'

export async function GET() {
  try {
    const banners = await getAllBanners()
    return NextResponse.json(banners)
  } catch (err) {
    console.error('GET /api/admin/banners:', err)
    return NextResponse.json({ error: 'Failed to load banners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.title?.trim() || !body.image_url?.trim()) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
    }
    const banner = await createBanner({
      title: body.title.trim(),
      image_url: body.image_url.trim(),
      link_url: body.link_url ?? null,
    })
    return NextResponse.json(banner, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/banners:', err)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}

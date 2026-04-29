import { NextRequest, NextResponse } from 'next/server'
import { updateBanner, deleteBanner } from '@/lib/db/banners'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const banner = await updateBanner(id, body)
    return NextResponse.json(banner)
  } catch (err) {
    console.error('PATCH /api/admin/banners/[id]:', err)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteBanner(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/banners/[id]:', err)
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
  }
}

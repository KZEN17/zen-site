import { Query, ID } from 'node-appwrite'
import { createAdminClient, TABLES } from '@/lib/appwrite/server'
import { plain } from '@/lib/utils/formatters'
import type { Banner } from '@/types/admin'

export async function getActiveBanners(): Promise<Banner[]> {
  const { tables, databaseId } = createAdminClient()
  const res = await tables.listRows(databaseId, TABLES.banners, [
    Query.equal('is_active', true),
    Query.limit(10),
  ])
  return plain(res.rows) as unknown as Banner[]
}

export async function getAllBanners(): Promise<Banner[]> {
  const { tables, databaseId } = createAdminClient()
  const res = await tables.listRows(databaseId, TABLES.banners, [
    Query.limit(50),
  ])
  return plain(res.rows) as unknown as Banner[]
}

export type BannerData = {
  title: string
  image_url: string
  link_url?: string | null
}

export async function createBanner(data: BannerData): Promise<Banner> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.createRow(databaseId, TABLES.banners, ID.unique(), {
    title: data.title,
    image_url: data.image_url,
    link_url: data.link_url ?? null,
    is_active: true,
  })
  return plain(row) as unknown as Banner
}

export async function updateBanner(
  id: string,
  data: Partial<BannerData & { is_active: boolean; sort_order: number }>
): Promise<Banner> {
  const { tables, databaseId } = createAdminClient()
  const row = await tables.updateRow(databaseId, TABLES.banners, id, data)
  return plain(row) as unknown as Banner
}

export async function deleteBanner(id: string): Promise<void> {
  const { tables, databaseId } = createAdminClient()
  await tables.deleteRow(databaseId, TABLES.banners, id)
}

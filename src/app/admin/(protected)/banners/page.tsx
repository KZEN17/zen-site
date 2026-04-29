import { getAllBanners } from '@/lib/db/banners'
import BannerManager from '@/components/admin/BannerManager'
import type { Banner } from '@/types/admin'

export default async function BannersPage() {
  let banners: Banner[] = []
  let setupNeeded = false

  try {
    const raw = await getAllBanners()
    banners = JSON.parse(JSON.stringify(raw))
  } catch {
    setupNeeded = true
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Banners</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Portrait promotional banners that pop up when visitors arrive. Only active banners are shown, one at a time.
        </p>
      </div>

      {setupNeeded && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Setup required:</strong> The <code>banners</code> table doesn&apos;t exist yet.
          Run <code className="bg-amber-100 px-1 rounded">npm run seed:banners</code> once to create it, then refresh.
        </div>
      )}

      <BannerManager initialBanners={banners} />
    </div>
  )
}

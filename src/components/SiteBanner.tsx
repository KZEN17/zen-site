'use client'
import { useEffect, useState } from 'react'
import type { Banner } from '@/types/admin'

const DISMISSED_KEY = 'zen_dismissed_banners'

function getDismissed(): string[] {
  try { return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? '[]') }
  catch { return [] }
}
function saveDismiss(id: string) {
  const cur = getDismissed()
  sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...new Set([...cur, id])]))
}

export default function SiteBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [dismissed, setDismissed] = useState<string[]>(getDismissed)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then((data: Banner[]) => {
        if (!Array.isArray(data) || data.length === 0) return
        const d = getDismissed()
        setBanners(data)
        setDismissed(d)
        const firstUnread = data.find(b => !d.includes(b.$id))
        if (firstUnread) setTimeout(() => setVisible(true), 800)
      })
      .catch(() => {})
  }, [])

  const banner = banners.find(b => !dismissed.includes(b.$id))

  function handleDismiss() {
    if (!banner) return
    saveDismiss(banner.$id)
    setVisible(false)
    setTimeout(() => {
      const next = banners.find(b => !getDismissed().includes(b.$id))
      if (next) { setDismissed(getDismissed()); setVisible(true) }
      else setDismissed(getDismissed())
    }, 300)
  }

  if (!visible || !banner) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      onClick={e => { if (e.target === e.currentTarget) handleDismiss() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Flyer card — fills most of the viewport height, capped at a portrait width */}
      <div
        className="relative z-10 animate-in fade-in zoom-in-95 duration-300 w-full"
        style={{ maxHeight: 'calc(100dvh - 48px)', maxWidth: 'min(480px, calc((100dvh - 48px) * 0.72))' }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-3 -right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg text-gray-600 hover:text-gray-900 text-lg leading-none transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* eslint-disable @next/next/no-img-element */}
        {banner.link_url ? (
          <a href={banner.link_url} target="_blank" rel="noopener noreferrer" onClick={handleDismiss}>
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
              style={{ maxHeight: 'calc(100dvh - 48px)' }}
            />
          </a>
        ) : (
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-contain rounded-2xl shadow-2xl"
            style={{ maxHeight: 'calc(100dvh - 48px)' }}
          />
        )}
        {/* eslint-enable @next/next/no-img-element */}
      </div>
    </div>
  )
}

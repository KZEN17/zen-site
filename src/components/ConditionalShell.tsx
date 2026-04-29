'use client'
import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SiteBanner from '@/components/SiteBanner'

export function ConditionalNav() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <Navigation />
}

export function ConditionalFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <Footer />
}

export function ConditionalBanner() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <SiteBanner />
}

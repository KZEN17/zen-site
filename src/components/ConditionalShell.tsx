'use client'
import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

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

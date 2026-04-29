'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/admin/bookings', label: 'Bookings', icon: '≡' },
  { href: '/admin/calendar', label: 'Calendar', icon: '◫' },
  { href: '/admin/rooms', label: 'Rooms', icon: '⌂' },
  { href: '/admin/schedule', label: 'Schedule', icon: '⊞' },
  { href: '/admin/expenses', label: 'Expenses', icon: '₱' },
  { href: '/admin/reports', label: 'Reports', icon: '↗' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-700">
        <p className="font-bold text-base leading-tight">ZEN House</p>
        <p className="text-gray-400 text-xs mt-0.5">Calayo Admin</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-gray-400 hover:text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createSessionClient } from '@/lib/appwrite/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('appwrite-session')

  if (!sessionCookie?.value) {
    redirect('/admin/login')
  }

  try {
    const { account } = createSessionClient(sessionCookie.value)
    await account.get()
  } catch {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

import { getEmployees } from '@/lib/db/employees'
import { getShiftsForWeek } from '@/lib/db/shifts'
import WeeklySchedule from '@/components/admin/WeeklySchedule'
import type { Employee, Shift } from '@/types/admin'

function getMondayOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default async function SchedulePage() {
  const weekStart = getMondayOfWeek(new Date())
  const weekEnd = addDays(weekStart, 6)

  let employees: Employee[] = []
  let shifts: Shift[] = []

  try {
    const [rawEmployees, rawShifts] = await Promise.all([
      getEmployees(false),
      getShiftsForWeek(weekStart, weekEnd),
    ])
    employees = JSON.parse(JSON.stringify(rawEmployees))
    shifts = JSON.parse(JSON.stringify(rawShifts))
  } catch (err: unknown) {
    const msg = (err as Error).message ?? ''
    if (msg.includes('not found') || msg.includes('Collection') || msg.includes('Table')) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Schedule</h1>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="font-semibold text-amber-900 mb-2">Setup Required</h2>
            <p className="text-sm text-amber-800 mb-3">
              The schedule tables don&apos;t exist yet. Run the setup script to create them:
            </p>
            <code className="block bg-white border border-amber-200 rounded-lg px-4 py-2 text-sm font-mono text-gray-800">
              npm run seed:schedule
            </code>
          </div>
        </div>
      )
    }
    throw err
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employee Schedule</h1>
        <p className="text-sm text-gray-500 mt-0.5">Weekly work schedule for all staff</p>
      </div>
      <WeeklySchedule employees={employees} shifts={shifts} weekStart={weekStart} />
    </div>
  )
}

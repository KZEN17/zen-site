'use client'
import { useState, useEffect, useCallback } from 'react'
import StatCard from '@/components/admin/StatCard'
import RevenueChart from '@/components/admin/RevenueChart'
import OccupancyChart from '@/components/admin/OccupancyChart'
import MonthNav from '@/components/admin/MonthNav'
import { formatPeso, formatMonthYear } from '@/lib/utils/formatters'
import { EXPENSE_CATEGORY_LABELS } from '@/types/admin'
import type { MonthlyReport, YearlyData, ExpenseCategory } from '@/types/admin'

export default function ReportsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null)
  const [yearly, setYearly] = useState<YearlyData[] | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [monthRes, yearRes] = await Promise.all([
        fetch(`/api/admin/reports?year=${year}&month=${month}`),
        fetch(`/api/admin/reports?year=${year}`),
      ])
      setMonthly(await monthRes.json())
      setYearly(await yearRes.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // MonthNav calls router.push with ?year&month — intercept via window location
  // Instead we own state directly with the nav buttons below
  function go(delta: number) {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setMonth(m)
    setYear(y)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => go(-1)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
          >
            ←
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[130px] text-center">
            {formatMonthYear(year, month)}
          </span>
          <button
            onClick={() => go(1)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
          >
            →
          </button>
          <input
            type="number"
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
            min={2020}
            max={2040}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {loading && <div className="text-sm text-gray-400">Loading…</div>}

      {monthly && (
        <>
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              {formatMonthYear(year, month)} Summary
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Revenue"
                value={formatPeso(monthly.revenue.total)}
                subtitle={`${monthly.bookingCount} bookings`}
                accent="amber"
              />
              <StatCard
                title="Expenses"
                value={formatPeso(monthly.expenses.total)}
                accent="red"
              />
              <StatCard
                title="Net Income"
                value={formatPeso(monthly.netIncome)}
                accent={monthly.netIncome >= 0 ? 'green' : 'red'}
              />
              <StatCard
                title="Avg Occupancy"
                value={`${Math.round(
                  (monthly.occupancy.byRoom.reduce((s, r) => s + r.rate, 0) /
                    Math.max(monthly.occupancy.byRoom.length, 1)) *
                    100
                )}%`}
                accent="blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {monthly.revenue.byRoom.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Revenue by Room</h3>
                <div className="space-y-2">
                  {monthly.revenue.byRoom
                    .sort((a, b) => b.amount - a.amount)
                    .map(r => (
                      <div key={r.room_name} className="flex justify-between text-sm">
                        <span className="text-gray-600">{r.room_name}</span>
                        <span className="font-medium text-amber-700">{formatPeso(r.amount)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {monthly.expenses.byCategory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Expenses by Category</h3>
                <div className="space-y-2">
                  {monthly.expenses.byCategory
                    .sort((a, b) => b.amount - a.amount)
                    .map(c => (
                      <div key={c.category} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {EXPENSE_CATEGORY_LABELS[c.category as ExpenseCategory] ?? c.category}
                        </span>
                        <span className="font-medium text-red-600">{formatPeso(c.amount)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {monthly.occupancy.byRoom.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-1">
                Room Occupancy — {formatMonthYear(year, month)}
              </h3>
              <p className="text-xs text-gray-400 mb-4">Nights booked vs available this month</p>
              <OccupancyChart data={monthly.occupancy.byRoom} />
            </div>
          )}
        </>
      )}

      {yearly && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue vs Expenses — {year}</h3>
          <RevenueChart data={yearly} />
        </div>
      )}
    </div>
  )
}

'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { YearlyData } from '@/types/admin'
import { formatMonthShort } from '@/lib/utils/formatters'

interface Props {
  data: YearlyData[]
}

function formatK(value: number) {
  if (value >= 1000) return `₱${(value / 1000).toFixed(0)}k`
  return `₱${value}`
}

export default function RevenueChart({ data }: Props) {
  const chartData = data.map(d => ({
    month: formatMonthShort(d.month - 1),
    Revenue: d.revenue,
    Expenses: d.expenses,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, undefined]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend />
        <Bar dataKey="Revenue" fill="#d97706" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

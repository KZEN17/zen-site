'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'

interface RoomOccupancy {
  room_name: string
  bookedNights: number
  totalNights: number
  rate: number
}

interface Props {
  data: RoomOccupancy[]
}

export default function OccupancyChart({ data }: Props) {
  const chartData = data
    .filter(d => d.totalNights > 0)
    .map(d => ({
      name: d.room_name,
      occupancy: Math.round(d.rate * 100),
      nights: d.bookedNights,
    }))
    .sort((a, b) => b.occupancy - a.occupancy)

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, _name: any, props: any) => [
            `${value}% (${props.payload.nights} nights)`,
            'Occupancy',
          ]}
        />
        <Bar dataKey="occupancy" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.occupancy >= 70 ? '#16a34a' : entry.occupancy >= 40 ? '#d97706' : '#94a3b8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

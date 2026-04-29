interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  accent?: 'green' | 'red' | 'amber' | 'blue'
}

const accentClasses = {
  green: 'border-l-green-500 text-green-600',
  red: 'border-l-red-500 text-red-600',
  amber: 'border-l-amber-500 text-amber-600',
  blue: 'border-l-blue-500 text-blue-600',
}

export default function StatCard({ title, value, subtitle, accent = 'amber' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${accentClasses[accent].split(' ')[0]} p-5`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${accentClasses[accent].split(' ')[1]}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { formatMonthYear } from '@/lib/utils/formatters'

interface Props {
  year: number
  month: number
  basePath: string
}

export default function MonthNav({ year, month, basePath }: Props) {
  const router = useRouter()

  function go(deltaMonths: number) {
    let m = month + deltaMonths
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    router.push(`${basePath}?year=${y}&month=${m}`)
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => go(-1)}
        className="px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
      >
        ←
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
        {formatMonthYear(year, month)}
      </span>
      <button
        onClick={() => go(1)}
        className="px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
      >
        →
      </button>
    </div>
  )
}

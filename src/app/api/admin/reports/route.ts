import { NextRequest, NextResponse } from 'next/server'
import { getMonthlyReport, getYearlyData } from '@/lib/db/reports'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
    const monthParam = searchParams.get('month')

    if (monthParam) {
      const month = parseInt(monthParam)
      const report = await getMonthlyReport(year, month)
      return NextResponse.json(report)
    }

    const yearly = await getYearlyData(year)
    return NextResponse.json(yearly)
  } catch (err) {
    console.error('GET /api/admin/reports:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

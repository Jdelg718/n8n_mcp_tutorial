import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector'
import { SummaryStats } from '@/components/analytics/SummaryStats'
import { CalorieTrendsChart } from '@/components/analytics/CalorieTrendsChart'
import { MacroDistributionChart } from '@/components/analytics/MacroDistributionChart'
import { InsightsPanel } from '@/components/analytics/InsightsPanel'
import { getAnalyticsSummary, getDailyNutrition, getMacroDistribution } from './actions'
import { startOfDay, subDays, subMonths, format } from 'date-fns'

type SearchParams = Promise<{
  range?: string
}>

function calculateDateRange(range: string = '7d'): { startDate: string; endDate: string } {
  const now = new Date()
  const endDate = startOfDay(now)
  let startDate: Date

  switch (range) {
    case 'today':
      startDate = startOfDay(now)
      break
    case '7d':
      startDate = subDays(endDate, 6) // Last 7 days including today
      break
    case '30d':
      startDate = subDays(endDate, 29) // Last 30 days including today
      break
    case '90d':
      startDate = subDays(endDate, 89) // Last 90 days including today
      break
    case 'all':
      // Set to 2 years ago as a practical "all time" limit
      startDate = subMonths(endDate, 24)
      break
    default:
      startDate = subDays(endDate, 6)
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  }
}

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const range = params.range || '7d'
  const { startDate, endDate } = calculateDateRange(range)

  // Fetch all analytics data
  const [summary, dailyNutrition, macroDistribution] = await Promise.all([
    getAnalyticsSummary(startDate, endDate),
    getDailyNutrition(startDate, endDate),
    getMacroDistribution(startDate, endDate),
  ])

  if ('error' in summary) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-red-600">Error loading analytics: {summary.error}</p>
        </div>
      </div>
    )
  }

  // Handle errors for chart data
  const hasChartErrors = 'error' in dailyNutrition || 'error' in macroDistribution

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <TimeRangeSelector />

      <div className="mb-6">
        <SummaryStats summary={summary} />
      </div>

      {hasChartErrors ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-red-600">
            Error loading chart data:
            {'error' in dailyNutrition ? ` ${dailyNutrition.error}` : ''}
            {'error' in macroDistribution ? ` ${macroDistribution.error}` : ''}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CalorieTrendsChart
            data={Array.isArray(dailyNutrition) ? dailyNutrition : []}
            dateRange={summary.dateRange}
          />
          <MacroDistributionChart
            data={!Array.isArray(macroDistribution) ? macroDistribution : { protein: 0, carbs: 0, fat: 0 }}
          />
        </div>
      )}

      {/* AI Insights Panel - Full width below charts */}
      <div className="mt-6">
        <InsightsPanel startDate={startDate} endDate={endDate} />
      </div>
    </div>
  )
}

import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector'
import { getAnalyticsSummary } from './actions'
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

  const summary = await getAnalyticsSummary(startDate, endDate)

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

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <TimeRangeSelector />

      {/* Summary Stats - placeholder for next task */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {summary.dateRange}
          </p>
        </div>

        {summary.totalMeals === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No meals logged in this period. Try a different time range.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Meals</p>
              <p className="text-3xl font-bold text-gray-900">{summary.totalMeals}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Avg Calories/day</p>
              <p className="text-3xl font-bold text-gray-900">{summary.avgCalories}</p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Avg Protein/day</p>
              <p className="text-3xl font-bold text-gray-900">{summary.avgProtein}</p>
              <p className="text-xs text-gray-500">g</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Avg Carbs/day</p>
              <p className="text-3xl font-bold text-gray-900">{summary.avgCarbs}</p>
              <p className="text-xs text-gray-500">g</p>
            </div>
          </div>
        )}
      </div>

      {/* Placeholder for charts */}
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center py-8">
          Charts will be added in next phase
        </p>
      </div>
    </div>
  )
}

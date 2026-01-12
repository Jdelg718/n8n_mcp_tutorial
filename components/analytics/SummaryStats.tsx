import type { AnalyticsSummary } from '@/app/dashboard/analytics/actions'
import Link from 'next/link'

type SummaryStatsProps = {
  summary: AnalyticsSummary
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  // Empty state
  if (summary.totalMeals === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">{summary.dateRange}</p>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            No meals logged in this period. Try a different time range.
          </p>
          <Link
            href="/dashboard/meals/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Log a Meal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Summary Statistics</h2>
        <p className="text-sm text-gray-600">{summary.dateRange}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Meals Card */}
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Meals</p>
          <p className="text-4xl font-bold text-gray-900">{summary.totalMeals}</p>
          <p className="text-xs text-gray-500 mt-1">
            meals logged
          </p>
        </div>

        {/* Avg Calories Card */}
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-600 mb-2">Avg Calories</p>
          <p className="text-4xl font-bold text-blue-600">{summary.avgCalories}</p>
          <p className="text-xs text-gray-500 mt-1">
            kcal per day
          </p>
        </div>

        {/* Avg Protein Card */}
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-600 mb-2">Avg Protein</p>
          <p className="text-4xl font-bold text-purple-600">{summary.avgProtein}</p>
          <p className="text-xs text-gray-500 mt-1">
            g per day
          </p>
        </div>

        {/* Avg Carbs Card */}
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-600 mb-2">Avg Carbs</p>
          <p className="text-4xl font-bold text-orange-600">{summary.avgCarbs}</p>
          <p className="text-xs text-gray-500 mt-1">
            g per day
          </p>
        </div>
      </div>

      {/* Additional context */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Averages calculated over {summary.dateRange.split(' - ')[1] ? 'the selected period' : 'today'}
        </p>
      </div>
    </div>
  )
}

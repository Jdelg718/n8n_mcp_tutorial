import { getTodayTotals, UserGoals } from '@/app/dashboard/actions'
import { ProgressBar } from './ProgressBar'
import Link from 'next/link'

type TodayTotalsProps = {
  goals: UserGoals | null
}

export async function TodayTotals({ goals }: TodayTotalsProps) {
  const result = await getTodayTotals()

  if ('error' in result) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">Error loading today's totals: {result.error}</p>
      </div>
    )
  }

  const { totalMeals, calories, protein, carbs, fat, fiber, sugar, sodium } = result

  // Empty state - no meals logged today
  if (totalMeals === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Nutrition</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No meals logged today</p>
          <Link
            href="/dashboard/meals/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Log Your First Meal
          </Link>
        </div>
      </div>
    )
  }

  // Use goals from prop or fall back to hardcoded defaults
  const nutritionGoals = goals || {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
  }

  return (
    <div className="card">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Today's Nutrition</h2>
        <span className="text-sm text-gray-600">{totalMeals} meals logged</span>
      </div>

      <div className="space-y-6">
        {/* Main macros with progress bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressBar
            label="Calories"
            value={calories}
            max={nutritionGoals.calories}
            unit="kcal"
            color="blue"
          />
          <ProgressBar
            label="Protein"
            value={protein}
            max={nutritionGoals.protein}
            unit="g"
            color="purple"
          />
          <ProgressBar
            label="Carbs"
            value={carbs}
            max={nutritionGoals.carbs}
            unit="g"
            color="orange"
          />
          <ProgressBar
            label="Fat"
            value={fat}
            max={nutritionGoals.fat}
            unit="g"
            color="yellow"
          />
        </div>

        {/* Optional nutrition info - show if any values exist */}
        {(fiber > 0 || sugar > 0 || sodium > 0) && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Additional Info</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {fiber > 0 && (
                <div>
                  <span className="text-gray-600">Fiber:</span>{' '}
                  <span className="font-medium">{fiber}g</span>
                </div>
              )}
              {sugar > 0 && (
                <div>
                  <span className="text-gray-600">Sugar:</span>{' '}
                  <span className="font-medium">{sugar}g</span>
                </div>
              )}
              {sodium > 0 && (
                <div>
                  <span className="text-gray-600">Sodium:</span>{' '}
                  <span className="font-medium">{sodium}mg</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { getRecentMeals, RecentMeal } from '@/app/dashboard/actions'
import Link from 'next/link'
import { RecentMealsList } from './RecentMealsList'

export async function RecentMeals() {
  const result = await getRecentMeals(5)

  if ('error' in result) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">Error loading recent meals: {result.error}</p>
      </div>
    )
  }

  const meals = result as RecentMeal[]

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Meals</h2>
        <Link
          href="/dashboard/meals"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all →
        </Link>
      </div>

      <RecentMealsList meals={meals} />
    </div>
  )
}

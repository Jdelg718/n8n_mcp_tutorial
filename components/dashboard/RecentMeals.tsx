import { getRecentMeals, RecentMeal } from '@/app/dashboard/actions'
import Link from 'next/link'
import Image from 'next/image'

// Simple relative time formatter (no date-fns dependency)
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// Meal type badge colors
function getMealTypeBadgeColor(mealType: string): string {
  const colors: Record<string, string> = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-blue-100 text-blue-800',
    dinner: 'bg-purple-100 text-purple-800',
    snack: 'bg-green-100 text-green-800',
  }
  return colors[mealType] || 'bg-gray-100 text-gray-800'
}

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

      {meals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No meals yet</p>
          <Link
            href="/dashboard/meals/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Log Your First Meal
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <Link
              key={meal.id}
              href={`/dashboard/meals/${meal.id}/edit`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Thumbnail */}
              {meal.photo_url ? (
                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={meal.photo_url}
                    alt={meal.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <span className="text-gray-400 text-xl">🍽️</span>
                </div>
              )}

              {/* Meal info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{meal.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getMealTypeBadgeColor(
                      meal.meal_type
                    )}`}
                  >
                    {meal.meal_type}
                  </span>
                  <span className="text-gray-500">
                    {getRelativeTime(new Date(meal.logged_at))}
                  </span>
                </div>
                {meal.calories !== null && (
                  <p className="text-sm text-gray-600 mt-1">{meal.calories} kcal</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

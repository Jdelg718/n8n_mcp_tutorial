import Link from 'next/link'
import Image from 'next/image'
import type { Meal } from '@/types/meal'
import { LocalDateTime } from '@/components/LocalDateTime'
import { DeleteButton } from '@/components/meals/DeleteButton'
import { MealFilters } from '@/components/meals/MealFilters'
import { Pagination } from '@/components/meals/Pagination'
import { getMeals } from './actions'

type SearchParams = Promise<{
  dateRange?: string
  mealType?: string
  search?: string
  page?: string
}>

export default async function MealsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters = {
    dateRange: params.dateRange,
    mealType: params.mealType,
    search: params.search,
  }

  // Parse page number, default to 1
  const page = parseInt(params.page || '1', 10)
  const pageSize = 20

  const { meals, total, page: currentPage, pageSize: size } = await getMeals(filters, page, pageSize)
  const mealsList = meals as Meal[]

  // Calculate pagination info
  const totalPages = Math.ceil(total / size)
  const startIndex = (currentPage - 1) * size + 1
  const endIndex = Math.min(currentPage * size, total)

  // Create filter summary
  const getFilterSummary = () => {
    const parts: string[] = []

    if (filters.dateRange && filters.dateRange !== 'all') {
      const labels: Record<string, string> = {
        'today': 'Today',
        'yesterday': 'Yesterday',
        'last-7-days': 'Last 7 days',
        'last-30-days': 'Last 30 days',
        'this-month': 'This month',
        'last-month': 'Last month',
      }
      parts.push(labels[filters.dateRange] || filters.dateRange)
    }

    if (filters.mealType && filters.mealType !== 'all') {
      parts.push(filters.mealType.charAt(0).toUpperCase() + filters.mealType.slice(1))
    }

    if (filters.search) {
      parts.push(`"${filters.search}"`)
    }

    return parts.length > 0 ? ` (${parts.join(', ')})` : ''
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Meals</h1>
        <Link
          href="/dashboard/meals/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Log New Meal
        </Link>
      </div>

      <MealFilters />

      {/* Results summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {total > 0 ? (
            <>
              Showing <span className="font-medium">{startIndex}-{endIndex}</span> of{' '}
              <span className="font-medium">{total}</span> meal{total !== 1 ? 's' : ''}{getFilterSummary()}
            </>
          ) : (
            <>No meals found{getFilterSummary()}</>
          )}
        </p>
      </div>

      {mealsList.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">
            {filters.dateRange || filters.mealType || filters.search
              ? 'No meals found matching your filters'
              : 'No meals logged yet'}
          </p>
          <Link
            href="/dashboard/meals/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {filters.dateRange || filters.mealType || filters.search
              ? 'Clear Filters'
              : 'Log Your First Meal'}
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {mealsList.map((meal) => (
              <li key={meal.id} className="p-6 hover:bg-gray-50">
                <div className="flex gap-4 items-start">
                  {meal.photo_url && (
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={meal.photo_url}
                        alt={meal.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {meal.title}
                    </h3>
                    {meal.description && (
                      <p className="mt-1 text-sm text-gray-600">{meal.description}</p>
                    )}

                    {/* Nutrition summary */}
                    {meal.calories !== null && (
                      <div className="mt-2 text-sm text-gray-700 font-medium">
                        {meal.calories} cal
                        {meal.protein !== null && ` | ${Math.round(meal.protein)}g protein`}
                        {meal.carbs !== null && ` | ${Math.round(meal.carbs)}g carbs`}
                        {meal.fat !== null && ` | ${Math.round(meal.fat)}g fat`}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {meal.meal_type}
                      </span>
                      <LocalDateTime date={meal.logged_at} />

                      {/* AI confidence badge */}
                      {meal.ai_confidence !== null && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meal.ai_confidence >= 0.8
                            ? 'bg-green-100 text-green-800'
                            : meal.ai_confidence >= 0.6
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          AI {Math.round(meal.ai_confidence * 100)}%
                        </span>
                      )}

                      {/* Manual entry badge */}
                      {meal.calories !== null && meal.ai_confidence === null && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Manual
                        </span>
                      )}
                    </div>

                    {/* Edit and Delete actions */}
                    <div className="mt-3 flex items-center gap-4">
                      <Link
                        href={`/dashboard/meals/${meal.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteButton mealId={meal.id} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  )
}

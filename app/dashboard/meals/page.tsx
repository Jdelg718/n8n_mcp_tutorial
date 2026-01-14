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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Meals</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Track and manage your meal history</p>
        </div>
        <Link
          href="/dashboard/meals/new"
          className="btn btn-primary"
        >
          + Log New Meal
        </Link>
      </div>

      <MealFilters />

      {/* Results summary */}
      <div className="mb-4 pl-1">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {total > 0 ? (
            <>
              Showing <span className="font-medium text-[var(--color-text-primary)]">{startIndex}-{endIndex}</span> of{' '}
              <span className="font-medium text-[var(--color-text-primary)]">{total}</span> meal{total !== 1 ? 's' : ''}{getFilterSummary()}
            </>
          ) : (
            <>No meals found{getFilterSummary()}</>
          )}
        </p>
      </div>

      {mealsList.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--color-text-secondary)] mb-6">
            {filters.dateRange || filters.mealType || filters.search
              ? 'No meals found matching your filters'
              : 'No meals logged yet'}
          </p>
          <Link
            href="/dashboard/meals/new"
            className="btn btn-primary"
          >
            {filters.dateRange || filters.mealType || filters.search
              ? 'Clear Filters'
              : 'Log Your First Meal'}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <ul className="divide-y divide-gray-100">
            {mealsList.map((meal) => (
              <li key={meal.id} className="p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex gap-4 items-start">
                  {meal.photo_url && (
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-100 bg-gray-50">
                      <Image
                        src={meal.photo_url}
                        alt={meal.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--color-text-primary)] truncate pr-4">
                          {meal.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                          <span className="capitalize inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {meal.meal_type}
                          </span>
                          <span className="text-gray-300">•</span>
                          <LocalDateTime date={meal.logged_at} className="text-xs" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* We can make actions always visible on mobile, hide on desktop until hover? No, keep simple */}
                      </div>
                    </div>

                    {meal.description && (
                      <p className="mt-2 text-sm text-[var(--color-text-secondary)] line-clamp-1">{meal.description}</p>
                    )}

                    {/* Nutrition summary - Compact */}
                    {meal.calories !== null && (
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] font-medium">
                        <span className="text-[var(--color-text-primary)]">{meal.calories} kcal</span>
                        {meal.protein !== null && <span className="text-slate-500">P: {Math.round(meal.protein)}g</span>}
                        {meal.carbs !== null && <span className="text-slate-500">C: {Math.round(meal.carbs)}g</span>}
                        {meal.fat !== null && <span className="text-slate-500">F: {Math.round(meal.fat)}g</span>}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      {/* Badges */}
                      <div className="flex gap-2">
                        {meal.ai_confidence !== null && (
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${meal.ai_confidence >= 0.8
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : meal.ai_confidence >= 0.6
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                              }`}
                          >
                            AI {Math.round(meal.ai_confidence * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Edit/Delete - Always visible now for usability */}
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/meals/${meal.id}/edit`}
                          className="text-xs font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]"
                        >
                          Edit
                        </Link>
                        <DeleteButton mealId={meal.id} />
                      </div>
                    </div>

                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <Pagination page={currentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import type { Meal } from '@/types/meal'

export default async function MealsPage() {
  const supabase = await createClient()

  // Fetch meals for current user
  const { data: meals, error } = await supabase
    .from('meal_logs')
    .select('*')
    .order('logged_at', { ascending: false })

  if (error) {
    console.error('Error fetching meals:', error)
  }

  const mealsList = (meals || []) as Meal[]

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

      {mealsList.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No meals logged yet</p>
          <Link
            href="/dashboard/meals/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Log Your First Meal
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
                      <span>{format(new Date(meal.logged_at), 'MMM d, yyyy h:mm a')}</span>

                      {/* AI confidence badge */}
                      {meal.ai_confidence !== null && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            meal.ai_confidence >= 0.8
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
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

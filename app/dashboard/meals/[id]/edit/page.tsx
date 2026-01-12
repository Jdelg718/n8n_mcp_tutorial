import MealForm from '@/components/meals/MealForm'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateMeal } from '@/app/dashboard/meals/actions'

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: meal } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('id', id)
    .single()

  if (!meal) {
    notFound()
  }

  // Convert logged_at to datetime-local format
  const loggedAt = new Date(meal.logged_at)
  const localDatetime = new Date(loggedAt.getTime() - loggedAt.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  // Prepare initial data for form
  const initialData = {
    title: meal.title,
    description: meal.description || '',
    meal_type: meal.meal_type,
    logged_at: localDatetime,
    photo_url: meal.photo_url || '',
    calories: meal.calories ?? undefined,
    protein: meal.protein ?? undefined,
    carbs: meal.carbs ?? undefined,
    fat: meal.fat ?? undefined,
    fiber: meal.fiber ?? undefined,
    sugar: meal.sugar ?? undefined,
    sodium: meal.sodium ?? undefined,
    ai_confidence: meal.ai_confidence ?? undefined,
  }

  // Bind mealId to updateMeal action
  const updateMealWithId = updateMeal.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/meals"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Meals
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Meal</h1>
        <MealForm action={updateMealWithId} initialData={initialData} />
      </div>
    </div>
  )
}

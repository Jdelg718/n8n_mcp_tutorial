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

  // Pass raw UTC timestamp to client component for local conversion
  const loggedAt = new Date(meal.logged_at).toISOString()

  // Prepare initial data for form
  const initialData = {
    title: meal.title,
    description: meal.description || '',
    meal_type: meal.meal_type,
    logged_at: loggedAt,
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/meals"
          className="text-sm text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]"
        >
          ← Back to Meals
        </Link>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Edit Meal</h1>
        </div>
        <MealForm action={updateMealWithId} initialData={initialData} />
      </div>
    </div>
  )
}

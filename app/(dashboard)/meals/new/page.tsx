import MealForm from '@/components/meals/MealForm'
import Link from 'next/link'

export default function NewMealPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Log New Meal</h1>
        <MealForm />
      </div>
    </div>
  )
}

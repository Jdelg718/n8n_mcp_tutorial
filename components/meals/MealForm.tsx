'use client'

import { createMeal } from '@/app/(dashboard)/meals/actions'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MealForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createMeal, null)

  // Get current datetime in local timezone for datetime-local input
  const now = new Date()
  const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  // Redirect on success
  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard/meals')
    }
  }, [state?.success, router])

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Meal Name *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="e.g., Chicken salad, Protein shake"
        />
        {state?.errors?.title && (
          <p className="mt-1 text-sm text-red-600">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="meal_type" className="block text-sm font-medium text-gray-700">
          Meal Type *
        </label>
        <select
          id="meal_type"
          name="meal_type"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="">Select a meal type</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
        {state?.errors?.meal_type && (
          <p className="mt-1 text-sm text-red-600">{state.errors.meal_type[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700">
          Date & Time *
        </label>
        <input
          id="logged_at"
          name="logged_at"
          type="datetime-local"
          required
          defaultValue={localDatetime}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {state?.errors?.logged_at && (
          <p className="mt-1 text-sm text-red-600">{state.errors.logged_at[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Any notes about this meal..."
        />
        {state?.errors?.description && (
          <p className="mt-1 text-sm text-red-600">{state.errors.description[0]}</p>
        )}
      </div>

      {state?.errors?._form && (
        <p className="text-sm text-red-600">{state.errors._form[0]}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Save Meal'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/meals')}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

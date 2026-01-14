'use client'

import { createMeal } from '@/app/dashboard/meals/actions'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ImageUpload from './ImageUpload'
import NutritionDisplay from './NutritionDisplay'
import type { NutritionResponse } from '@/lib/ai/types'

type MealFormProps = {
  action?: (prevState: any, formData: FormData) => Promise<any>
  initialData?: {
    title: string
    description: string
    meal_type: string
    logged_at: string
    photo_url: string
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
    ai_confidence?: number
  }
}

export default function MealForm({ action, initialData }: MealFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(action || createMeal, null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData?.photo_url || null)
  const [description, setDescription] = useState(initialData?.description || '')
  const [nutritionData, setNutritionData] = useState<NutritionResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)



  // State for datetime input to handle client-side timezone conversion correctly
  const [loggedAt, setLoggedAt] = useState('')

  useEffect(() => {
    // This runs only on client, ensuring correct browser timezone
    const getLocalDatetime = (isoString?: string) => {
      const d = isoString ? new Date(isoString) : new Date()
      // Subtract timezone offset to get local time in ISO format
      // getTimezoneOffset returns positive minutes for zones behind UTC (e.g. EST is 300)
      const offsetMs = d.getTimezoneOffset() * 60000
      return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16)
    }

    setLoggedAt(getLocalDatetime(initialData?.logged_at))
  }, [initialData?.logged_at])

  // Initialize nutrition data from initialData if in edit mode
  useEffect(() => {
    if (initialData?.calories !== undefined) {
      setNutritionData({
        items: [],
        nutrition: {
          calories: initialData.calories,
          protein_g: initialData.protein || 0,
          carbs_g: initialData.carbs || 0,
          fat_g: initialData.fat || 0,
          fiber_g: initialData.fiber || 0,
          sugar_g: initialData.sugar || 0,
          sodium_mg: initialData.sodium || 0,
        },
        confidence: initialData.ai_confidence
          ? initialData.ai_confidence >= 0.8
            ? 'high'
            : initialData.ai_confidence >= 0.6
              ? 'medium'
              : 'low'
          : 'medium',
        notes: '',
      })
    }
  }, [initialData])

  // Redirect on success
  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard/meals')
    }
  }, [state?.success, router])

  // AI analysis handler
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true)
    setAiError(null)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: description || undefined,
          imageUrl: photoUrl || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }

      const result: NutritionResponse = await response.json()
      setNutritionData(result)
    } catch (error) {
      console.error('AI analysis error:', error)
      setAiError(error instanceof Error ? error.message : 'Failed to analyze meal')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Update nutrition field handler
  const handleNutritionUpdate = (field: string, value: number) => {
    if (!nutritionData) return

    // Map field names to NutritionResponse keys
    const fieldMap: Record<string, string> = {
      calories: 'calories',
      protein: 'protein_g',
      carbs: 'carbs_g',
      fat: 'fat_g',
      fiber: 'fiber_g',
      sugar: 'sugar_g',
      sodium: 'sodium_mg',
    }

    const key = fieldMap[field]
    if (!key) return

    setNutritionData({
      ...nutritionData,
      nutrition: {
        ...nutritionData.nutrition,
        [key]: value,
      },
    })
  }

  // Convert confidence to numeric (0-1)
  const getConfidenceScore = (confidence: 'high' | 'medium' | 'low'): number => {
    const scores = { high: 0.9, medium: 0.7, low: 0.4 }
    return scores[confidence]
  }

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
          defaultValue={initialData?.title}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 bg-white"
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
          defaultValue={initialData?.meal_type}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 bg-white"
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
          value={loggedAt}
          onChange={(e) => setLoggedAt(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 bg-white"
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 bg-white"
          placeholder="Any notes about this meal..."
        />
        {state?.errors?.description && (
          <p className="mt-1 text-sm text-red-600">{state.errors.description[0]}</p>
        )}
      </div>

      <ImageUpload
        value={photoUrl}
        onChange={setPhotoUrl}
        disabled={isPending}
      />
      <input type="hidden" name="photo_url" value={photoUrl || ''} />
      {state?.errors?.photo_url && (
        <p className="text-sm text-red-600">{state.errors.photo_url[0]}</p>
      )}

      {/* AI Analysis Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Nutrition Information</h3>
          <button
            type="button"
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || (!description && !photoUrl) || isPending}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>

        {aiError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {aiError}
          </div>
        )}

        {nutritionData && (
          <NutritionDisplay
            nutrition={nutritionData}
            onUpdate={handleNutritionUpdate}
          />
        )}
      </div>

      {/* Hidden fields for nutrition data */}
      {nutritionData && (
        <>
          <input type="hidden" name="calories" value={nutritionData.nutrition.calories} />
          <input type="hidden" name="protein" value={nutritionData.nutrition.protein_g} />
          <input type="hidden" name="carbs" value={nutritionData.nutrition.carbs_g} />
          <input type="hidden" name="fat" value={nutritionData.nutrition.fat_g} />
          <input type="hidden" name="fiber" value={nutritionData.nutrition.fiber_g} />
          <input type="hidden" name="sugar" value={nutritionData.nutrition.sugar_g} />
          <input type="hidden" name="sodium" value={nutritionData.nutrition.sodium_mg} />
          <input type="hidden" name="ai_confidence" value={getConfidenceScore(nutritionData.confidence)} />
        </>
      )}

      {state?.errors?._form && (
        <p className="text-sm text-red-600">{state.errors._form[0]}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : initialData ? 'Update Meal' : 'Save Meal'}
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

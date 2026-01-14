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
    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Meal Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Meal Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Meal Name <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={initialData?.title}
                placeholder="e.g., Grilled Chicken Salad"
              />
              {state?.errors?.title && (
                <p className="mt-1 text-sm text-red-600">{state.errors.title[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="meal_type" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Meal Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="meal_type"
                  name="meal_type"
                  required
                  defaultValue={initialData?.meal_type}
                >
                  <option value="">Select type...</option>
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
                <label htmlFor="logged_at" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="logged_at"
                  name="logged_at"
                  type="datetime-local"
                  required
                  value={loggedAt}
                  onChange={(e) => setLoggedAt(e.target.value)}
                />
                {state?.errors?.logged_at && (
                  <p className="mt-1 text-sm text-red-600">{state.errors.logged_at[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Notes
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any details about ingredients or portion size..."
              />
              {state?.errors?.description && (
                <p className="mt-1 text-sm text-red-600">{state.errors.description[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Nutrition Manual Override Section (hidden unless expanded? or just show inputs) */}
        {/* We keep the hidden inputs for form submission */}
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
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{state.errors._form[0]}</p>
        )}

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary flex-1 py-2.5"
          >
            {isPending ? 'Saving...' : initialData ? 'Save Changes' : 'Log Meal'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/meals')}
            className="btn btn-secondary px-6"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Right Column: AI & Analysis */}
      <div className="space-y-6">
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Analysis</h3>

          <div className="space-y-4">
            <ImageUpload
              value={photoUrl}
              onChange={setPhotoUrl}
              disabled={isPending}
            />
            <input type="hidden" name="photo_url" value={photoUrl || ''} />
            {state?.errors?.photo_url && (
              <p className="text-sm text-red-600">{state.errors.photo_url[0]}</p>
            )}

            <button
              type="button"
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || (!description && !photoUrl) || isPending}
              className="w-full btn btn-secondary justify-center text-[var(--color-brand)] border-[var(--color-brand)]/20 hover:bg-[var(--color-brand)]/5"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-lg">✨</span> Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-lg">✨</span> Analyze with AI
                </span>
              )}
            </button>

            {aiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
                {aiError}
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Result Card */}
        {nutritionData && (
          <div className="card">
            <NutritionDisplay
              nutrition={nutritionData}
              onUpdate={handleNutritionUpdate}
            />
          </div>
        )}
      </div>
    </form>
  )
}

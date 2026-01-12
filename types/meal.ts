export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type Meal = {
  id: string
  user_id: string
  title: string
  description: string | null
  meal_type: MealType
  logged_at: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  sugar: number | null
  sodium: number | null
  photo_url: string | null
  source: 'manual' | 'telegram_text' | 'telegram_image' | 'web'
  ai_confidence: number | null
  created_at: string
  updated_at: string
}

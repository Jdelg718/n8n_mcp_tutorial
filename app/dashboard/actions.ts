'use server'

import { createClient } from '@/lib/supabase/server'

export type TodayTotals = {
  totalMeals: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

export async function getTodayTotals(): Promise<TodayTotals | { error: string }> {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get start of today and tomorrow in UTC
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

  // Fetch meals for today
  const { data: meals, error } = await supabase
    .from('meal_logs')
    .select('calories, protein, carbs, fat, fiber, sugar, sodium')
    .gte('logged_at', startOfToday.toISOString())
    .lt('logged_at', startOfTomorrow.toISOString())

  if (error) {
    return { error: error.message }
  }

  // Aggregate totals (handle null values)
  const totals: TodayTotals = {
    totalMeals: meals?.length || 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  }

  if (meals && meals.length > 0) {
    meals.forEach(meal => {
      totals.calories += meal.calories || 0
      totals.protein += meal.protein || 0
      totals.carbs += meal.carbs || 0
      totals.fat += meal.fat || 0
      totals.fiber += meal.fiber || 0
      totals.sugar += meal.sugar || 0
      totals.sodium += meal.sodium || 0
    })

    // Round to 1 decimal place
    totals.calories = Math.round(totals.calories)
    totals.protein = Math.round(totals.protein * 10) / 10
    totals.carbs = Math.round(totals.carbs * 10) / 10
    totals.fat = Math.round(totals.fat * 10) / 10
    totals.fiber = Math.round(totals.fiber * 10) / 10
    totals.sugar = Math.round(totals.sugar * 10) / 10
    totals.sodium = Math.round(totals.sodium * 10) / 10
  }

  return totals
}

export type RecentMeal = {
  id: string
  title: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  logged_at: string
  calories: number | null
  photo_url: string | null
}

export async function getRecentMeals(limit: number = 5): Promise<RecentMeal[] | { error: string }> {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch recent meals
  const { data: meals, error } = await supabase
    .from('meal_logs')
    .select('id, title, meal_type, logged_at, calories, photo_url')
    .order('logged_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  return (meals || []) as RecentMeal[]
}

export type UserGoals = {
  calories: number
  protein: number
  carbs: number
  fat: number
  profileCompleted: boolean
}

/**
 * Fetches user's personalized nutrition goals from their profile.
 * Falls back to hardcoded defaults if profile is incomplete.
 */
export async function getUserGoals(): Promise<UserGoals | { error: string }> {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch profile with nutrition goals
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal, profile_completed')
    .eq('id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Default hardcoded goals (v1 fallback)
  const defaultGoals: UserGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
    profileCompleted: false,
  }

  // If profile not completed or goals not set, return defaults
  if (!profile || !profile.profile_completed || !profile.daily_calorie_goal) {
    return defaultGoals
  }

  // Return calculated goals from database
  return {
    calories: Math.round(profile.daily_calorie_goal),
    protein: Math.round(profile.daily_protein_goal),
    carbs: Math.round(profile.daily_carbs_goal),
    fat: Math.round(profile.daily_fat_goal),
    profileCompleted: profile.profile_completed,
  }
}

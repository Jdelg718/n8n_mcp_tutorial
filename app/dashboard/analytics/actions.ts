'use server'

import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'

export type AnalyticsSummary = {
  totalMeals: number
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
  dateRange: string
}

export async function getAnalyticsSummary(
  startDate: string,
  endDate: string
): Promise<AnalyticsSummary | { error: string }> {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch meals for date range
  const { data: meals, error } = await supabase
    .from('meal_logs')
    .select('calories, protein, carbs, fat, logged_at')
    .gte('logged_at', startDate)
    .lte('logged_at', endDate)

  if (error) {
    return { error: error.message }
  }

  // Calculate totals
  const totalMeals = meals?.length || 0

  if (totalMeals === 0) {
    return {
      totalMeals: 0,
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      dateRange: `${format(parseISO(startDate), 'MMM d')} - ${format(parseISO(endDate), 'MMM d, yyyy')}`,
    }
  }

  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  meals.forEach(meal => {
    totals.calories += meal.calories || 0
    totals.protein += meal.protein || 0
    totals.carbs += meal.carbs || 0
    totals.fat += meal.fat || 0
  })

  // Calculate number of days in range
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return {
    totalMeals,
    avgCalories: Math.round(totals.calories / days),
    avgProtein: Math.round((totals.protein / days) * 10) / 10,
    avgCarbs: Math.round((totals.carbs / days) * 10) / 10,
    avgFat: Math.round((totals.fat / days) * 10) / 10,
    dateRange: `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`,
  }
}

export type DailyNutrition = {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export async function getDailyNutrition(
  startDate: string,
  endDate: string
): Promise<DailyNutrition[] | { error: string }> {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch meals for date range
  const { data: meals, error } = await supabase
    .from('meal_logs')
    .select('calories, protein, carbs, fat, logged_at')
    .gte('logged_at', startDate)
    .lte('logged_at', endDate)
    .order('logged_at', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  // Group by date
  const dailyMap = new Map<string, DailyNutrition>()

  meals?.forEach(meal => {
    const date = format(parseISO(meal.logged_at), 'yyyy-MM-dd')

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      })
    }

    const daily = dailyMap.get(date)!
    daily.calories += meal.calories || 0
    daily.protein += meal.protein || 0
    daily.carbs += meal.carbs || 0
    daily.fat += meal.fat || 0
  })

  // Convert to array and round values
  const result = Array.from(dailyMap.values()).map(daily => ({
    date: daily.date,
    calories: Math.round(daily.calories),
    protein: Math.round(daily.protein * 10) / 10,
    carbs: Math.round(daily.carbs * 10) / 10,
    fat: Math.round(daily.fat * 10) / 10,
  }))

  return result
}

export type MacroDistribution = {
  protein: number
  carbs: number
  fat: number
}

export async function getMacroDistribution(
  startDate: string,
  endDate: string
): Promise<MacroDistribution | { error: string }> {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch meals for date range
  const { data: meals, error } = await supabase
    .from('meal_logs')
    .select('protein, carbs, fat')
    .gte('logged_at', startDate)
    .lte('logged_at', endDate)

  if (error) {
    return { error: error.message }
  }

  // Calculate totals
  const totals = {
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  meals?.forEach(meal => {
    totals.protein += meal.protein || 0
    totals.carbs += meal.carbs || 0
    totals.fat += meal.fat || 0
  })

  return {
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  }
}

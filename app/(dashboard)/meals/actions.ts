'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MealFormSchema } from '@/lib/zod/schemas'

type State = {
  errors?: {
    title?: string[]
    meal_type?: string[]
    logged_at?: string[]
    description?: string[]
    photo_url?: string[]
    calories?: string[]
    protein?: string[]
    carbs?: string[]
    fat?: string[]
    fiber?: string[]
    sugar?: string[]
    sodium?: string[]
    ai_confidence?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createMeal(
  prevState: State | null,
  formData: FormData
): Promise<State> {
  // Get logged_at and convert datetime-local format to ISO datetime
  const loggedAtInput = formData.get('logged_at') as string
  const loggedAtISO = loggedAtInput ? new Date(loggedAtInput).toISOString() : ''

  // Get photo_url and handle empty string
  const photoUrlInput = formData.get('photo_url') as string
  const photoUrl = photoUrlInput && photoUrlInput.trim() !== '' ? photoUrlInput : null

  // Get nutrition data (convert strings to numbers, handle empty/null)
  const parseNumber = (value: string | null): number | undefined => {
    if (!value || value.trim() === '') return undefined
    const num = Number(value)
    return isNaN(num) ? undefined : num
  }

  const nutritionData = {
    calories: parseNumber(formData.get('calories') as string),
    protein: parseNumber(formData.get('protein') as string),
    carbs: parseNumber(formData.get('carbs') as string),
    fat: parseNumber(formData.get('fat') as string),
    fiber: parseNumber(formData.get('fiber') as string),
    sugar: parseNumber(formData.get('sugar') as string),
    sodium: parseNumber(formData.get('sodium') as string),
    ai_confidence: parseNumber(formData.get('ai_confidence') as string),
  }

  // Validate with Zod
  const validated = MealFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    meal_type: formData.get('meal_type'),
    logged_at: loggedAtISO,
    photo_url: photoUrl,
    ...nutritionData,
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    }
  }

  // Check auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { errors: { _form: ['Not authenticated'] } }
  }

  // Insert meal with nutrition data
  const { error } = await supabase.from('meal_logs').insert({
    user_id: user.id,
    title: validated.data.title,
    description: validated.data.description || null,
    meal_type: validated.data.meal_type,
    logged_at: new Date(validated.data.logged_at),
    photo_url: validated.data.photo_url || null,
    source: 'manual',
    // Nutrition fields (null if not provided)
    calories: validated.data.calories ?? null,
    protein: validated.data.protein ?? null,
    carbs: validated.data.carbs ?? null,
    fat: validated.data.fat ?? null,
    fiber: validated.data.fiber ?? null,
    sugar: validated.data.sugar ?? null,
    sodium: validated.data.sodium ?? null,
    ai_confidence: validated.data.ai_confidence ?? null,
  })

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  revalidatePath('/dashboard/meals')
  return { success: true }
}

export async function getUploadUrl(fileName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // User-scoped path: {user_id}/{timestamp}-{filename}
  const filePath = `${user.id}/${Date.now()}-${fileName}`;

  // Create signed URL (expires in 2 hours)
  const { data, error } = await supabase.storage
    .from('meal-images')
    .createSignedUploadUrl(filePath);

  if (error) throw error;

  return {
    signedUrl: data.signedUrl,
    path: filePath,
    token: data.token,
  };
}

type UpdateMealState = {
  errors?: {
    title?: string[]
    meal_type?: string[]
    logged_at?: string[]
    description?: string[]
    photo_url?: string[]
    calories?: string[]
    protein?: string[]
    carbs?: string[]
    fat?: string[]
    fiber?: string[]
    sugar?: string[]
    sodium?: string[]
    ai_confidence?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function updateMeal(
  mealId: string,
  prevState: UpdateMealState,
  formData: FormData
): Promise<UpdateMealState> {
  // Get logged_at and convert datetime-local format to ISO datetime
  const loggedAtInput = formData.get('logged_at') as string
  const loggedAtISO = loggedAtInput ? new Date(loggedAtInput).toISOString() : ''

  // Get photo_url and handle empty string
  const photoUrlInput = formData.get('photo_url') as string
  const photoUrl = photoUrlInput && photoUrlInput.trim() !== '' ? photoUrlInput : null

  // Get nutrition data (convert strings to numbers, handle empty/null)
  const parseNumber = (value: string | null): number | undefined => {
    if (!value || value.trim() === '') return undefined
    const num = Number(value)
    return isNaN(num) ? undefined : num
  }

  const nutritionData = {
    calories: parseNumber(formData.get('calories') as string),
    protein: parseNumber(formData.get('protein') as string),
    carbs: parseNumber(formData.get('carbs') as string),
    fat: parseNumber(formData.get('fat') as string),
    fiber: parseNumber(formData.get('fiber') as string),
    sugar: parseNumber(formData.get('sugar') as string),
    sodium: parseNumber(formData.get('sodium') as string),
    ai_confidence: parseNumber(formData.get('ai_confidence') as string),
  }

  // Validate with Zod
  const validated = MealFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    meal_type: formData.get('meal_type'),
    logged_at: loggedAtISO,
    photo_url: photoUrl,
    ...nutritionData,
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    }
  }

  // Check auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { errors: { _form: ['Not authenticated'] } }
  }

  // Update - RLS ensures user can only update their own meals
  const { error } = await supabase
    .from('meal_logs')
    .update({
      title: validated.data.title,
      description: validated.data.description || null,
      meal_type: validated.data.meal_type,
      logged_at: new Date(validated.data.logged_at),
      photo_url: validated.data.photo_url || null,
      // Nutrition fields (null if not provided)
      calories: validated.data.calories ?? null,
      protein: validated.data.protein ?? null,
      carbs: validated.data.carbs ?? null,
      fat: validated.data.fat ?? null,
      fiber: validated.data.fiber ?? null,
      sugar: validated.data.sugar ?? null,
      sodium: validated.data.sodium ?? null,
      ai_confidence: validated.data.ai_confidence ?? null,
      updated_at: new Date(),
    })
    .eq('id', mealId)

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  revalidatePath('/dashboard/meals')
  return { success: true }
}

export async function deleteMeal(
  mealId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Delete meal image from storage if exists
  const { data: meal } = await supabase
    .from('meal_logs')
    .select('photo_url')
    .eq('id', mealId)
    .single()

  if (meal?.photo_url) {
    try {
      // Extract path from URL and delete from storage
      const urlPath = new URL(meal.photo_url).pathname
      const storagePath = urlPath.split('/meal-images/')[1]
      if (storagePath) {
        await supabase.storage.from('meal-images').remove([storagePath])
      }
    } catch (err) {
      // Continue with deletion even if image cleanup fails
      console.error('Failed to delete image:', err)
    }
  }

  // Delete meal - RLS ensures user can only delete their own meals
  const { error } = await supabase.from('meal_logs').delete().eq('id', mealId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/meals')
  return { success: true }
}

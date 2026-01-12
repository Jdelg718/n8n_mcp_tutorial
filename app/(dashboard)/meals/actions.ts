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
    _form?: string[]
  }
  success?: boolean
}

export async function createMeal(
  prevState: State | null,
  formData: FormData
): Promise<State> {
  // Validate with Zod
  const validated = MealFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    meal_type: formData.get('meal_type'),
    logged_at: formData.get('logged_at'),
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

  // Insert meal
  const { error } = await supabase.from('meal_logs').insert({
    user_id: user.id,
    title: validated.data.title,
    description: validated.data.description || null,
    meal_type: validated.data.meal_type,
    logged_at: new Date(validated.data.logged_at),
    source: 'manual',
  })

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  revalidatePath('/dashboard/meals')
  return { success: true }
}

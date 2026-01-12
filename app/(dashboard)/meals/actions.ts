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

  // Validate with Zod
  const validated = MealFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    meal_type: formData.get('meal_type'),
    logged_at: loggedAtISO,
    photo_url: photoUrl,
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
    photo_url: validated.data.photo_url || null,
    source: 'manual',
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

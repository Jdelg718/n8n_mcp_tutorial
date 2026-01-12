import { z } from 'zod'

export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required'),
})

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const MealFormSchema = z.object({
  title: z.string().min(1, 'Meal name required').max(100, 'Name too long'),
  description: z.string().optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    message: 'Meal type required'
  }),
  logged_at: z.string().datetime(), // ISO string from client
  photo_url: z.string().url().nullable().optional(),
  // Nutrition fields (all optional - manual entry without AI is valid)
  calories: z.number().int().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  ai_confidence: z.number().min(0).max(1).optional(), // 0.0 to 1.0
})

export type MealFormData = z.infer<typeof MealFormSchema>

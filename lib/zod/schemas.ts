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
  // Image fields added in Plan 3
})

export type MealFormData = z.infer<typeof MealFormSchema>

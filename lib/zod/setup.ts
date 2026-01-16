import { z } from 'zod'
import { METRIC_LIMITS, AGE_LIMITS } from '@/lib/nutrition/constants'

/**
 * Physical Metrics Form Schema
 * Validates user's physical data for nutrition calculations
 */
export const PhysicalMetricsSchema = z.object({
    weight_kg: z
        .number({
            message: 'Weight must be a number',
        })
        .min(METRIC_LIMITS.weight.min, `Weight must be at least ${METRIC_LIMITS.weight.min}kg`)
        .max(METRIC_LIMITS.weight.max, `Weight must be less than ${METRIC_LIMITS.weight.max}kg`),
    // Removed decimal restriction to support imperial conversion (lbs to kg)

    height_cm: z
        .number({
            message: 'Height must be a number',
        })
        .min(METRIC_LIMITS.height.min, `Height must be at least ${METRIC_LIMITS.height.min}cm`)
        .max(METRIC_LIMITS.height.max, `Height must be less than ${METRIC_LIMITS.height.max}cm`),
    // Removed integer restriction to support imperial conversion (ft/in to cm)

    birth_date: z
        .string({
            message: 'Date of birth is required',
        })
        .date('Invalid date format')
        .refine(
            (date) => {
                const age = new Date().getFullYear() - new Date(date).getFullYear()
                return age >= AGE_LIMITS.min && age <= AGE_LIMITS.max
            },
            {
                message: `You must be between ${AGE_LIMITS.min} and ${AGE_LIMITS.max} years old`,
            }
        ),

    gender: z.enum(['male', 'female', 'other'], {
        message: 'Gender is required for nutrition calculations',
    }),
})

/**
 * Activity Level Form Schema
 */
export const ActivityLevelSchema = z.object({
    activity_level: z.enum(
        ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
        {
            message: 'Activity level is required',
        }
    ),
})

/**
 * Goals Form Schema
 */
export const GoalsSchema = z.object({
    goal_type: z.enum(['weight_loss', 'maintenance', 'muscle_gain'], {
        message: 'Goal type is required',
    }),

    target_weight_kg: z
        .number({
            message: 'Target weight must be a number',
        })
        .min(METRIC_LIMITS.weight.min, `Target weight must be at least ${METRIC_LIMITS.weight.min}kg`)
        .max(METRIC_LIMITS.weight.max, `Target weight must be less than ${METRIC_LIMITS.weight.max}kg`)
        .optional()
        .nullable(),
}).refine(
    (data) => {
        // If goal_type is not maintenance, target_weight is required
        if (data.goal_type !== 'maintenance' && !data.target_weight_kg) {
            return false
        }
        return true
    },
    {
        message: 'Target weight is required for weight loss or muscle gain goals',
        path: ['target_weight_kg'],
    }
)

/**
 * Complete Onboarding Schema
 * Combines all steps for validation
 */
export const CompleteOnboardingSchema = PhysicalMetricsSchema
    .merge(ActivityLevelSchema)
    .merge(GoalsSchema)

/**
 * Weight Entry Schema
 * For logging weight in health_data table
 */
export const WeightEntrySchema = z.object({
    weight: z
        .number({
            message: 'Weight must be a number',
        })
        .min(METRIC_LIMITS.weight.min, `Weight must be at least ${METRIC_LIMITS.weight.min}kg`)
        .max(METRIC_LIMITS.weight.max, `Weight must be less than ${METRIC_LIMITS.weight.max}kg`),

    recorded_at: z.string().datetime().optional(),

    data_source: z.enum(['manual', 'apple_health', 'google_fit']).default('manual'),
})

/**
 * Profile Update Schema
 * For updating existing profile metrics
 */
export const ProfileUpdateSchema = z.object({
    weight_kg: z.number().min(METRIC_LIMITS.weight.min).max(METRIC_LIMITS.weight.max).optional(),
    height_cm: z.number().min(METRIC_LIMITS.height.min).max(METRIC_LIMITS.height.max).optional(),
    birth_date: z.string().date().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).optional(),
    goal_type: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
    target_weight_kg: z.number().min(METRIC_LIMITS.weight.min).max(METRIC_LIMITS.weight.max).optional().nullable(),
})

// Type exports
export type PhysicalMetricsData = z.infer<typeof PhysicalMetricsSchema>
export type ActivityLevelData = z.infer<typeof ActivityLevelSchema>
export type GoalsData = z.infer<typeof GoalsSchema>
export type CompleteOnboardingData = z.infer<typeof CompleteOnboardingSchema>
export type WeightEntryData = z.infer<typeof WeightEntrySchema>
export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>

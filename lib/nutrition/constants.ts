/**
 * Nutrition Calculation Constants
 * 
 * Evidence-based values for nutrition calculations including:
 * - Activity level multipliers for TDEE
 * - Macro ratios by goal type
 * - Calorie adjustment percentages
 */

import type { ActivityLevel, GoalType } from '@/types/profile'

/**
 * Activity Level Multipliers for TDEE Calculation
 * Source: Mifflin-St Jeor equation adaptations
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,            // Little to no exercise (desk job, minimal activity)
    lightly_active: 1.375,     // Exercise 1-3 days/week (light gym, walking)
    moderately_active: 1.55,   // Exercise 3-5 days/week (regular workouts)
    very_active: 1.725,        // Exercise 6-7 days/week (intense daily training)
    extra_active: 1.9,         // Very intense exercise + physical job or 2x/day training
}

/**
 * Calorie Adjustment by Goal Type
 * Percentage modifier applied to TDEE
 */
export const CALORIE_ADJUSTMENTS: Record<GoalType, number> = {
    weight_loss: -0.20,        // 20% deficit (safe, sustainable weight loss)
    maintenance: 0,            // TDEE exactly
    muscle_gain: 0.10,         // 10% surplus (lean muscle gain, minimal fat)
}

/**
 * Macro Distribution by Goal Type
 * Percentages of total calories from each macronutrient
 * 
 * Reference values:
 * - Protein: 4 kcal/g
 * - Carbs: 4 kcal/g  
 * - Fat: 9 kcal/g
 */
export const MACRO_RATIOS: Record<GoalType, { protein: number; carbs: number; fat: number }> = {
    weight_loss: {
        protein: 0.35,           // 35% - High protein preserves muscle during deficit
        carbs: 0.30,             // 30% - Lower carbs for fat loss
        fat: 0.35,               // 35% - Adequate fat for hormones
    },
    maintenance: {
        protein: 0.30,           // 30% - Moderate protein
        carbs: 0.40,             // 40% - Balanced carbs for energy
        fat: 0.30,               // 30% - Healthy fat intake
    },
    muscle_gain: {
        protein: 0.30,           // 30% - High protein for muscle building
        carbs: 0.45,             // 45% - Higher carbs for training fuel
        fat: 0.25,               // 25% - Lower fat to maximize carbs
    },
}

/**
 * Minimum Protein by Goal Type (g/kg of body weight)
 * Ensures adequate protein even with calculated percentages
 */
export const MINIMUM_PROTEIN_PER_KG: Record<GoalType, number> = {
    weight_loss: 2.0,          // 2.0g/kg - Preserve muscle during deficit
    maintenance: 1.6,          // 1.6g/kg - Maintain muscle mass
    muscle_gain: 2.2,          // 2.2g/kg - Build new muscle tissue
}

/**
 * Calorie to Gram Conversion Factors
 */
export const CALORIES_PER_GRAM = {
    protein: 4,
    carbs: 4,
    fat: 9,
} as const

/**
 * Healthy BMI Ranges
 */
export const BMI_RANGES = {
    underweight: { min: 0, max: 18.5 },
    normal: { min: 18.5, max: 25 },
    overweight: { min: 25, max: 30 },
    obese: { min: 30, max: 100 },
} as const

/**
 * Recommended Weekly Weight Change (kg)
 * Safe, sustainable rates
 */
export const WEEKLY_WEIGHT_CHANGE: Record<GoalType, number> = {
    weight_loss: -0.5,         // -0.5kg/week (approximately 1 lb)
    maintenance: 0,            // No change
    muscle_gain: 0.25,         // +0.25kg/week (lean gains)
}

/**
 * Minimum and Maximum Daily Calorie Limits
 * Safety bounds to prevent unhealthy calculations
 */
export const CALORIE_LIMITS = {
    min: 1200,                 // Minimum safe daily intake
    max: 5000,                 // Maximum reasonable intake
} as const

/**
 * Age Ranges for Validation
 */
export const AGE_LIMITS = {
    min: 13,                   // COPPA compliance
    max: 120,                  // Reasonable maximum
} as const

/**
 * Weight and Height Ranges for Validation (metric)
 */
export const METRIC_LIMITS = {
    weight: { min: 30, max: 300 },      // kg
    height: { min: 100, max: 250 },     // cm
} as const

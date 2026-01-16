/**
 * Nutrition Calculation Functions
 * 
 * Science-based formulas for calculating personalized nutrition targets:
 * - BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
 * - TDEE (Total Daily Energy Expenditure)
 * - Macro distribution (protein, carbs, fat)
 * - BMI and ideal weight ranges
 */

import type { Gender, ActivityLevel, GoalType } from '@/types/profile'
import {
    ACTIVITY_MULTIPLIERS,
    CALORIE_ADJUSTMENTS,
    MACRO_RATIOS,
    MINIMUM_PROTEIN_PER_KG,
    CALORIES_PER_GRAM,
    BMI_RANGES,
    WEEKLY_WEIGHT_CHANGE,
    CALORIE_LIMITS,
} from './constants'

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }

    return age
}

/**
 * Calculate Basal Metabolic Rate (BMR)
 * Uses Mifflin-St Jeor Equation (most accurate for modern populations)
 * 
 * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
 * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
 * 
 * @param weight_kg - Weight in kilograms
 * @param height_cm - Height in centimeters
 * @param age - Age in years
 * @param gender - Biological gender
 * @returns BMR in calories per day
 */
export function calculateBMR(
    weight_kg: number,
    height_cm: number,
    age: number,
    gender: Gender
): number {
    const baseBMR = 10 * weight_kg + 6.25 * height_cm - 5 * age

    if (gender === 'male') {
        return Math.round(baseBMR + 5)
    } else if (gender === 'female') {
        return Math.round(baseBMR - 161)
    } else {
        // For 'other', use average of male and female
        return Math.round(baseBMR - 78)
    }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * BMR multiplied by activity level factor
 * 
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level category
 * @returns TDEE in calories per day
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]
    return Math.round(bmr * multiplier)
}

/**
 * Calculate daily calorie goal based on TDEE and goal type
 * 
 * @param tdee - Total Daily Energy Expenditure
 * @param goalType - Weight goal type
 * @returns Adjusted daily calorie target
 */
export function calculateCalorieGoal(tdee: number, goalType: GoalType): number {
    const adjustment = CALORIE_ADJUSTMENTS[goalType]
    const calories = Math.round(tdee * (1 + adjustment))

    // Apply safety limits
    return Math.max(CALORIE_LIMITS.min, Math.min(CALORIE_LIMITS.max, calories))
}

/**
 * Calculate macro distribution (protein, carbs, fat) in grams
 * 
 * @param calories - Daily calorie target
 * @param goalType - Weight goal type
 * @param weight_kg - User's weight (for minimum protein calculation)
 * @returns Object with protein, carbs, and fat in grams
 */
export function calculateMacros(
    calories: number,
    goalType: GoalType,
    weight_kg: number
): { protein: number; carbs: number; fat: number } {
    const ratios = MACRO_RATIOS[goalType]

    // Calculate protein from percentage
    let proteinGrams = Math.round((calories * ratios.protein) / CALORIES_PER_GRAM.protein)

    // Ensure minimum protein based on body weight
    const minimumProtein = Math.round(weight_kg * MINIMUM_PROTEIN_PER_KG[goalType])
    proteinGrams = Math.max(proteinGrams, minimumProtein)

    // Recalculate remaining calories after protein requirement
    const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein
    const remainingCalories = calories - proteinCalories

    // Distribute remaining calories between carbs and fat
    const carbRatio = ratios.carbs / (ratios.carbs + ratios.fat)
    const carbsGrams = Math.round((remainingCalories * carbRatio) / CALORIES_PER_GRAM.carbs)
    const fatGrams = Math.round((remainingCalories * (1 - carbRatio)) / CALORIES_PER_GRAM.fat)

    return {
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams,
    }
}

/**
 * Calculate Body Mass Index (BMI)
 * 
 * @param weight_kg - Weight in kilograms
 * @param height_cm - Height in centimeters
 * @returns BMI value
 */
export function calculateBMI(weight_kg: number, height_cm: number): number {
    const heightM = height_cm / 100
    return parseFloat((weight_kg / (heightM * heightM)).toFixed(2))
}

/**
 * Get BMI category
 * 
 * @param bmi - BMI value
 * @returns BMI category string
 */
export function getBMICategory(bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' {
    if (bmi < BMI_RANGES.normal.min) return 'underweight'
    if (bmi < BMI_RANGES.overweight.min) return 'normal'
    if (bmi < BMI_RANGES.obese.min) return 'overweight'
    return 'obese'
}

/**
 * Calculate ideal weight range for height (using BMI 18.5-25)
 * 
 * @param height_cm - Height in centimeters
 * @returns Object with min and max ideal weight in kg
 */
export function calculateIdealWeightRange(height_cm: number): { min: number; max: number } {
    const heightM = height_cm / 100
    const heightSquared = heightM * heightM

    return {
        min: parseFloat((BMI_RANGES.normal.min * heightSquared).toFixed(1)),
        max: parseFloat((BMI_RANGES.normal.max * heightSquared).toFixed(1)),
    }
}

/**
 * Calculate projected date to reach weight goal
 * Based on safe weekly weight change rates
 * 
 * @param currentWeight - Current weight in kg
 * @param targetWeight - Target weight in kg
 * @param goalType - Weight goal type
 * @returns ISO date string or null if target already reached
 */
export function calculateGoalDate(
    currentWeight: number,
    targetWeight: number,
    goalType: GoalType
): string | null {
    const weightDifference = targetWeight - currentWeight
    const weeklyChange = WEEKLY_WEIGHT_CHANGE[goalType]

    if (weeklyChange === 0 || Math.abs(weightDifference) < 0.1) {
        return null // Already at goal or maintenance mode
    }

    // Check if goal type matches direction
    if ((goalType === 'weight_loss' && weightDifference > 0) ||
        (goalType === 'muscle_gain' && weightDifference < 0)) {
        return null // Goal type doesn't match target direction
    }

    const weeksToGoal = Math.abs(weightDifference / weeklyChange)
    const daysToGoal = Math.ceil(weeksToGoal * 7)

    const goalDate = new Date()
    goalDate.setDate(goalDate.getDate() + daysToGoal)

    return goalDate.toISOString().split('T')[0] // Return YYYY-MM-DD
}

/**
 * Calculate net calories (intake - activity)
 * 
 * @param caloriesConsumed - Calories eaten
 * @param caloriesBurned - Active calories burned from exercise
 * @returns Net calorie balance
 */
export function calculateNetCalories(
    caloriesConsumed: number,
    caloriesBurned: number
): number {
    return caloriesConsumed - caloriesBurned
}

/**
 * Calculate all nutrition goals for a user profile
 * Convenience function that runs all calculations
 * 
 * @param profile - User profile data
 * @returns Complete nutrition goals
 */
export function calculateNutritionGoals(profile: {
    weight_kg: number
    height_cm: number
    birth_date: string
    gender: Gender
    activity_level: ActivityLevel
    goal_type: GoalType
}) {
    const age = calculateAge(profile.birth_date)
    const bmr = calculateBMR(profile.weight_kg, profile.height_cm, age, profile.gender)
    const tdee = calculateTDEE(bmr, profile.activity_level)
    const dailyCalories = calculateCalorieGoal(tdee, profile.goal_type)
    const macros = calculateMacros(dailyCalories, profile.goal_type, profile.weight_kg)
    const bmi = calculateBMI(profile.weight_kg, profile.height_cm)
    const bmiCategory = getBMICategory(bmi)
    const idealWeightRange = calculateIdealWeightRange(profile.height_cm)

    return {
        age,
        bmr,
        tdee,
        daily_calorie_goal: dailyCalories,
        daily_protein_goal: macros.protein,
        daily_carbs_goal: macros.carbs,
        daily_fat_goal: macros.fat,
        current_bmi: bmi,
        bmi_category: bmiCategory,
        ideal_weight_range: idealWeightRange,
    }
}

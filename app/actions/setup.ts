'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateNutritionGoals } from '@/lib/nutrition/calculations'
import type { CompleteOnboardingData } from '@/lib/zod/setup'
import { CompleteOnboardingSchema } from '@/lib/zod/setup'

/**
 * Complete user onboarding with physical metrics and goals
 * Calculates nutrition targets and saves to profile
 */
export async function completeOnboarding(data: CompleteOnboardingData) {
    const supabase = await createClient()

    // Get authenticated user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Validate input
    const validation = CompleteOnboardingSchema.safeParse(data)
    if (!validation.success) {
        return {
            success: false,
            error: 'Invalid data',
            details: validation.error.flatten().fieldErrors,
        }
    }

    const validData = validation.data

    try {
        // Calculate nutrition goals
        const nutritionGoals = calculateNutritionGoals({
            weight_kg: validData.weight_kg,
            height_cm: validData.height_cm,
            birth_date: validData.birth_date,
            gender: validData.gender,
            activity_level: validData.activity_level,
            goal_type: validData.goal_type,
        })

        // Update profile with all data
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                weight_kg: validData.weight_kg,
                height_cm: validData.height_cm,
                birth_date: validData.birth_date,
                gender: validData.gender,
                activity_level: validData.activity_level,
                goal_type: validData.goal_type,
                target_weight_kg: validData.target_weight_kg,
                daily_calorie_goal: nutritionGoals.daily_calorie_goal,
                daily_protein_goal: nutritionGoals.daily_protein_goal,
                daily_carbs_goal: nutritionGoals.daily_carbs_goal,
                daily_fat_goal: nutritionGoals.daily_fat_goal,
                profile_completed: true,
                onboarding_completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Profile update error:', updateError)
            return { success: false, error: 'Failed to save profile data' }
        }

        // Insert initial weight entry into health_data
        const { error: weightError } = await supabase.from('health_data').insert({
            user_id: user.id,
            weight: validData.weight_kg,
            height: validData.height_cm,
            bmi: nutritionGoals.current_bmi,
            data_source: 'manual',
            recorded_at: new Date().toISOString(),
        })

        if (weightError) {
            console.error('Weight entry error:', weightError)
            // Non-critical error, continue
        }

        revalidatePath('/dashboard')
        return {
            success: true,
            data: {
                ...nutritionGoals,
                profile_completed: true,
            },
        }
    } catch (error) {
        console.error('Onboarding error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

/**
 * Update existing profile with new metrics
 * Recalculates nutrition goals if physical data changes
 */
export async function updateProfile(
    updates: Partial<CompleteOnboardingData>
) {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        // Get current profile data
        const { data: currentProfile, error: fetchError } = await supabase
            .from('profiles')
            .select(
                'weight_kg, height_cm, birth_date, gender, activity_level, goal_type'
            )
            .eq('id', user.id)
            .single()

        if (fetchError || !currentProfile) {
            return { success: false, error: 'Profile not found' }
        }

        // Merge updates with current data
        const mergedData = {
            ...currentProfile,
            ...updates,
        }

        // Recalculate nutrition goals if any physical metric changed
        const needsRecalculation =
            updates.weight_kg !== undefined ||
            updates.height_cm !== undefined ||
            updates.birth_date !== undefined ||
            updates.gender !== undefined ||
            updates.activity_level !== undefined ||
            updates.goal_type !== undefined

        let updateData: Record<string, any> = {
            ...updates,
            updated_at: new Date().toISOString(),
        }

        if (needsRecalculation && mergedData.profile_completed) {
            const nutritionGoals = calculateNutritionGoals(mergedData as any)
            updateData = {
                ...updateData,
                daily_calorie_goal: nutritionGoals.daily_calorie_goal,
                daily_protein_goal: nutritionGoals.daily_protein_goal,
                daily_carbs_goal: nutritionGoals.daily_carbs_goal,
                daily_fat_goal: nutritionGoals.daily_fat_goal,
            }
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)

        if (updateError) {
            console.error('Profile update error:', updateError)
            return { success: false, error: 'Failed to update profile' }
        }

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/profile')
        return { success: true }
    } catch (error) {
        console.error('Profile update error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

/**
 * Check if user needs to complete onboarding
 * Returns profile completion status and redirect path if needed
 */
export async function checkOnboardingStatus() {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { authenticated: false, needsOnboarding: false }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed')
        .eq('id', user.id)
        .single()

    return {
        authenticated: true,
        needsOnboarding: !profile?.profile_completed,
        redirectTo: !profile?.profile_completed ? '/setup' : null,
    }
}

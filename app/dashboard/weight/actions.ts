'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type WeightEntry = {
    id: string
    weight: number
    bmi: number | null
    recorded_at: string
    data_source: string
}

export type WeightStats = {
    current: number | null
    target: number | null
    starting: number | null
    totalChange: number
    progressPercentage: number
    remaining: number
    goalType: string | null
}

/**
 * Log a new weight entry
 */
export async function logWeight(data: { weight: number; date?: string }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        // Get user's height for BMI calculation
        const { data: profile } = await supabase
            .from('profiles')
            .select('height_cm')
            .eq('id', user.id)
            .single()

        const bmi = profile?.height_cm
            ? Number((data.weight / Math.pow(profile.height_cm / 100, 2)).toFixed(2))
            : null

        // Insert weight entry
        const { error: insertError } = await supabase.from('health_data').insert({
            user_id: user.id,
            weight: data.weight,
            height: profile?.height_cm || null,
            bmi,
            data_source: 'manual',
            recorded_at: data.date || new Date().toISOString(),
        })

        if (insertError) {
            console.error('Weight insert error:', insertError)
            return { success: false, error: 'Failed to log weight' }
        }

        revalidatePath('/dashboard/weight')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Log weight error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

/**
 * Get weight history
 */
export async function getWeightHistory(limit: number = 50): Promise<WeightEntry[]> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('health_data')
        .select('id, weight, bmi, recorded_at, data_source')
        .eq('user_id', user.id)
        .not('weight', 'is', null)
        .order('recorded_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Get weight history error:', error)
        return []
    }

    return (data || []) as WeightEntry[]
}

/**
 * Delete a weight entry
 */
export async function deleteWeightEntry(id: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('health_data')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Delete weight error:', error)
        return { success: false, error: 'Failed to delete weight entry' }
    }

    revalidatePath('/dashboard/weight')
    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Get weight statistics
 */
export async function getWeightStats(): Promise<WeightStats> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return {
            current: null,
            target: null,
            starting: null,
            totalChange: 0,
            progressPercentage: 0,
            remaining: 0,
            goalType: null,
        }
    }

    // Get profile with target weight and goal type
    const { data: profile } = await supabase
        .from('profiles')
        .select('weight_kg, target_weight_kg, goal_type')
        .eq('id', user.id)
        .single()

    // Get first weight entry (starting weight)
    const { data: firstEntry } = await supabase
        .from('health_data')
        .select('weight')
        .eq('user_id', user.id)
        .not('weight', 'is', null)
        .order('recorded_at', { ascending: true })
        .limit(1)
        .single()

    const current = profile?.weight_kg || null
    const target = profile?.target_weight_kg || null
    const starting = firstEntry?.weight || current
    const goalType = profile?.goal_type || null

    let totalChange = 0
    let progressPercentage = 0
    let remaining = 0

    if (current && starting) {
        totalChange = current - starting

        if (target && starting !== target) {
            const totalNeeded = target - starting
            const achieved = current - starting
            progressPercentage = Math.round((achieved / totalNeeded) * 100)
            remaining = target - current
        }
    }

    return {
        current,
        target,
        starting,
        totalChange,
        progressPercentage,
        remaining,
        goalType,
    }
}

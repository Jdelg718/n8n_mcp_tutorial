/**
 * Calculate BMI from weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
    if (!weightKg || !heightCm || heightCm === 0) return 0
    return Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1))
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
}

/**
 * Calculate weight change between entries
 */
export function calculateWeightChange(
    current: number,
    previous: number
): {
    amount: number
    percentage: number
    direction: 'up' | 'down' | 'stable'
} {
    const amount = current - previous
    const percentage = Math.abs((amount / previous) * 100)

    let direction: 'up' | 'down' | 'stable' = 'stable'
    if (Math.abs(amount) >= 0.1) {
        direction = amount > 0 ? 'up' : 'down'
    }

    return {
        amount: Number(amount.toFixed(1)),
        percentage: Number(percentage.toFixed(1)),
        direction,
    }
}

/**
 * Calculate progress toward goal
 */
export function calculateProgress(
    current: number,
    start: number,
    target: number
): {
    percentage: number
    remaining: number
    achieved: number
} {
    if (!target || start === target) {
        return { percentage: 0, remaining: 0, achieved: 0 }
    }

    const totalNeeded = target - start
    const achieved = current - start
    const percentage = Math.round((achieved / totalNeeded) * 100)
    const remaining = target - current

    return {
        percentage: Math.min(Math.max(percentage, 0), 100),
        remaining: Number(remaining.toFixed(1)),
        achieved: Number(achieved.toFixed(1)),
    }
}

/**
 * Format weight for display
 */
export function formatWeight(kg: number, useImperial: boolean): string {
    if (useImperial) {
        const lbs = kg * 2.20462
        return `${lbs.toFixed(1)} lbs`
    }
    return `${kg.toFixed(1)} kg`
}

/**
 * Estimate time to goal based on average weekly change
 */
export function estimateTimeToGoal(
    current: number,
    target: number,
    avgWeeklyChange: number
): { weeks: number; estimatedDate: Date } | null {
    if (!target || avgWeeklyChange === 0) return null

    const remaining = Math.abs(target - current)
    const weeks = Math.ceil(remaining / Math.abs(avgWeeklyChange))

    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + weeks * 7)

    return { weeks, estimatedDate }
}

/**
 * Calculate average weekly weight change
 */
export function calculateAverageWeeklyChange(
    entries: Array<{ weight: number; recorded_at: string }>
): number {
    if (entries.length < 2) return 0

    // Sort by date ascending
    const sorted = [...entries].sort(
        (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )

    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    const weightChange = last.weight - first.weight
    const daysDiff =
        (new Date(last.recorded_at).getTime() - new Date(first.recorded_at).getTime()) /
        (1000 * 60 * 60 * 24)
    const weeks = daysDiff / 7

    if (weeks === 0) return 0

    return Number((weightChange / weeks).toFixed(2))
}

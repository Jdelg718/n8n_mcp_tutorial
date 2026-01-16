export type HealthDataSource = 'manual' | 'apple_health' | 'google_fit'

export type HealthData = {
    id: string
    user_id: string

    // Body metrics
    weight: number | null
    height: number | null
    bmi: number | null

    // Vital signs
    blood_pressure_systolic: number | null
    blood_pressure_diastolic: number | null
    heart_rate: number | null

    // Activity metrics
    steps: number | null
    active_calories: number | null
    resting_calories: number | null
    exercise_minutes: number | null
    distance: number | null

    // Metadata
    data_source: HealthDataSource
    recorded_at: string  // ISO timestamp
    created_at: string
}

export type DailyHealthSummary = {
    date: string  // ISO date
    total_steps: number
    total_active_calories: number
    total_exercise_minutes: number
    total_distance: number
    weight: number | null
    sources: HealthDataSource[]
}

export type WeightEntry = {
    id: string
    user_id: string
    weight: number
    recorded_at: string
    data_source: HealthDataSource
}

export type WeightHistory = {
    entries: WeightEntry[]
    current_weight: number | null
    target_weight: number | null
    total_change: number
    avg_weekly_change: number
    projected_goal_date: string | null
}

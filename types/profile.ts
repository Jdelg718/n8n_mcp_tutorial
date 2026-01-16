export type Gender = 'male' | 'female' | 'other'

export type ActivityLevel = 
  | 'sedentary'           // Little to no exercise
  | 'lightly_active'      // Exercise 1-3 days/week
  | 'moderately_active'   // Exercise 3-5 days/week
  | 'very_active'         // Exercise 6-7 days/week
  | 'extra_active'        // Very intense exercise daily

export type GoalType = 
  | 'weight_loss'         // Calorie deficit
  | 'maintenance'         // Maintain current weight
  | 'muscle_gain'         // Calorie surplus

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  timezone: string
  telegram_chat_id: string | null
  
  // Physical metrics
  weight_kg: number | null
  height_cm: number | null
  birth_date: string | null  // ISO date string
  gender: Gender | null
  activity_level: ActivityLevel | null
  
  // Goals
  goal_type: GoalType | null
  target_weight_kg: number | null
  
  // Calculated nutrition targets (computed by app)
  daily_calorie_goal: number
  daily_protein_goal: number
  daily_carbs_goal: number
  daily_fat_goal: number
  
  // Weight tracking
  last_weight_entry_date: string | null  // ISO date string
  weight_entry_required: boolean
  
  // Profile status
  profile_completed: boolean
  onboarding_completed_at: string | null  // ISO timestamp
  
  // Metadata
  created_at: string
  updated_at: string
}

export type ProfileWithBMI = Profile & {
  current_bmi: number | null
  bmi_category: 'underweight' | 'normal' | 'overweight' | 'obese' | null
}

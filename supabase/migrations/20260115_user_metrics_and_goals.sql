-- Migration: Add User Physical Metrics and Calculated Nutrition Goals
-- Purpose: Enable personalized nutrition calculations based on user data
-- Date: 2026-01-15

-- ============================================
-- EXTEND PROFILES TABLE WITH USER METRICS
-- ============================================

-- Add physical metrics columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS activity_level TEXT 
  CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'));

-- Add goal and target columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS goal_type TEXT 
  CHECK (goal_type IN ('weight_loss', 'maintenance', 'muscle_gain')),
ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2);

-- Add calculated nutrition goals (these will be computed by app)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2000,
ADD COLUMN IF NOT EXISTS daily_protein_goal INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS daily_carbs_goal INTEGER DEFAULT 250,
ADD COLUMN IF NOT EXISTS daily_fat_goal INTEGER DEFAULT 67;

-- Add weekly weight tracking fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_weight_entry_date DATE,
ADD COLUMN IF NOT EXISTS weight_entry_required BOOLEAN DEFAULT false;

-- Add profile completion tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN profiles.weight_kg IS 'Current weight in kilograms (synced from latest health_data entry)';
COMMENT ON COLUMN profiles.height_cm IS 'Height in centimeters (constant after initial entry)';
COMMENT ON COLUMN profiles.birth_date IS 'Date of birth (used to calculate age for BMR)';
COMMENT ON COLUMN profiles.gender IS 'Biological gender (used in BMR calculations)';
COMMENT ON COLUMN profiles.activity_level IS 'Activity multiplier for TDEE calculation';
COMMENT ON COLUMN profiles.goal_type IS 'Weight goal type - affects calorie deficit/surplus calculation';
COMMENT ON COLUMN profiles.target_weight_kg IS 'Target weight goal in kilograms';
COMMENT ON COLUMN profiles.daily_calorie_goal IS 'Calculated daily calorie target based on TDEE and goal';
COMMENT ON COLUMN profiles.daily_protein_goal IS 'Calculated daily protein target in grams';
COMMENT ON COLUMN profiles.daily_carbs_goal IS 'Calculated daily carbohydrate target in grams';
COMMENT ON COLUMN profiles.daily_fat_goal IS 'Calculated daily fat target in grams';
COMMENT ON COLUMN profiles.last_weight_entry_date IS 'Date of last weight log (for weekly reminder)';
COMMENT ON COLUMN profiles.weight_entry_required IS 'Flag to indicate user needs to log weight';
COMMENT ON COLUMN profiles.profile_completed IS 'True if user has completed onboarding with all metrics';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when user completed initial profile setup';

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_weight_kg ON profiles(weight_kg);
CREATE INDEX IF NOT EXISTS idx_profiles_goal_type ON profiles(goal_type);
CREATE INDEX IF NOT EXISTS idx_profiles_completed ON profiles(profile_completed) WHERE profile_completed = true;
CREATE INDEX IF NOT EXISTS idx_profiles_weight_required ON profiles(weight_entry_required) WHERE weight_entry_required = true;

-- ============================================
-- FUNCTION: CHECK WEEKLY WEIGHT REQUIREMENT
-- ============================================

-- Function to mark profiles that need weekly weight entry
CREATE OR REPLACE FUNCTION check_weekly_weight_requirement()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET weight_entry_required = true
  WHERE profile_completed = true
    AND (
      last_weight_entry_date IS NULL 
      OR last_weight_entry_date < CURRENT_DATE - INTERVAL '7 days'
    );
END;
$$;

COMMENT ON FUNCTION check_weekly_weight_requirement() IS 'Marks profiles requiring weekly weight entry (run via cron job)';

-- ============================================
-- TRIGGER: UPDATE PROFILE WEIGHT FROM HEALTH_DATA
-- ============================================

-- Function to sync latest weight from health_data to profile
CREATE OR REPLACE FUNCTION sync_profile_weight_from_health_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profile with latest weight when new health_data entry is created
  IF NEW.weight IS NOT NULL THEN
    UPDATE profiles
    SET 
      weight_kg = NEW.weight,
      last_weight_entry_date = NEW.recorded_at::DATE,
      weight_entry_required = false
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on health_data insert
DROP TRIGGER IF EXISTS on_health_data_weight_insert ON health_data;
CREATE TRIGGER on_health_data_weight_insert
  AFTER INSERT ON health_data
  FOR EACH ROW
  WHEN (NEW.weight IS NOT NULL)
  EXECUTE FUNCTION sync_profile_weight_from_health_data();

COMMENT ON FUNCTION sync_profile_weight_from_health_data() IS 'Syncs latest weight from health_data to profile automatically';

-- ============================================
-- FUNCTION: CALCULATE BMI
-- ============================================

CREATE OR REPLACE FUNCTION calculate_bmi(weight_kg DECIMAL, height_cm DECIMAL)
RETURNS DECIMAL(4,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF weight_kg IS NULL OR height_cm IS NULL OR height_cm = 0 THEN
    RETURN NULL;
  END IF;
  
  -- BMI = weight(kg) / (height(m))^2
  RETURN ROUND((weight_kg / POWER(height_cm / 100.0, 2))::NUMERIC, 2);
END;
$$;

COMMENT ON FUNCTION calculate_bmi(DECIMAL, DECIMAL) IS 'Calculates BMI from weight (kg) and height (cm)';

-- ============================================
-- VIEW: PROFILES WITH CALCULATED BMI
-- ============================================

CREATE OR REPLACE VIEW profiles_with_bmi AS
SELECT 
  p.*,
  calculate_bmi(p.weight_kg, p.height_cm) as current_bmi,
  CASE
    WHEN calculate_bmi(p.weight_kg, p.height_cm) < 18.5 THEN 'underweight'
    WHEN calculate_bmi(p.weight_kg, p.height_cm) < 25 THEN 'normal'
    WHEN calculate_bmi(p.weight_kg, p.height_cm) < 30 THEN 'overweight'
    ELSE 'obese'
  END as bmi_category
FROM profiles p;

COMMENT ON VIEW profiles_with_bmi IS 'Profiles with real-time calculated BMI and category';

-- ============================================
-- MIGRATION VERIFICATION
-- ============================================

-- Verify columns were added
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'profiles'
    AND column_name IN (
      'weight_kg', 'height_cm', 'birth_date', 'gender', 'activity_level',
      'goal_type', 'target_weight_kg', 'daily_calorie_goal', 
      'daily_protein_goal', 'daily_carbs_goal', 'daily_fat_goal',
      'last_weight_entry_date', 'weight_entry_required',
      'profile_completed', 'onboarding_completed_at'
    );
    
  IF column_count = 15 THEN
    RAISE NOTICE 'SUCCESS: All 15 new columns added to profiles table';
  ELSE
    RAISE WARNING 'WARNING: Expected 15 columns, found %', column_count;
  END IF;
END;
$$;

-- Initial Schema for Meal Tracker Application
-- Created: 2026-01-11
-- Includes: Tables, RLS policies, indexes for profiles, meal_logs, health_data, goals

-- ============================================
-- PROFILES TABLE
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "users_view_own_profile"
ON profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "users_insert_own_profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "users_update_own_profile"
ON profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "users_delete_own_profile"
ON profiles
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = id);

-- Indexes for profiles
CREATE INDEX idx_profiles_username ON profiles(username);

-- ============================================
-- MEAL_LOGS TABLE
-- ============================================

CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  fiber DECIMAL(5,2),
  sugar DECIMAL(5,2),
  sodium DECIMAL(5,2),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  photo_url TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'telegram_text', 'telegram_image', 'web')),
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_logs
CREATE POLICY "users_view_own_meals"
ON meal_logs
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_insert_own_meals"
ON meal_logs
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_update_own_meals"
ON meal_logs
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_delete_own_meals"
ON meal_logs
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Indexes for meal_logs
CREATE INDEX idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_logged_at ON meal_logs(logged_at DESC);
CREATE INDEX idx_meal_logs_user_logged ON meal_logs(user_id, logged_at DESC);

-- ============================================
-- HEALTH_DATA TABLE
-- ============================================

CREATE TABLE health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(4,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  steps INTEGER,
  active_calories INTEGER,
  resting_calories INTEGER,
  exercise_minutes INTEGER,
  distance DECIMAL(6,2),
  data_source TEXT CHECK (data_source IN ('manual', 'apple_health', 'google_fit')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_data
CREATE POLICY "users_view_own_health_data"
ON health_data
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_insert_own_health_data"
ON health_data
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_update_own_health_data"
ON health_data
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_delete_own_health_data"
ON health_data
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Indexes for health_data
CREATE INDEX idx_health_data_user_id ON health_data(user_id);
CREATE INDEX idx_health_data_recorded_at ON health_data(recorded_at DESC);
CREATE INDEX idx_health_data_user_recorded ON health_data(user_id, recorded_at DESC);

-- ============================================
-- GOALS TABLE
-- ============================================

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('calorie', 'protein', 'carbs', 'fat', 'weight', 'exercise', 'custom')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goals (using FOR ALL pattern for simplicity)
CREATE POLICY "users_manage_own_goals"
ON goals
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Indexes for goals
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status) WHERE status = 'active';

-- ============================================
-- AUTO-PROFILE TRIGGER
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Trigger to execute function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

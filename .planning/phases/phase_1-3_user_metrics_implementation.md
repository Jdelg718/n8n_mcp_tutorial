# Enhanced Diet Tracking Implementation Plan

## Overview

This plan enhances the meal tracker app with:
1. **User physical metrics** - Collect weight, height, age, gender, activity level during setup
2. **Personalized nutrition calculations** - Calculate BMR, TDEE, and customized macro targets
3. **Enhanced data points** - Track additional metrics like micronutrients, water intake
4. **iPhone health app integration** - Sync activity data (steps, calories burned, exercise) to analyze net calories

## User Review Required

> [!IMPORTANT]
> **Health App Integration Approach**
> 
> Based on the existing documentation, Terra API is mentioned as the planned integration service for Apple Health and Google Fit. However, I need to confirm:
> 
> 1. **Should we proceed with Terra API**, or would you prefer a different approach?
> 2. **Do you have Terra API credentials**, or should we set this up as part of the implementation?
> 3. **Priority order**: Should we implement all phases, or focus on specific ones first (e.g., user metrics + calculations before health app sync)?
> 4. **Weight tracking**: The `health_data` table has `weight` field. Should weight be entered:
>    - In profile (one current weight)?
>    - In health_data (tracked over time)?
>    - Both (profile shows current, health_data shows history)?

> [!WARNING]
> **Breaking Changes**
> 
> The current dashboard uses hardcoded goals (2000 kcal, 150g protein, 250g carbs, 67g fat). After implementing personalized calculations, these will be replaced with user-specific targets. Existing users will need to complete their physical profile to see accurate goals.

## Proposed Changes

### Component 1: Database Schema Enhancements

#### [MODIFY] [20260111_initial_schema.sql](file:///home/jim/projects/n8n_mcp_tutorial/supabase/migrations/20260111_initial_schema.sql)

This is the current schema. We'll create a new migration to extend it.

#### [NEW] [20260115_user_metrics_and_goals.sql](file:///home/jim/projects/n8n_mcp_tutorial/supabase/migrations/20260115_user_metrics_and_goals.sql)

Create a new migration to add:
- Physical metrics to `profiles`: `weight_kg`, `height_cm`, `birth_date`, `gender`, `activity_level`
- Goal calculation fields: `goal_type` (weight_loss/maintenance/muscle_gain), `daily_calorie_goal_calculated`, `daily_protein_goal_calculated`, etc.
- Weight history tracking in `health_data` table (already has weight field, just need to use it consistently)
- New columns for enhanced nutrition: `vitamin_a`, `vitamin_c`, `calcium`, `iron` in `meal_logs`
- Water intake tracking: add `water_ml` column to new `daily_tracking` table

---

### Component 2: Nutritional Calculation Library

#### [NEW] [lib/nutrition/calculations.ts](file:///home/jim/projects/n8n_mcp_tutorial/lib/nutrition/calculations.ts)

Create comprehensive nutrition calculation utilities:

```typescript
// BMR calculation (Mifflin-St Jeor equation)
function calculateBMR(weight_kg, height_cm, age, gender): number

// TDEE calculation (Total Daily Energy Expenditure)
function calculateTDEE(bmr, activityLevel): number

// Macro distribution based on goals
function calculateMacros(tdee, goalType): { protein, carbs, fat }

// BMI calculation
function calculateBMI(weight_kg, height_cm): number

// Ideal weight ranges
function calculateIdealWeightRange(height_cm, gender): { min, max }

// Net calories (intake - activity)
function calculateNetCalories(consumed, burned): number
```

#### [NEW] [lib/nutrition/constants.ts](file:///home/jim/projects/n8n_mcp_tutorial/lib/nutrition/constants.ts)

Define constants for calculations:
- Activity level multipliers (sedentary: 1.2, lightly active: 1.375, etc.)
- Macro ratios by goal type
- Recommended daily allowances (RDAs) for micronutrients

---

### Component 3: User Onboarding Flow

#### [NEW] [app/(auth)/setup/page.tsx](file:///home/jim/projects/n8n_mcp_tutorial/app/(auth)/setup/page.tsx)

Create a multi-step onboarding wizard for new users:
1. Welcome screen
2. Physical metrics form (weight, height, birth date, gender)
3. Activity level selection
4. Goals selection (weight loss, maintenance, muscle gain)
5. Target weight (if applicable)
6. Summary and confirmation

This page will use Server Actions to save data to the `profiles` table.

#### [NEW] [app/actions/setup.ts](file:///home/jim/projects/n8n_mcp_tutorial/app/actions/setup.ts)

Server Actions for onboarding:
- `savePhysicalMetrics()`
- `calculateAndSaveGoals()`
- `completeOnboarding()`

#### [NEW] [lib/zod/setup.ts](file:///home/jim/projects/n8n_mcp_tutorial/lib/zod/setup.ts)

Zod validation schemas for setup forms:
- `PhysicalMetricsSchema` (weight 30-300kg, height 100-250cm, birth_date, gender)
- `ActivityLevelSchema`
- `GoalsSchema`

---

### Component 4: Profile Management Updates

#### [MODIFY] [app/dashboard/profile/page.tsx](file:///home/jim/projects/n8n_mcp_tutorial/app/dashboard/profile/page.tsx)

Enhance the profile page to:
- Display current physical metrics (weight, height, BMI, age)
- Show calculated BMR and TDEE
- Display current goals with targets
- Add "Edit Profile" button
- Show weight history chart (if available)

#### [NEW] [app/dashboard/profile/edit/page.tsx](file:///home/jim/projects/n8n_mcp_tutorial/app/dashboard/profile/edit/page.tsx)

Create profile editing page with form to update:
- Physical metrics
- Activity level
- Goals

#### [NEW] [components/profile/PhysicalMetricsForm.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/profile/PhysicalMetricsForm.tsx)

Reusable form component for entering/editing physical metrics.

#### [NEW] [components/profile/GoalsCalculator.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/profile/GoalsCalculator.tsx)

Interactive component that shows real-time calculation of BMR, TDEE, and macros as user inputs change.

---

### Component 5: Dashboard Updates with Calculated Goals

#### [MODIFY] [app/dashboard/page.tsx](file:///home/jim/projects/n8n_mcp_tutorial/app/dashboard/page.tsx)

Update dashboard to:
- Fetch user's calculated goals from `profiles` table
- Handle case where user hasn't completed setup (show prompt to complete profile)
- Display net calories if activity data is available

#### [MODIFY] [components/dashboard/TodayTotals.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/dashboard/TodayTotals.tsx)

Update to use dynamic goals from database instead of hardcoded values. Show activity calories and net calories if available.

#### [MODIFY] [components/dashboard/ProgressBar.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/dashboard/ProgressBar.tsx)

Enhance to show:
- Different colors based on whether user is over/under goal
- Net calories progress (if activity data available)
- Tooltip with BMR/TDEE context

---

### Component 6: Weight Tracking Feature

#### [NEW] [app/dashboard/weight/page.tsx](file:///home/jim/projects/n8n_mcp_tutorial/app/dashboard/weight/page.tsx)

Create weight tracking page with:
- Form to log current weight
- Weight history chart (line chart showing progress)
- Goal progress indicator
- Statistics (total lost/gained, rate of change, projected goal date)

#### [NEW] [components/weight/WeightEntryForm.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/weight/WeightEntryForm.tsx)

Simple form to log weight with date.

#### [NEW] [components/weight/WeightHistoryChart.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/weight/WeightHistoryChart.tsx)

Recharts line chart showing weight over time with goal line.

#### [NEW] [app/actions/weight.ts](file:///home/jim/projects/n8n_mcp_tutorial/app/actions/weight.ts)

Server Actions:
- `logWeight(weight_kg, date)` - Insert into `health_data` table
- `getWeightHistory(userId, startDate, endDate)` - Fetch historical weights

---

### Component 7: Enhanced Meal Nutrition Tracking

#### [MODIFY] [lib/ai/analyze-text.ts](file:///home/jim/projects/n8n_mcp_tutorial/lib/ai/analyze-text.ts)

Update AI prompt to extract additional nutrition data:
- Micronutrients (vitamin A, C, calcium, iron)
- More detailed macros (saturated fat, dietary fiber, added sugars)
- Meal quality score (nutrient density)

#### [MODIFY] [lib/ai/analyze-image.ts](file:///home/jim/projects/n8n_mcp_tutorial/lib/ai/analyze-image.ts)

Same updates as analyze-text.ts for image-based meal analysis.

#### [MODIFY] [components/meals/NutritionDisplay.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/meals/NutritionDisplay.tsx)

Expand to show:
- Collapsible "Detailed Nutrition" section with micronutrients
- Percentage of daily value (%DV) for each nutrient
- Color coding (red for exceeded, green for on track)

---

### Component 8: iPhone Health App Integration (Terra API)

#### [NEW] [lib/terra/client.ts](file:///home/jim/projects/n8n_mcp_tutorial/lib/terra/client.ts)

Create Terra API client wrapper:
- Initialize Terra SDK
- Authenticate users
- Fetch activity data (steps, active calories, exercise)
- Sync to `health_data` table

#### [NEW] [app/api/health-sync/route.ts](file:///home/jim/projects/n8n_mcp_tutorial/app/api/health-sync/route.ts)

API endpoint to handle Terra webhooks:
- Receive activity data push from Terra
- Validate webhook signature
- Store in `health_data` table
- Trigger real-time update to dashboard

#### [NEW] [app/dashboard/settings/integrations/page.tsx](file:///home/jim/projects/n8n_mcp_tutorial/app/dashboard/settings/integrations/page.tsx)

Create integrations settings page:
- "Connect Apple Health" button (initiates Terra OAuth)
- Connection status indicator
- Sync history and last sync timestamp
- Manual sync trigger button
- Disconnect option

#### [NEW] [components/integrations/HealthAppConnect.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/integrations/HealthAppConnect.tsx)

Component to handle Terra OAuth flow:
- Generate Terra widget/auth URL
- Handle OAuth callback
- Store Terra user ID in `profiles` table

---

### Component 9: Activity Data Visualization

#### [NEW] [components/dashboard/ActivitySummary.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/dashboard/ActivitySummary.tsx)

Dashboard widget showing today's activity:
- Steps count with goal
- Active calories burned
- Exercise minutes
- Net calories (intake - burned)

#### [MODIFY] [app/dashboard/analytics/page.tsx](file:///home/jim/projects/n8n_mcp_tutorial/app/dashboard/analytics/page.tsx)

Add new charts:
- Calorie intake vs. activity burn correlation
- Net calorie trends
- Activity level consistency

#### [NEW] [components/analytics/NetCalorieChart.tsx](file:///home/jim/projects/n8n_mcp_tutorial/components/analytics/NetCalorieChart.tsx)

Dual-axis chart showing intake (bars) and activity burn (line) over time.

---

### Component 10: TypeScript Types Updates

#### [MODIFY] [types/meal.ts](file:///home/jim/projects/n8n_mcp_tutorial/types/meal.ts)

Add micronutrient fields to `Meal` type.

#### [NEW] [types/profile.ts](file:///home/jim/projects/n8n_mcp_tutorial/types/profile.ts)

Create type definitions for user profile with physical metrics:

```typescript
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
  birth_date: string | null
  gender: 'male' | 'female' | 'other' | null
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | null
  
  // Calculated goals
  daily_calorie_goal: number
  daily_protein_goal: number
  daily_carbs_goal: number
  daily_fat_goal: number
  goal_type: 'weight_loss' | 'maintenance' | 'muscle_gain' | null
  target_weight_kg: number | null
  
  // Metadata
  created_at: string
  updated_at: string
}
```

#### [NEW] [types/health.ts](file:///home/jim/projects/n8n_mcp_tutorial/types/health.ts)

Type definitions for health data:

```typescript
export type HealthData = {
  id: string
  user_id: string
  weight: number | null
  height: number | null
  bmi: number | null
  steps: number | null
  active_calories: number | null
  resting_calories: number | null
  exercise_minutes: number | null
  distance: number | null
  data_source: 'manual' | 'apple_health' | 'google_fit'
  recorded_at: string
  created_at: string
}
```

---

## Verification Plan

### Automated Tests

No existing test suite found in the codebase. We will verify through manual testing.

### Manual Verification

#### 1. New User Onboarding Flow
**Steps:**
1. Create a new user account (sign up with new email)
2. After signup, verify redirect to `/setup` page
3. Complete setup form with test data:
   - Weight: 75 kg
   - Height: 175 cm
   - Birth date: 1990-01-01 (34 years old)
   - Gender: Male
   - Activity level: Moderately active
   - Goal: Weight loss
   - Target weight: 70 kg
4. Submit form and verify redirect to dashboard
5. Check that calculated goals appear on dashboard (should see ~2200 kcal if calculations are correct)

**Expected Results:**
- Setup flow completes without errors
- Profile data saved to database
- Dashboard shows personalized goals, not hardcoded values
- BMR ≈ 1750 kcal, TDEE ≈ 2200 kcal (for test data above)

#### 2. Nutritional Calculations Accuracy
**Steps:**
1. Open browser console
2. Navigate to dashboard
3. Inspect the calculated values displayed
4. Manually verify using online calculator (e.g., calculator.net/bmr-calculator.html)
5. Compare app calculations with external calculator results

**Expected Results:**
- BMR calculation within 5% of external calculator
- TDEE calculation correct (BMR × activity multiplier)
- Macro distribution totals match TDEE in calories

#### 3. Weight Tracking
**Steps:**
1. Navigate to `/dashboard/weight` page
2. Log initial weight (e.g., 75 kg)
3. Log another weight entry for different date (e.g., 74.5 kg, 7 days later)
4. Verify weight history chart displays both points
5. Check that current weight updates in profile

**Expected Results:**
- Weight entries saved to `health_data` table
- Chart displays weight trend correctly
- Goal progress indicator shows movement toward target

#### 4. Enhanced Nutrition Display
**Steps:**
1. Log a new meal via web interface
2. Click "Analyze with AI" button
3. Verify AI returns expanded nutrition data (including micronutrients)
4. Check that nutrition display shows detailed view
5. Verify %DV calculations are reasonable

**Expected Results:**
- AI prompt successfully extracts micronutrients
- Nutrition display shows expanded data in collapsible section
- No errors in console

#### 5. Health App Integration (if Terra API configured)
**Steps:**
1. Navigate to `/dashboard/settings/integrations`
2. Click "Connect Apple Health"
3. Complete Terra OAuth flow
4. Grant permissions in health app
5. Verify connection status shows "Connected"
6. Check dashboard for activity data (steps, calories)
7. Verify `health_data` table has synced records

**Expected Results:**
- OAuth flow completes successfully
- Activity data appears on dashboard within 5 minutes
- Data stored in database with correct user_id
- Real-time updates work (new activity data shows without refresh)

#### 6. Dashboard with Activity Data
**Steps:**
1. Ensure health app is connected and has data
2. Log meals totaling 2000 kcal for the day
3. Verify activity summary shows calories burned (e.g., 500 kcal)
4. Check that net calories display shows 1500 kcal net
5. Navigate to analytics page
6. Verify net calorie chart shows correlation between intake and activity

**Expected Results:**
- Dashboard correctly calculates net calories
- Activity widget displays today's steps, calories, exercise
- Analytics charts include activity data
- No crashes or missing data errors

#### 7. Database Verification
**Steps:**
1. Open Supabase dashboard
2. Check `profiles` table for new columns (weight_kg, height_cm, etc.)
3. Verify RLS policies allow users to read/write their own data
4. Test with different user accounts to ensure data isolation
5. Check `health_data` table for weight and activity entries

**Expected Results:**
- Schema changes applied correctly
- RLS policies prevent cross-user data access
- All foreign key constraints working
- Indexes created on commonly queried columns

---

## Environment Variables

Add to `.env.local`:

```bash
# Terra API (for health app integration)
TERRA_DEV_ID=your_terra_dev_id
TERRA_API_KEY=your_terra_api_key
TERRA_WEBHOOK_SECRET=your_webhook_secret

# Terra widget URL (for OAuth)
NEXT_PUBLIC_TERRA_WIDGET_URL=https://widget.tryterra.co
```

## Migration Strategy

Since the app is already deployed with existing users:

1. **Graceful degradation**: Existing users without physical metrics will see prompt to "Complete your profile for personalized goals"
2. **Default values**: If profile incomplete, fall back to existing hardcoded goals (2000 kcal, etc.)
3. **Data migration**: No migration needed for existing data. New columns are nullable.
4. **Backward compatibility**: Dashboard works with or without complete profile

## Dependencies to Install

```bash
npm install @tryterra/terra-react
```

## Estimated Scope

- **Database changes**: 1-2 hours
- **Calculation library**: 2-3 hours
- **Onboarding flow**: 3-4 hours
- **Profile management**: 2-3 hours
- **Dashboard updates**: 2-3 hours
- **Weight tracking**: 2-3 hours
- **Enhanced nutrition**: 2-3 hours
- **Terra API integration**: 4-6 hours (includes OAuth, webhooks, testing)
- **Activity visualization**: 2-3 hours
- **Testing & bug fixes**: 3-4 hours

**Total**: 23-34 hours of development work

## Next Steps

1. **User approval** required for:
   - Terra API approach (vs. other health integration methods)
   - Priority of phases (implement all, or focus on metrics + calculations first?)
   - Weight tracking location (profile vs. health_data table)
   
2. After approval, proceed to EXECUTION mode starting with:
   - Database migrations
   - Calculation library
   - Onboarding flow

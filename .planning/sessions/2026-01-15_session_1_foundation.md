# Session 1: Foundation - Database & Calculation Library

**Date**: 2026-01-15  
**Duration**: ~45 minutes  
**Status**: ✅ Complete

---

## Objectives

Build the foundation for personalized nutrition tracking:
1. Database schema for user physical metrics
2. Nutrition calculation library (BMR, TDEE, macros)
3. TypeScript types and validation schemas

---

## Completed Work

### 1. Database Migration ✅

**File**: `supabase/migrations/20260115_user_metrics_and_goals.sql`

Added 15 new columns to `profiles` table:

**Physical Metrics:**
- `weight_kg` - Current weight (synced from health_data)
- `height_cm` - Height for BMR calculations
- `birth_date` - Age calculation
- `gender` - BMR formula variance
- `activity_level` - TDEE multiplier

**Goals & Targets:**
- `goal_type` - weight_loss/maintenance/muscle_gain
- `target_weight_kg` - Weight goal
- `daily_calorie_goal` - Calculated target
- `daily_protein_goal` - Calculated target
- `daily_carbs_goal` - Calculated target
- `daily_fat_goal` - Calculated target

**Weight Tracking:**
- `last_weight_entry_date` - Last weight log
- `weight_entry_required` - Weekly reminder flag

**Status Tracking:**
- `profile_completed` - Onboarding complete
- `onboarding_completed_at` - Completion timestamp

**Additional Features:**
- ✅ Database trigger to sync weight from `health_data` to `profiles`
- ✅ Function to check weekly weight requirement (for cron job)
- ✅ BMI calculation function
- ✅ View: `profiles_with_bmi` for real-time BMI display
- ✅ Proper indexes on new columns
- ✅ RLS policies automatically apply (inherited from profiles table)

---

### 2. TypeScript Type Definitions ✅

**File**: `types/profile.ts`
- `Profile` type with all new fields
- `ProfileWithBMI` extended type
- Enum types: `Gender`, `ActivityLevel`, `GoalType`

**File**: `types/health.ts`
- `HealthData` type
- `DailyHealthSummary` type
- `WeightEntry` and `WeightHistory` types

---

### 3. Nutrition Calculation Library ✅

**File**: `lib/nutrition/constants.ts`

Evidence-based constants:
- Activity multipliers (1.2 - 1.9)
- Calorie adjustments by goal type (-20% to +10%)
- Macro ratios (protein/carbs/fat percentages)
- Minimum protein requirements (1.6-2.2g/kg)
- Safety limits (min 1200 kcal, max 5000 kcal)
- Age, weight, height validation ranges

**File**: `lib/nutrition/calculations.ts`

Complete calculation suite:

```typescript
calculateAge(birthDate)              // Age from birth date
calculateBMR(weight, height, age, gender)  // Mifflin-St Jeor equation
calculateTDEE(bmr, activityLevel)    // BMR × activity factor
calculateCalorieGoal(tdee, goalType) // Adjusted for deficit/surplus
calculateMacros(calories, goalType, weight) // Protein/carbs/fat in grams
calculateBMI(weight, height)         // Body Mass Index
getBMICategory(bmi)                  // underweight/normal/overweight/obese
calculateIdealWeightRange(height)    // Healthy weight range
calculateGoalDate(current, target, goalType) // Projected completion date
calculateNetCalories(consumed, burned)       // Intake - activity
calculateNutritionGoals(profile)     // All-in-one calculation
```

**Key Formula**: Mifflin-St Jeor BMR
- Men: BMR = 10W + 6.25H - 5A + 5
- Women: BMR = 10W + 6.25H - 5A - 161
- Where W=weight(kg), H=height(cm), A=age(years)

---

### 4. Zod Validation Schemas ✅

**File**: `lib/zod/setup.ts`

Validation for all user input:
- `PhysicalMetricsSchema` - Weight, height, birth_date, gender
- `ActivityLevelSchema` - Activity level selection
- `GoalsSchema` - Goal type and target weight
- `CompleteOnboardingSchema` - Combined validation
- `WeightEntrySchema` - Weekly weight logging
- `ProfileUpdateSchema` - Profile editing

**Validation Features:**
- Min/max bounds from constants
- Age verification (13-120 years, COPPA compliance)
- Conditional validation (target weight required for weight loss/gain)
- Decimal precision limits
- Clear error messages

---

## Files Created

1. `/supabase/migrations/20260115_user_metrics_and_goals.sql` (197 lines)
2. `/types/profile.ts` (56 lines)
3. `/types/health.ts` (54 lines)
4. `/lib/nutrition/constants.ts` (128 lines)
5. `/lib/nutrition/calculations.ts` (285 lines)
6. `/lib/zod/setup.ts` (142 lines)

**Total**: 6 files, 862 lines of code

---

## Technical Decisions

### Decision: Both Profile and Health_Data for Weight
- **Profile**: Stores current weight (for quick access in calculations)
- **Health_Data**: Stores weight history (for tracking over time)
- **Sync**: Trigger automatically updates profile when health_data weight inserted
- **Rationale**: Best of both worlds - fast current value + historical tracking

### Decision: Mifflin-St Jeor over Harris-Benedict
- More accurate for modern populations
- Better for overweight/obese individuals
- Industry standard (used by MyFitnessPal, Cronometer)

### Decision: Minimum Protein by Body Weight
- Ensures adequate protein even if percentage seems low
- Weight loss: 2.0g/kg (preserve muscle)
- Maintenance: 1.6g/kg (maintain)
- Muscle gain: 2.2g/kg (build)

### Decision: Weekly Weight Entry Requirement
- Database field: `weight_entry_required` boolean
- Function: `check_weekly_weight_requirement()` (run via cron)
- UI will prompt user if flag is true
- Auto-clears when weight logged

---

## Database Architecture

### Weight Tracking Flow

```
User logs weight → health_data table
                ↓ (trigger fires)
              profiles table updated
                ↓
         weight_entry_required = false
         last_weight_entry_date = today
```

### Calculation Flow

```
User completes onboarding → Profile data saved
                         ↓
         calculateNutritionGoals(profile)
                         ↓
        BMR → TDEE → Calorie Goal → Macros
                         ↓
            Save to profile columns
```

---

## Next Steps (Session 2)

Will build UI components for onboarding:

1. **Onboarding Flow** (Estimated: 3-4 hours)
   - Multi-step wizard component
   - Physical metrics form
   - Activity level selector
   - Goals form
   - Server Actions for data submission

2. **Profile Page Enhancement** (Estimated: 2 hours)
   - Display physical metrics
   - Show calculated BMR/TDEE
   - BMI indicator
   - Edit profile functionality

3. **Dashboard Updates** (Estimated: 2 hours)
   - Replace hardcoded goals with database values
   - Handle incomplete profiles gracefully
   - Add "Complete your profile" prompt

---

## Testing Checklist

Before moving to next session:
- [ ] Run migration on development database
- [ ] Verify all 15 columns exist
- [ ] Test BMI calculation function manually
- [ ] Test weight sync trigger
- [ ] Verify TypeScript types compile

---

## Notes

- All new columns are nullable for existing users (no breaking changes)
- RLS policies automatically protect new columns (inherited from profiles table)
- Existing dashboard will continue to work with hardcoded goals until Phase 2 complete
- Migration includes verification query (outputs success/warning)
- Weekly weight requirement needs cron job setup (Phase 6)

---

**Session 1 Complete** ✅  
**Foundation Ready for UI Development**  
**Code Quality**: Type-safe, validated, documented

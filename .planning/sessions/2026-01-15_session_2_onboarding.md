# Session 2: Onboarding Flow - Multi-Step Wizard

**Date**: 2026-01-15  
**Duration**: ~40 minutes  
**Status**: ✅ Complete

---

## Objectives

Build complete user onboarding flow for collecting physical metrics and goals:
1. Server Actions for profile setup and updates
2. Multi-step wizard page with progress tracking  
3. Form components with validation
4. UI components (Button, Input, Label)

---

## Completed Work

### 1. Server Actions ✅

**File**: `app/actions/setup.ts`

Created 3 Server Actions:

**`completeOnboarding(data)`** - Main onboarding handler:
- Validates input with Zod schema
- Calls `calculateNutritionGoals()` with user metrics
- Updates `profiles` table with all data + calculated targets
- Inserts initial weight entry to `health_data` table
- Sets `profile_completed = true`
- Returns calculated nutrition goals to client

**`updateProfile(updates)`** - Profile editing:
- Fetches current profile data
- Merges updates with existing values
- Recalculates nutrition goals if physical metrics changed
- Automatic recalculation triggers on: weight, height, birth_date, gender, activity_level, goal_type changes
- Revalidates dashboard and profile pages

**`checkOnboardingStatus()`** - Status check:
- Returns authentication status
- Checks if `profile_completed = true`
- Returns redirect path (`/setup`) if onboarding needed
- Used by middleware/dashboard to enforce onboarding

---

### 2. Multi-Step Wizard Page ✅

**File**: `app/setup/page.tsx`

**Features**:
- 5-step wizard: Welcome → Metrics → Activity → Goals → Summary
- Progress bar (visual % complete indicator)
- Client-side state management for form data
- Step navigation (Next/Back buttons)
- Final submission calls `completeOnboarding()` Server Action
- Redirects to `/dashboard` on success
- Error handling with user-friendly alerts

**State Management**:
```typescript
const [currentStep, setCurrentStep] = useState<SetupStep>('welcome')
const [formData, setFormData] = useState<Partial<CompleteOnboardingData>>({})
```

---

### 3. Wizard Step Components ✅

#### **WelcomeStep.tsx**
- Hero section with app branding
- List of what onboarding will do (4 bullet points with emojis)
- Privacy note
- "Get Started →" button

#### **PhysicalMetricsStep.tsx**
- React Hook Form + Zod validation
- Fields:
  - Weight (kg) - number input with decimal
  - Height (cm) - integer input
  - Birth Date - HTML5 date picker
  - Gender - Select dropdown (male/female/other)
- Real-time validation errors
- Helper text explaining why each field is needed
- Navigation: "← Back" and "Continue →"

#### **ActivityLevelStep.tsx**
- Visual radio button cards (5 levels)
- Each shows:
  - Label (Sedentary, Lightly Active, etc.)
  - Description (Exercise frequency)
  - Examples (Desk job, Light gym, etc.)
  - TDEE multiplier (1.2x - 1.9x BMR)
- Selected card highlighted with green border
- Tip box explaining importance of honesty
- Disabled Continue button until selection made

#### **GoalsStep.tsx**
- 3 goal type cards (visual radio):
  - 📉 Lose Weight (-20% calories, ~0.5kg/week)
  - ⚖️ Maintain Weight (0% change)
  - 💪 Build Muscle (+10% calories, ~0.25kg/week)
- Conditional target weight input (shows if not maintenance)
- Displays current weight for reference
- Warning box about sustainable weight changes
- Form validation ensures target weight required for weight loss/gain

#### **SummaryStep.tsx**
- **Review Section**: Shows all entered data
  - Personal info grid (weight, height, age, gender)
  - BMI with category
  - Activity level and goal type
  - Target weight (if applicable)
  
- **Calculated Targets Section** (real-time):
  - 4 cards showing daily goals:
    - Calories (green)
    - Protein (blue)
    - Carbs (orange)
    - Fat (yellow)
  - BMR and TDEE values displayed
  - Uses `useMemo()` to calculate on render

- Info box explaining Mifflin-St Jeor formula
- "← Back" and "Complete Setup ✓" buttons
- Loading state during submission

---

### 4. UI Components ✅

Created basic UI component library in `components/ui/`:

#### **Button.tsx**
- Variants: `default` (green), `outline`, `ghost`
- Sizes: `default`, `sm`, `lg`
- Disabled states with opacity
- Focus ring for accessibility
- Forward ref for form library compatibility

#### **Input.tsx**
- Styled for forms with Tailwind
- Green focus ring matching app theme
- Placeholder text styling
- Disabled state handling
- Forward ref support

#### **Label.tsx**
- Consistent typography
- Gray text color
- Semantic HTML association with inputs

---

## Files Created

1. `/app/actions/setup.ts` (200 lines) - Server Actions
2. `/app/setup/page.tsx` (124 lines) - Wizard orchestrator
3. `/components/setup/WelcomeStep.tsx` (48 lines)
4. `/components/setup/PhysicalMetricsStep.tsx` (120 lines)
5. `/components/setup/ActivityLevelStep.tsx` (156 lines)
6. `/components/setup/GoalsStep.tsx` (146 lines)
7. `/components/setup/SummaryStep.tsx` (187 lines)
8. `/components/ui/button.tsx` (34 lines)
9. `/components/ui/input.tsx` (20 lines)
10. `/components/ui/label.tsx` (16 lines)

**Total**: 10 files, 1,051 lines of code

---

## Technical Decisions

### Decision: Client-Side Wizard State vs. URL Params
- **Chose**: Client-side `useState` for form data persistence across steps
- **Rationale**: Simpler UX, faster navigation, no URL pollution
- **Alternative**: URL search params would enable bookmarking steps (not needed for onboarding)

### Decision: Real-Time Calculation in Summary
- **Implementation**: `useMemo()` hook calls `calculateNutritionGoals()` on client
- **Rationale**: Instant preview of targets, no server round-trip
- **Benefit**: User sees exactly what they're getting before submitting

### Decision: Separate Step Components
- **Chose**: Individual component files for each step
- **Rationale**: Better code organization, easier testing, clearer separation of concerns
- **Alternative**: All steps in one file would be ~800+ lines (unmaintainable)

### Decision: Visual Radio Cards vs. Dropdowns
- **Chose**: Large, clickable cards for activity level and goals
- **Rationale**: Better mobile UX, easier to compare options, clearer information hierarchy
- **User Benefit**: Can see all options and their implications without clicking

---

## User Flow

```
User signs up → Redirected to /setup
    ↓
Welcome Step (1/5) - "Get Started" button
    ↓
Physical Metrics (2/5) - Enter weight, height, DOB, gender
    ↓
Activity Level (3/5) - Select from 5 cards
    ↓
Goals (4/5) - Select goal type, enter target weight
    ↓
Summary (5/5) - Review + see calculated targets
    ↓
"Complete Setup" → Server Action runs
    ↓
Profile saved → Redirect to /dashboard
    ↓
Dashboard shows personalized nutrition goals!
```

---

## Data Flow

```
Client (Wizard Steps)
  → FormData accumulated in state
    → Summary Step
      → calculateNutritionGoals() (client preview)
        → completeOnboarding() Server Action
          → Zod validation
            → calculateNutritionGoals() (server authoritative)
              → Update profiles table
                → Insert health_data weight
                  → revalidatePath('/dashboard')
                    → Redirect to dashboard
```

---

## Validation Strategy

**Two-Layer Validation**:

1. **Client-Side** (React Hook Form + Zod):
   - Immediate feedback on form errors
   - Prevents invalid submission
   - Better UX (no server round-trip for simple errors)

2. **Server-Side** (Server Action + Zod):
   - Security (never trust client)
   - Authoritative validation
   - Protects against API misuse

**Example Error Flow**:
```
User enters weight "500" kg
  → Client Zod validation fails
    → Error shown immediately: "Weight must be less than 300kg"
      → User fixes to "75"
        → Client validation passes
          → Server Action receives data
            → Server Zod validation (double-check)
              → All good → Proceeds
```

---

## Next Steps (Session 3)

Will update dashboard to use calculated goals:

1. **Dashboard Enhancement** (Estimated: 2-3 hours)
   - Modify `app/dashboard/page.tsx` to fetch user profile with goals
   - Update `components/dashboard/TodayTotals.tsx` to use dynamic goals
   - Add "Complete Profile" prompt for users without onboarding
   - Display BMI and physical metrics

2. **Profile Page Update** (Estimated: 2 hours)
   - Show physical metrics in profile
   - Display calculated BMR/TDEE
   - Add "Edit Profile" functionality
   - BMI indicator with category

---

## Testing Checklist

To test in browser:
- [ ] Create new user account
- [ ] Verify redirect to `/setup`
- [ ] Complete all wizard steps
- [ ] Check calculated values in summary
- [ ] Submit and verify redirect to dashboard
- [ ] Check database: profile_completed = true
- [ ] Check database: nutrition goals populated
- [ ] Check database: weight entry in health_data
- [ ] Refresh and verify no onboarding redirect

---

## Notes

- All wizard components are client components (`'use client'`) for interactivity
- Server Action is server-only (automatic Next.js handling)
- UI components use forward refs for React Hook Form compatibility
- Calculations shown in summary match server-side calculations exactly
- Existing users without onboarding won't break (profile_completed defaults to false)

---

**Session 2 Complete** ✅  
**Onboarding Flow Fully Implemented**  
**Ready for Dashboard Integration**

**Total Progress So Far**:
- Session 1: 862 lines (foundation)
- Session 2: 1,051 lines (onboarding)
- **Combined**: 1,913 lines of new code

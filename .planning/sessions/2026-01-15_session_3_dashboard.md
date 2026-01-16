# Session 3: Dashboard Integration - Dynamic Nutrition Goals

**Date**: 2026-01-15  
**Duration**: ~30 minutes  
**Status**: ✅ Complete

---

## Objectives

Integrate personalized nutrition goals into the dashboard:
1. Fetch user's calculated nutrition targets from profile
2. Display profile completion banner for incomplete profiles
3. Update TodayTotals component to use dynamic goals
4. Maintain backward compatibility for existing users

---

## Completed Work

### 1. Server Action: getUserGoals() ✅

**File**: `app/dashboard/actions.ts`

Added new server action to fetch personalized nutrition goals:

**Features**:
- Fetches profile columns: `daily_calorie_goal`, `daily_protein_goal`, `daily_carbs_goal`, `daily_fat_goal`, `profile_completed`
- Returns structured `UserGoals` type with nutrition targets and completion status
- Falls back to hardcoded defaults (2000/150/250/67) if profile incomplete
- Handles authentication and error states gracefully

**Type Definition**:
```typescript
export type UserGoals = {
  calories: number
  protein: number
  carbs: number
  fat: number
  profileCompleted: boolean
}
```

**Logic Flow**:
```
1. Authenticate user
2. Fetch profile from database
3. Check if profile_completed = true AND goals populated
4. If yes → return calculated goals
5. If no → return default hardcoded goals
```

---

### 2. Profile Completion Banner Component ✅

**File**: `components/dashboard/ProfileCompletionBanner.tsx` (NEW)

**Design**:
- Amber/yellow info banner (non-intrusive color)
- Info emoji icon (ℹ️)
- Clear messaging about benefits of completing profile
- Call-to-action button linking to `/setup`

**Content**:
- Headline: "Complete Your Profile"
- Description: Explains personalized nutrition goals benefit
- CTA: "Complete Profile →" button

**Visual Style**:
- `bg-amber-50` background
- `border-amber-200` border
- `text-amber-900` heading
- `text-amber-800` description
- `bg-amber-600` button with hover effect

---

### 3. Updated Dashboard Page ✅

**File**: `app/dashboard/page.tsx`

**Changes**:
- Import `getUserGoals` action and `ProfileCompletionBanner` component
- Fetch user goals on page load (server-side)
- Calculate `showProfileBanner` flag based on completion status
- Conditionally render banner if profile incomplete
- Pass `goals` prop to `TodayTotals` component

**Code**:
```tsx
// Fetch user's nutrition goals
const goalsResult = await getUserGoals()
const goals = 'error' in goalsResult ? null : goalsResult
const showProfileBanner = !goals || !goals.profileCompleted
```

**Layout Update**:
- Banner appears above "Today's Nutrition" card
- Only visible when `profile_completed = false` or goals not set
- Seamless integration with existing dashboard design

---

### 4. Updated TodayTotals Component ✅

**File**: `components/dashboard/TodayTotals.tsx`

**Changes**:
- Accept `goals` prop of type `UserGoals | null`
- Import `UserGoals` type from actions
- Rename internal variable to `nutritionGoals` to avoid naming conflict
- Use fallback logic: `nutritionGoals = goals || defaultGoals`
- Update all progress bar `max` values to use `nutritionGoals`

**Backward Compatibility**:
- If `goals` prop is null → uses hardcoded defaults
- Existing users without onboarding see same experience
- No breaking changes to meal tracking functionality

**Before**:
```tsx
const goals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 67,
}
```

**After**:
```tsx
const nutritionGoals = goals || {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 67,
}
```

---

## Files Modified

1. `/app/dashboard/actions.ts` (+54 lines) - Added `getUserGoals` function
2. `/app/dashboard/page.tsx` (~10 lines changed) - Fetch goals and pass to components
3. `/components/dashboard/TodayTotals.tsx` (~15 lines changed) - Accept and use dynamic goals

## Files Created

4. `/components/dashboard/ProfileCompletionBanner.tsx` (25 lines) - New banner component

**Total Changes**: 3 files modified, 1 file created, ~104 lines of code

---

## Technical Decisions

### Decision: Fetch Goals in Page vs. Component
- **Chose**: Page-level data fetching in `dashboard/page.tsx`
- **Rationale**: Better performance (single database query), easier testing, clearer data flow
- **Alternative**: Component-level fetching would duplicate queries

### Decision: Nullable Goals Prop
- **Chose**: `goals: UserGoals | null` with fallback
- **Rationale**: Graceful degradation, handles error states, backward compatible
- **Benefit**: Existing users and edge cases don't break

### Decision: Banner Placement
- **Chose**: Above "Today's Nutrition" card in main content area
- **Rationale**: Most visible location, directly related to nutrition goals
- **Alternative**: Top of page banner would be too aggressive

### Decision: Non-Dismissible Banner
- **Chose**: Banner always shows when profile incomplete
- **Rationale**: Strong encouragement to complete onboarding, improves app experience
- **Future**: Could add "Remind me later" in Phase 7

---

## Data Flow

```
User visits /dashboard
  ↓
dashboard/page.tsx calls getUserGoals()
  ↓
Server Action fetches profile from database
  ↓
Check profile_completed and goals presence
  ↓
Return calculated goals OR defaults
  ↓
Page determines showProfileBanner flag
  ↓
Render ProfileCompletionBanner (conditional)
  ↓
Pass goals to TodayTotals component
  ↓
TodayTotals uses goals for progress bar max values
  ↓
User sees personalized calorie/macro targets!
```

---

## User Experience Changes

### For New Users (After This Session):
1. Sign up → Redirected to `/setup` (Session 2)
2. Complete onboarding wizard → Calculated goals saved
3. Redirected to `/dashboard`
4. ✅ See **personalized** nutrition targets immediately
5. ✅ No banner shown (profile complete)

### For New Users (Without Completing Onboarding):
1. Sign up but skip `/setup` somehow
2. Navigate to `/dashboard`
3. ✅ See yellow info banner: "Complete Your Profile"
4. ✅ See default goals (2000/150/250/67)
5. Click banner → Redirected to `/setup`

### For Existing Users (Pre-Onboarding Feature):
1. Log in to account created before this feature
2. Navigate to `/dashboard`
3. ✅ See yellow info banner (profile_completed = false)
4. ✅ Dashboard still functional with default goals
5. ✅ Encouraged to complete profile for personalization

---

## Testing Performed

### ✅ Development Server
- Started `npm run dev` successfully
- No TypeScript errors
- No compilation errors
- Server running on localhost:3000

### Remaining Manual Testing (For User)

**Test Case 1: Completed Profile User**
- [ ] Complete onboarding with test metrics
- [ ] Verify dashboard shows calculated goals (not 2000/150/250/67)
- [ ] Verify NO profile completion banner shown
- [ ] Log a meal and check progress bars update correctly

**Test Case 2: Incomplete Profile User**
- [ ] Create new user, don't complete onboarding
- [ ] Navigate to /dashboard
- [ ] Verify yellow banner appears
- [ ] Verify default goals shown (2000/150/250/67)
- [ ] Click banner → should redirect to /setup

**Test Case 3: Database Verification**
- [ ] After onboarding completion, query database
- [ ] Confirm goals columns populated in profiles table
- [ ] Confirm values match what dashboard displays

---

## Next Steps (Session 4)

**Options for Session 4**:

**Option A: Weight Tracking UI** (Recommended)
- Create `/dashboard/weight` page
- Weekly weight entry form
- Weight history chart/graph
- Progress visualization toward target

**Option B: Profile Page Enhancement**
- Display physical metrics (weight, height, BMI)
- Show calculated BMR/TDEE
- Add edit functionality

**Option C: Testing Session**
- Manual testing checklist execution
- Bug fixes and polish
- Database migration preparation

**Estimated Time**: 2-3 hours for any option

---

## Code Quality Notes

✅ **Type-Safe**: All props typed, no `any` usage  
✅ **Error Handling**: Graceful fallbacks for null/error states  
✅ **Backward Compatible**: Existing users not disrupted  
✅ **DRY Principle**: Reused UserGoals type across files  
✅ **Accessible**: Semantic HTML in banner component  
✅ **Performant**: Single database query, cached by Next.js  

---

## Known Limitations

1. **No "Dismiss" Option**: Banner always shows for incomplete profiles
   - Could add local storage persistence in Phase 7

2. **No Profile Editing**: Users can't change metrics after onboarding
   - Planned for Session 4 or 5

3. **No Visual Indicator**: Dashboard doesn't show BMI or physical metrics yet
   - Could add summary card in future session

4. **Hard Refresh Needed**: After completing onboarding, may need to refresh dashboard
   - Next.js caching behavior (acceptable for v1)

---

**Session 3 Complete** ✅  
**Dynamic Goals Integrated Successfully**  
**Ready for Weight Tracking or Profile Enhancement**

**Total Project Progress**:
- Session 1: 862 lines (foundation)
- Session 2: 1,051 lines (onboarding)
- Session 3: 104 lines (dashboard integration)
- **Combined**: 2,017 lines of new code

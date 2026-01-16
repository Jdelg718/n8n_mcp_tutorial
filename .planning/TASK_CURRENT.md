# Enhanced Diet Tracking with User Metrics & Health Integration

## Phase 1: User Physical Metrics & Setup
- [x] Database schema changes
  - [x] Add `weight_kg`, `height_cm`, `birth_date`, `gender`, `activity_level` to `profiles` table
  - [x] Create migration file with RLS policies
- [x] User onboarding flow
  - [x] Create welcome/setup page for new users
  - [x] Build form to collect weight, height, age, gender, activity level
  - [x] Add Zod validation schemas
- [/] Profile management
  - [ ] Update profile page to show physical metrics
  - [ ] Add edit functionality for updating metrics over time
  - [ ] Display BMI calculation

## Phase 2: Nutritional Calculations
- [x] Calculation utilities
  - [x] Create `lib/nutrition/calculations.ts` for formulas
  - [x] Implement BMR calculation (Mifflin-St Jeor equation)
  - [x] Implement TDEE calculation (BMR × activity multiplier)
  - [x] Implement macro calculation (protein/carbs/fat based on goals)
- [x] Goal customization
  - [x] Add goal type selector (weight loss, maintenance, muscle gain)
  - [x] Calculate personalized daily targets
  - [x] Update dashboard to use calculated goals instead of hardcoded values
- [ ] Weight tracking over time
  - [x] Add weight entry functionality (schema ready)
  - [ ] Create weight history chart
  - [ ] Track progress toward weight goals

## Phase 3: Enhanced Metrics & Data Points
- [ ] Expand meal nutrition tracking
  - [ ] Add micronutrients (vitamins, minerals) to database schema
  - [ ] Update AI prompts to extract more detailed nutrition data
  - [ ] Create detailed nutrition display component
- [ ] Additional health metrics
  - [ ] Track water intake
  - [ ] Track sleep quality/duration
  - [ ] Add custom metric tracking capability
- [ ] Analytics enhancements
  - [ ] Calorie deficit/surplus trends
  - [ ] Nutrient density scores
  - [ ] Meal quality insights
  - [ ] Correlation between activity and intake

## Phase 4: iPhone Health App Integration
- [ ] Research integration options
  - [ ] Evaluate Terra API (mentioned in docs)
  - [ ] Evaluate Apple HealthKit export methods
  - [ ] Determine OAuth flow requirements
- [ ] Backend setup
  - [ ] Configure Terra API or chosen integration service
  - [ ] Create webhook endpoints for health data sync
  - [ ] Update `health_data` table schema as needed
- [ ] Frontend implementation
  - [ ] Create health app connection UI in settings
  - [ ] Build sync status indicator
  - [ ] Display synced activity data in dashboard
- [ ] Data visualization
  - [ ] Add steps/activity to dashboard
  - [ ] Create activity vs. intake correlation charts
  - [ ] Calculate net calories (intake - activity)

## Phase 5: Testing & Verification
- [ ] Manual testing checklist
  - [ ] Test new user onboarding with physical metrics
  - [ ] Verify nutritional calculations are accurate
  - [ ] Test goal customization flow
  - [ ] Verify weight tracking and history
  - [ ] Test health app sync (if available)
- [ ] Data validation
  - [ ] Ensure RLS policies protect user data
  - [ ] Test calculation edge cases
  - [ ] Verify real-time updates work correctly
- [ ] Documentation updates
  - [ ] Update README with new features
  - [ ] Document calculation formulas
  - [ ] Create user guide for health app setup

## Phase 6: Deployment & Monitoring
- [ ] Database migrations
  - [ ] Run migrations on production database
  - [ ] Verify data integrity
- [ ] Deploy to Vercel
  - [ ] Test on staging environment
  - [ ] Deploy to production
  - [ ] Verify all features work in production
- [ ] Monitor performance
  - [ ] Check API response times
  - [ ] Monitor error rates
  - [ ] Track user adoption of new features

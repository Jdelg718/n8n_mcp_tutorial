# Meal Tracker App - Development Roadmap

## Vision
Transform the n8n Telegram bot into a full-featured SaaS meal tracking application with dashboard, health app integration, image recognition, and multi-platform support.

---

## Phase 1: Enhanced n8n Automation (Weeks 1-2)

### 1.1 Image Analysis
**Goal:** Allow users to send food photos for automatic nutrition analysis

**Tasks:**
- [ ] Add image analysis node to workflow
- [ ] Integrate vision-capable AI model (GPT-4 Vision or Claude 3)
- [ ] Extract food items from images
- [ ] Estimate portions and nutrition from visual data
- [ ] Update database schema to store image URLs
- [ ] Add image storage (Supabase Storage)

**Tech:** n8n, OpenRouter (GPT-4 Vision), Supabase Storage

### 1.2 Query Commands
**Goal:** Let users retrieve their meal history via Telegram

**Commands to implement:**
- `/today` - Show today's meals and totals
- `/yesterday` - Show yesterday's data
- `/week` - Show weekly summary
- `/stats` - Show all-time statistics
- `/goal` - Set and view calorie goals

**Tasks:**
- [ ] Add IF node to detect commands
- [ ] Create Supabase query nodes for each command
- [ ] Format responses with tables/charts
- [ ] Add date filtering logic
- [ ] Implement aggregation queries

### 1.3 Meal Type Detection
**Goal:** Automatically categorize meals as breakfast/lunch/dinner/snack

**Tasks:**
- [ ] Update AI prompt to detect meal type
- [ ] Add `meal_type` column to database
- [ ] Add time-based logic (breakfast = morning, etc.)
- [ ] Update confirmation messages

### 1.4 Daily Summary
**Goal:** Send automatic end-of-day nutrition summary

**Tasks:**
- [ ] Create scheduled workflow (runs at 9 PM daily)
- [ ] Query all meals for current day per user
- [ ] Calculate totals and compare to goals
- [ ] Send formatted summary to Telegram
- [ ] Include weekly trends

---

## Phase 2: Database & API Foundation (Weeks 3-4)

### 2.1 Enhanced Database Schema

**New Tables:**
```sql
-- User profiles and preferences
users (
  id,
  telegram_user_id,
  telegram_chat_id,
  email,
  name,
  created_at,
  daily_calorie_goal,
  daily_protein_goal,
  daily_carb_goal,
  daily_fat_goal,
  timezone,
  preferences (jsonb)
)

-- Goals and targets
goals (
  id,
  user_id,
  goal_type (weight_loss/maintenance/gain),
  target_weight,
  current_weight,
  target_date,
  created_at
)

-- Health app integration data
health_data (
  id,
  user_id,
  date,
  steps,
  active_calories,
  resting_calories,
  exercise_minutes,
  source (apple_health/google_fit),
  synced_at
)

-- Enhanced meal_logs
meal_logs (
  id,
  user_id,
  created_at,
  meal_type (breakfast/lunch/dinner/snack),
  meal_name,
  meal_description,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  fiber_g, -- NEW
  sugar_g, -- NEW
  sodium_mg, -- NEW
  image_url,
  confidence_score,
  source (text/image/manual)
)

-- User sessions (for web app)
sessions (
  id,
  user_id,
  token,
  created_at,
  expires_at
)
```

### 2.2 API Development (Supabase Edge Functions)

**Endpoints needed:**
- `POST /api/auth/telegram` - Link Telegram user to web account
- `GET /api/meals` - Get user meals with filters
- `POST /api/meals` - Add meal manually
- `DELETE /api/meals/:id` - Delete meal
- `GET /api/stats` - Get user statistics
- `GET /api/health-sync` - Sync health app data
- `POST /api/goals` - Set user goals
- `GET /api/dashboard` - Get dashboard data

### 2.3 Authentication System

**Options:**
- Supabase Auth (email/password)
- Telegram Login Widget (web)
- Magic link authentication
- OAuth (Google, Apple)

**Tasks:**
- [ ] Set up Supabase Auth
- [ ] Create user registration flow
- [ ] Link Telegram users to web accounts
- [ ] Implement JWT tokens
- [ ] Add Row Level Security (RLS) policies

---

## Phase 3: Web Dashboard MVP (Weeks 5-8)

### 3.1 Technology Stack Decision

**Frontend Framework:** Next.js 14 (App Router)
**UI Library:** Shadcn/ui + Tailwind CSS
**Charts:** Recharts or Chart.js
**State Management:** React Query + Zustand
**Database:** Supabase (PostgreSQL)
**Hosting:** Vercel or VPS (see comparison below)

### 3.2 Core Pages

**Landing Page** (`/`)
- Hero section
- Feature showcase
- Pricing tiers (if SaaS)
- Testimonials
- CTA to sign up

**Dashboard** (`/dashboard`)
- Today's meals summary
- Calorie/macro progress bars
- Quick add meal button
- Recent meals list
- Weekly trends chart

**Meals Page** (`/meals`)
- Calendar view
- Filterable meal history
- Search functionality
- Edit/delete meals
- Export data

**Analytics** (`/analytics`)
- Nutrition trends over time
- Goal progress
- Health metrics (if integrated)
- Insights and recommendations

**Profile/Settings** (`/settings`)
- Personal info
- Goals and targets
- Telegram bot connection
- Health app sync
- Notification preferences

### 3.3 Key Features

- [ ] Responsive design (mobile-first)
- [ ] Dark mode support
- [ ] Real-time updates (Supabase Realtime)
- [ ] Image upload with preview
- [ ] Drag-and-drop meal photos
- [ ] Export data (CSV, PDF)
- [ ] Offline support (PWA)

---

## Phase 4: Health App Integration (Weeks 9-10)

### 4.1 Apple Health Integration

**Approach:** iOS app or HealthKit export
- Build React Native app with HealthKit
- OR: Use shortcuts + webhook to sync data

**Data to sync:**
- Steps
- Active calories burned
- Resting energy
- Workouts
- Weight

### 4.2 Google Fit Integration

**Approach:** OAuth + Google Fit API

**Data to sync:**
- Steps
- Calories
- Activities
- Weight

### 4.3 Manual Entry
- Fallback for users without supported devices
- Simple form for daily activity input

---

## Phase 5: Mobile App (Weeks 11-14)

### 5.1 Technology Options

**Option A: React Native**
- Pros: Code reuse from web, one codebase
- Cons: Larger app size

**Option B: Flutter**
- Pros: Better performance, beautiful UI
- Cons: New language (Dart)

**Option C: PWA (Progressive Web App)**
- Pros: No app store, works everywhere
- Cons: Limited native features

**Recommendation:** Start with PWA, then React Native if needed

### 5.2 Core Features
- Camera integration for meal photos
- Push notifications for meal reminders
- Widget for quick logging
- Offline mode
- Health app sync

---

## Phase 6: SaaS Features (Weeks 15-18)

### 6.1 Multi-tenancy
- Team accounts
- Family sharing
- Nutritionist/client accounts

### 6.2 Subscription Tiers

**Free Tier:**
- 30 meals/month
- Basic nutrition tracking
- Telegram bot access

**Pro Tier ($9.99/month):**
- Unlimited meals
- Image analysis
- Health app sync
- Advanced analytics
- Export data
- Priority support

**Premium Tier ($19.99/month):**
- All Pro features
- AI meal recommendations
- Custom meal plans
- Nutritionist consultation
- API access

### 6.3 Payment Integration
- Stripe or Paddle
- Subscription management
- Usage-based billing
- Trial period (7 days)

### 6.4 Admin Dashboard
- User management
- Analytics
- Support tickets
- Billing overview

---

## Phase 7: Advanced Features (Weeks 19+)

### 7.1 AI Enhancements
- Meal recommendations based on history
- Macro balancing suggestions
- Restaurant meal suggestions
- Barcode scanning
- Recipe import

### 7.2 Social Features
- Share meals with friends
- Community recipes
- Challenges and achievements
- Leaderboards

### 7.3 Integrations
- MyFitnessPal import
- Cronometer sync
- Fitness tracker apps
- Smart scale integration

---

## MVP Launch Checklist (Phase 1-3)

### Pre-Launch
- [ ] n8n automation fully tested
- [ ] Database schema finalized
- [ ] API endpoints complete
- [ ] Web dashboard functional
- [ ] Authentication working
- [ ] Basic analytics implemented
- [ ] Mobile responsive
- [ ] Security audit
- [ ] Privacy policy and terms
- [ ] GDPR compliance

### Launch
- [ ] Deploy to production
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Analytics (PostHog, Plausible)
- [ ] Beta user testing
- [ ] Gather feedback
- [ ] Iterate on bugs

### Post-Launch
- [ ] Onboarding flow
- [ ] Email marketing setup
- [ ] Social media presence
- [ ] Blog/content marketing
- [ ] User documentation

---

## Success Metrics

**Technical:**
- API response time < 200ms
- 99.9% uptime
- Zero data loss

**Product:**
- User retention > 40% (30 days)
- Daily active users > 1000
- Average meals logged per user > 10/week

**Business (SaaS):**
- Conversion rate > 5%
- Monthly recurring revenue (MRR) > $10k
- Customer acquisition cost < $30

---

## Risk Assessment

### Technical Risks
- AI accuracy for nutrition estimation
- Image processing costs
- Database performance at scale
- Health app API limitations

**Mitigation:**
- Use proven AI models
- Implement caching
- Optimize queries
- Have manual entry fallback

### Business Risks
- Market competition (MyFitnessPal, Cronometer)
- User acquisition costs
- Subscription fatigue

**Mitigation:**
- Unique differentiator (Telegram bot + AI)
- Focus on user experience
- Freemium model
- Community building

---

## Timeline Summary

- **Phase 1 (Weeks 1-2):** Enhanced automation
- **Phase 2 (Weeks 3-4):** Database & API
- **Phase 3 (Weeks 5-8):** Web dashboard MVP
- **Phase 4 (Weeks 9-10):** Health app integration
- **Phase 5 (Weeks 11-14):** Mobile app
- **Phase 6 (Weeks 15-18):** SaaS features
- **Phase 7 (Weeks 19+):** Advanced features

**MVP Launch Target:** 8-10 weeks
**Full SaaS Launch:** 18-20 weeks

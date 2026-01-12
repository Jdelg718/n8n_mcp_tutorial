# Complete App Development Prompt - Meal Tracker SaaS

## Project Brief

Build a full-stack meal tracking application with AI-powered nutrition analysis, health app integration, and a comprehensive dashboard. The app should allow users to log meals via text or images, track nutrition goals, and visualize their progress over time.

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router with Server Components)
- **Language:** TypeScript
- **UI Library:** Shadcn/ui components + Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation
- **State Management:**
  - React Query (server state)
  - Zustand (client state)
- **Image Upload:** Uploadthing or native Supabase Storage

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **API:** Supabase Edge Functions + Server Actions
- **File Storage:** Supabase Storage
- **Real-time:** Supabase Realtime subscriptions

### AI & Integrations
- **AI Models:** OpenRouter API (GPT-4o-mini for text, GPT-4 Vision for images)
- **Telegram Bot:** n8n automation (existing)
- **Health Apps:** Apple Health (HealthKit), Google Fit APIs
- **Payments:** Stripe (subscriptions)

### Deployment
- **Hosting:** [To be decided - Vercel or VPS]
- **Domain:** Custom domain
- **SSL:** Automatic (Vercel) or Let's Encrypt (VPS)
- **CDN:** Cloudflare or Vercel Edge

---

## Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT UNIQUE,
  telegram_chat_id BIGINT,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Goals and preferences
  daily_calorie_goal INTEGER DEFAULT 2000,
  daily_protein_goal INTEGER DEFAULT 150,
  daily_carb_goal INTEGER DEFAULT 200,
  daily_fat_goal INTEGER DEFAULT 65,
  timezone TEXT DEFAULT 'UTC',

  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,

  -- Settings
  preferences JSONB DEFAULT '{
    "notifications": true,
    "theme": "light",
    "measurement_system": "metric"
  }'::jsonb
);

-- Meal logs table
CREATE TABLE public.meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Meal details
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  meal_name TEXT NOT NULL,
  meal_description TEXT,

  -- Nutrition data
  calories INTEGER NOT NULL,
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  fiber_g NUMERIC(6,2),
  sugar_g NUMERIC(6,2),
  sodium_mg NUMERIC(7,2),

  -- Metadata
  image_url TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'telegram_text', 'telegram_image', 'web', 'api')),
  confidence_score NUMERIC(3,2),

  -- Indexes
  CONSTRAINT positive_calories CHECK (calories >= 0)
);

-- Health data table
CREATE TABLE public.health_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Activity data
  steps INTEGER DEFAULT 0,
  active_calories INTEGER DEFAULT 0,
  resting_calories INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  distance_km NUMERIC(6,2) DEFAULT 0,

  -- Body metrics
  weight_kg NUMERIC(5,2),

  -- Metadata
  source TEXT CHECK (source IN ('apple_health', 'google_fit', 'manual')),
  synced_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id, date, source)
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Goal details
  goal_type TEXT CHECK (goal_type IN ('weight_loss', 'maintenance', 'muscle_gain', 'custom')) NOT NULL,
  target_weight_kg NUMERIC(5,2),
  current_weight_kg NUMERIC(5,2),
  target_date DATE,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_meal_logs_user_id ON public.meal_logs(user_id);
CREATE INDEX idx_meal_logs_created_at ON public.meal_logs(created_at DESC);
CREATE INDEX idx_meal_logs_user_date ON public.meal_logs(user_id, DATE(created_at));
CREATE INDEX idx_health_data_user_date ON public.health_data(user_id, date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Meal logs policies
CREATE POLICY "Users can view own meals" ON public.meal_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON public.meal_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" ON public.meal_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON public.meal_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Health data policies
CREATE POLICY "Users can view own health data" ON public.health_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data" ON public.health_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

-- Functions for analytics
CREATE OR REPLACE FUNCTION get_daily_totals(p_user_id UUID, p_date DATE)
RETURNS TABLE (
  total_calories BIGINT,
  total_protein NUMERIC,
  total_carbs NUMERIC,
  total_fat NUMERIC,
  meal_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(calories)::BIGINT,
    SUM(protein_g),
    SUM(carbs_g),
    SUM(fat_g),
    COUNT(*)
  FROM meal_logs
  WHERE user_id = p_user_id
    AND DATE(created_at) = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_logs_updated_at BEFORE UPDATE ON public.meal_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Application Structure

```
meal-tracker-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── meals/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── health/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   ├── meals/
│   │   │   └── route.ts
│   │   ├── analyze-meal/
│   │   │   └── route.ts
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts
│   │   └── health-sync/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx (landing page)
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/
│   │   ├── stats-card.tsx
│   │   ├── meal-list.tsx
│   │   ├── nutrition-chart.tsx
│   │   └── quick-add-meal.tsx
│   ├── meals/
│   │   ├── meal-form.tsx
│   │   ├── meal-card.tsx
│   │   ├── image-upload.tsx
│   │   └── nutrition-display.tsx
│   ├── analytics/
│   │   ├── trends-chart.tsx
│   │   ├── goal-progress.tsx
│   │   └── insights.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── mobile-nav.tsx
│   └── shared/
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       └── theme-toggle.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── analyze-text.ts
│   │   └── analyze-image.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── nutrition.ts
│   │   └── format.ts
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-meals.ts
│   │   └── use-stats.ts
│   └── validations/
│       ├── meal.ts
│       └── user.ts
├── types/
│   ├── database.types.ts
│   ├── meal.types.ts
│   └── user.types.ts
├── public/
│   ├── images/
│   └── icons/
├── .env.local
├── .env.example
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Core Features Implementation

### 1. Authentication Flow

**File: `lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `app/(auth)/login/page.tsx`**
- Email/password login
- OAuth providers (Google, Apple)
- Telegram login widget
- "Remember me" option
- Password reset link

### 2. Dashboard Page

**Components:**
- Today's stats cards (calories, protein, carbs, fat)
- Progress bars vs goals
- Recent meals list (last 5)
- Quick add meal button
- Weekly trend chart
- Health data integration (steps, activity)

**Data fetching:**
- Server Component for initial data
- React Query for real-time updates
- Supabase Realtime for live meal additions

### 3. Meal Analysis API

**File: `app/api/analyze-meal/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { analyzeText, analyzeImage } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const { text, imageUrl, source } = await request.json()

  let nutritionData

  if (imageUrl) {
    nutritionData = await analyzeImage(imageUrl)
  } else if (text) {
    nutritionData = await analyzeText(text)
  } else {
    return NextResponse.json(
      { error: 'Either text or imageUrl is required' },
      { status: 400 }
    )
  }

  return NextResponse.json(nutritionData)
}
```

**File: `lib/ai/analyze-text.ts`**
```typescript
export async function analyzeText(text: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition expert. Analyze the meal description and return ONLY a JSON object with: meal_name, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, confidence_score (0-1). No markdown, no extra text.`
        },
        {
          role: 'user',
          content: text
        }
      ]
    })
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}
```

### 4. Image Upload & Analysis

**File: `components/meals/image-upload.tsx`**
- Drag-and-drop zone
- Camera capture (mobile)
- Image preview
- Upload to Supabase Storage
- Progress indicator
- Error handling

**File: `lib/ai/analyze-image.ts`**
- Send image to GPT-4 Vision
- Extract food items and portions
- Return nutrition data
- Confidence score

### 5. Meal Form

**File: `components/meals/meal-form.tsx`**
- Manual entry fields
- AI analysis button
- Meal type selector (breakfast/lunch/dinner/snack)
- Date/time picker
- Image upload
- Validation with Zod
- Submit to database

### 6. Analytics Dashboard

**Charts:**
- Daily calorie trend (line chart)
- Macro distribution (pie chart)
- Weekly comparison (bar chart)
- Goal progress (gauge chart)

**Insights:**
- Average calories per day
- Most logged meals
- Meal timing patterns
- Goal achievement rate

### 7. Health App Integration

**Apple Health:**
- Use HealthKit API (React Native)
- Sync steps, calories, workouts
- Store in health_data table

**Google Fit:**
- OAuth flow
- Fetch activity data
- Sync daily

### 8. Telegram Bot Integration

**Flow:**
1. User sends meal to Telegram bot
2. n8n processes and saves to Supabase
3. Web app displays in real-time (Supabase Realtime)
4. User can edit in web app

---

## Environment Variables

**File: `.env.example`**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter AI
OPENROUTER_API_KEY=your-openrouter-key

# Stripe (for subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Health APIs (optional)
APPLE_HEALTH_CLIENT_ID=
GOOGLE_FIT_CLIENT_ID=
GOOGLE_FIT_CLIENT_SECRET=
```

---

## Key Pages Specifications

### Landing Page (`/`)

**Sections:**
1. Hero
   - Headline: "Track Your Meals with AI-Powered Precision"
   - Subheadline: "Log meals via text or images. Get instant nutrition analysis."
   - CTA buttons: "Start Free Trial" | "View Demo"
   - Hero image: Dashboard screenshot

2. Features
   - AI Nutrition Analysis
   - Telegram Bot Integration
   - Health App Sync
   - Beautiful Dashboard
   - Progress Tracking
   - Goal Setting

3. How It Works
   - Step 1: Send meal photo or description
   - Step 2: AI analyzes nutrition
   - Step 3: View insights and track progress

4. Pricing
   - Free, Pro, Premium tiers
   - Feature comparison table

5. Testimonials
   - User reviews and success stories

6. FAQ
   - Common questions

7. Footer
   - Links, social media, copyright

### Dashboard (`/dashboard`)

**Layout:**
- Header with user avatar, notifications
- Sidebar navigation (desktop) / bottom nav (mobile)
- Main content area

**Widgets:**
- Today's totals card
- Progress rings (calories, protein, carbs, fat)
- Meal list with images
- Quick add meal button
- Weekly trend chart
- Daily streak counter

### Meals Page (`/meals`)

**Features:**
- Date range filter
- Meal type filter
- Search bar
- Calendar view toggle
- List view with meal cards
- Edit/delete actions
- Export data button
- Pagination

**Meal Card:**
- Thumbnail image
- Meal name and type
- Time logged
- Calories and macros
- Source badge (Telegram, Web, etc.)
- Quick actions (edit, delete, duplicate)

### Analytics Page (`/analytics`)

**Sections:**
1. Time Range Selector (7 days, 30 days, 90 days, all time)
2. Summary Stats (total meals, avg calories, etc.)
3. Charts:
   - Calorie trends
   - Macro distribution
   - Meal timing heatmap
   - Goal progress
4. Insights panel:
   - AI-generated recommendations
   - Patterns detected
   - Achievements unlocked

### Settings Page (`/settings`)

**Tabs:**
1. Profile
   - Name, email, avatar
   - Password change
   - Delete account

2. Goals
   - Daily calorie target
   - Macro goals
   - Weight goal
   - Activity level

3. Integrations
   - Telegram bot status
   - Health app connections
   - API keys

4. Notifications
   - Email preferences
   - Push notifications
   - Reminder times

5. Subscription
   - Current plan
   - Usage stats
   - Upgrade/downgrade
   - Billing history

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/telegram` - Link Telegram account

### Meals
- `GET /api/meals` - List meals (with filters)
- `POST /api/meals` - Create meal
- `GET /api/meals/:id` - Get meal details
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Analysis
- `POST /api/analyze-meal` - Analyze text or image

### Stats
- `GET /api/stats/daily` - Get daily totals
- `GET /api/stats/weekly` - Get weekly summary
- `GET /api/stats/trends` - Get trend data

### Health
- `POST /api/health-sync` - Sync health app data
- `GET /api/health-data` - Get health data

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Set new goal
- `PUT /api/goals/:id` - Update goal

### Subscriptions
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout
- `POST /api/subscriptions/portal` - Access billing portal
- `POST /api/webhooks/stripe` - Stripe webhooks

---

## Design System (Tailwind Config)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
        },
        // Add more custom colors
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

**Color Palette:**
- Primary: Green (health, growth)
- Secondary: Blue (trust, technology)
- Accent: Orange (energy, food)
- Success: Green
- Warning: Yellow
- Error: Red

---

## Performance Optimizations

1. **Image Optimization:**
   - Next.js Image component
   - WebP format
   - Lazy loading
   - CDN delivery

2. **Code Splitting:**
   - Dynamic imports
   - Route-based splitting
   - Component lazy loading

3. **Caching:**
   - React Query cache
   - Supabase client-side cache
   - Service Worker (PWA)

4. **Database:**
   - Indexed queries
   - Pagination
   - Connection pooling
   - RLS policies

5. **API:**
   - Response compression
   - Rate limiting
   - Edge functions

---

## Security Considerations

1. **Authentication:**
   - JWT tokens
   - Refresh tokens
   - Session management
   - CSRF protection

2. **Authorization:**
   - Row Level Security (RLS)
   - API route protection
   - Role-based access

3. **Data Protection:**
   - HTTPS only
   - Encrypted database
   - Secure headers
   - Input validation

4. **Privacy:**
   - GDPR compliance
   - Data export
   - Account deletion
   - Cookie consent

---

## Testing Strategy

1. **Unit Tests:**
   - Jest + React Testing Library
   - Utility functions
   - Components

2. **Integration Tests:**
   - API routes
   - Database queries
   - Auth flows

3. **E2E Tests:**
   - Playwright
   - Critical user journeys
   - Cross-browser testing

4. **Performance Tests:**
   - Lighthouse
   - Web Vitals
   - Load testing

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] RLS policies enabled
- [ ] API rate limiting configured
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] SSL certificate
- [ ] Custom domain
- [ ] CDN configured
- [ ] Backup strategy
- [ ] Monitoring alerts
- [ ] Documentation complete

---

## Maintenance Plan

**Daily:**
- Monitor error logs
- Check uptime
- Review user feedback

**Weekly:**
- Database backups
- Performance review
- Security updates

**Monthly:**
- Feature releases
- User analytics review
- Cost optimization

---

## Support & Documentation

1. **User Documentation:**
   - Getting started guide
   - Feature tutorials
   - FAQ
   - Video guides

2. **Developer Documentation:**
   - API reference
   - Database schema
   - Architecture overview
   - Contributing guide

3. **Support Channels:**
   - Email support
   - In-app chat
   - Community forum
   - GitHub issues

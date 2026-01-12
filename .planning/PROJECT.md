# Meal Tracker SaaS

## What This Is

A meal tracking SaaS application that helps users log meals via text, images, or Telegram bot, with AI-powered nutrition analysis and comprehensive dashboard insights. Built with Next.js and Supabase, featuring real-time updates, health app integration, and beautiful data visualization for personal use and a small group.

## Core Value

Dashboard insights must be exceptional - beautiful, actionable visualizations of nutrition data, trends, and progress tracking. If everything else fails, users must be able to see meaningful patterns and insights from their meal data that help them make better health decisions.

## Requirements

### Validated

(None yet - ship to validate)

### Active

**Authentication & User Management**
- [ ] Email/password authentication via Supabase Auth
- [ ] OAuth providers (Google, Apple)
- [ ] Telegram login widget integration
- [ ] User profile management (avatar, goals, preferences)
- [ ] Timezone and measurement system preferences

**Meal Logging**
- [ ] Manual meal entry form with validation (Zod + React Hook Form)
- [ ] Meal type classification (breakfast, lunch, dinner, snack)
- [ ] Image upload to Supabase Storage
- [ ] AI text analysis via OpenRouter (GPT-4o-mini)
- [ ] AI image analysis via OpenRouter (GPT-4 Vision)
- [ ] Nutrition data capture (calories, protein, carbs, fat, fiber, sugar, sodium)
- [ ] Confidence scoring for AI analysis
- [ ] Edit and delete meal entries

**Telegram Integration**
- [ ] n8n webhook integration for Telegram bot
- [ ] Real-time meal sync from Telegram to web app
- [ ] Source tracking (manual, Telegram text, Telegram image, web)
- [ ] Telegram account linking in settings

**Dashboard**
- [ ] Today's nutrition totals (calories, protein, carbs, fat)
- [ ] Progress bars vs daily goals
- [ ] Recent meals list with images
- [ ] Quick add meal button
- [ ] Weekly trend chart
- [ ] Daily streak counter
- [ ] Real-time updates via Supabase Realtime

**Meals Page**
- [ ] Date range filter
- [ ] Meal type filter
- [ ] Search functionality
- [ ] Calendar view toggle
- [ ] List view with meal cards
- [ ] Edit/delete actions
- [ ] Pagination
- [ ] Meal card with thumbnail, name, time, calories, macros

**Analytics Page**
- [ ] Time range selector (7d, 30d, 90d, all time)
- [ ] Summary stats (total meals, avg calories)
- [ ] Calorie trends line chart (Recharts)
- [ ] Macro distribution pie chart
- [ ] Meal timing heatmap
- [ ] Goal progress visualization
- [ ] AI-generated insights panel
- [ ] Pattern detection
- [ ] Achievement system

**Health App Integration**
- [ ] Terra API integration for unified health data access
- [ ] Apple Health sync (steps, active calories, resting calories, exercise minutes, distance, weight)
- [ ] Google Fit sync (same metrics)
- [ ] Manual health data entry option
- [ ] Health data display in dashboard
- [ ] Health data table with date, source tracking

**Settings Page**
- [ ] Profile tab (name, email, avatar, password change, account deletion)
- [ ] Goals tab (daily calorie target, macro goals, weight goal, activity level)
- [ ] Integrations tab (Telegram status, health app connections)
- [ ] Notifications tab (email preferences, push notifications, reminder times)
- [ ] Theme toggle (light/dark mode)

**Landing Page**
- [ ] Hero section (headline, subheadline, CTA, screenshot)
- [ ] Features section (6 key features)
- [ ] How It Works section (3 steps)
- [ ] Pricing section (Free, Pro, Premium tiers with feature comparison)
- [ ] Testimonials section
- [ ] FAQ section
- [ ] Footer with links and social media

**Database & Backend**
- [ ] Supabase database schema (users, meal_logs, health_data, goals tables)
- [ ] Row Level Security (RLS) policies
- [ ] Database indexes for performance
- [ ] Triggers for updated_at timestamps
- [ ] get_daily_totals() function for analytics
- [ ] Supabase Edge Functions for API endpoints
- [ ] Server Actions for mutations

**Technical Infrastructure**
- [ ] Next.js 14 App Router with Server Components
- [ ] TypeScript throughout
- [ ] Shadcn/ui component library
- [ ] Tailwind CSS styling
- [ ] React Query for server state
- [ ] Zustand for client state
- [ ] Image optimization (Next.js Image, WebP, lazy loading)
- [ ] Code splitting and dynamic imports
- [ ] Error handling and loading states
- [ ] Input validation (client and server)

**Security & Performance**
- [ ] HTTPS only (Vercel automatic)
- [ ] JWT tokens with refresh
- [ ] CSRF protection
- [ ] RLS policies on all tables
- [ ] Secure headers configuration
- [ ] Response compression
- [ ] Rate limiting on API routes
- [ ] Optimized database queries with indexes
- [ ] Connection pooling

**Deployment & DevOps**
- [ ] Vercel deployment configuration
- [ ] Environment variables setup
- [ ] Custom domain configuration
- [ ] CDN delivery (Vercel Edge)
- [ ] Error tracking setup
- [ ] Analytics configuration
- [ ] Database migrations
- [ ] Backup strategy

### Out of Scope

- **Stripe subscriptions/payments** - Building free tier only for v1. The pricing page will show tiers but payment integration comes in v2 when ready to monetize. Deferring this allows focus on core value (insights) without payment complexity.

## Context

**Existing Infrastructure:**
- Supabase project already provisioned and configured
- OpenRouter API account with access to GPT-4o-mini and GPT-4 Vision
- Working n8n Telegram bot workflow that needs to integrate with the web app
- Terra API will be used for health app integrations (provides unified interface to Apple Health, Google Fit, and other platforms)

**Technical Environment:**
- Next.js 14 with App Router and Server Components for modern React patterns
- TypeScript for type safety throughout the stack
- Shadcn/ui provides accessible, customizable components built on Radix UI
- Supabase handles database (PostgreSQL), authentication, file storage, and real-time subscriptions
- OpenRouter provides access to latest AI models without vendor lock-in
- Vercel provides optimal Next.js hosting with automatic optimizations

**Target Users:**
- Primary: Personal use for daily meal tracking and nutrition insights
- Secondary: Small group (family, friends) who will also use the app
- Not targeting massive scale, but want it polished and reliable

**Design Philosophy:**
- Mobile-first responsive design
- Clean, modern UI with focus on data visualization
- Fast, intuitive interactions
- Real-time updates feel essential for good UX
- AI should feel magical but confidence scores keep it honest

## Constraints

- **Tech Stack**: Next.js 14, TypeScript, Supabase, OpenRouter, Terra API - these choices are locked in based on existing setup and expertise
- **Deployment**: Vercel for Next.js hosting - easiest path with automatic SSL, CDN, and optimizations
- **Integration**: Must work with existing n8n Telegram bot workflow - this is already built and in use
- **Health Data**: Web-only architecture means native health APIs (HealthKit) require bridge service (Terra API) rather than native mobile app
- **AI Models**: OpenRouter provides model access, but costs scale with usage - need to be mindful of token consumption

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vercel deployment over VPS | Easiest Next.js hosting with automatic SSL, global CDN, zero config deploys, generous free tier | — Pending |
| Terra API for health integrations | Unified API for Apple Health and Google Fit without building native mobile app, handles OAuth complexity | — Pending |
| OpenRouter for AI models | Access to latest models (GPT-4o-mini for text, GPT-4 Vision for images) without vendor lock-in, competitive pricing | — Pending |
| Comprehensive v1 without payments | Build full feature set to validate complete user experience before adding monetization complexity | — Pending |
| Supabase for backend | Single service handles database, auth, storage, real-time - reduces integration complexity and operational overhead | — Pending |
| Shadcn/ui over component library | Copy-paste components provide full customization without library lock-in, built on accessible Radix primitives | — Pending |

---
*Last updated: 2026-01-11 after initialization*

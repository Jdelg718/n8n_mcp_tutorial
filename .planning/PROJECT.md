# Meal Tracker SaaS

## What This Is

A meal tracking SaaS application that helps users log meals via text, images, or Telegram bot, with AI-powered nutrition analysis and comprehensive dashboard insights. Built with Next.js and Supabase, featuring real-time updates, health app integration, and beautiful data visualization for personal use and a small group.

## Core Value

Dashboard insights must be exceptional - beautiful, actionable visualizations of nutrition data, trends, and progress tracking. If everything else fails, users must be able to see meaningful patterns and insights from their meal data that help them make better health decisions.

## Requirements

### Validated

- ✓ Email/password authentication via Supabase Auth — v1.0
- ✓ OAuth providers (Google) — v1.0
- ✓ User profile management (basic) — v1.0
- ✓ Manual meal entry form with validation (Zod + React Hook Form) — v1.0
- ✓ Meal type classification (breakfast, lunch, dinner, snack) — v1.0
- ✓ Image upload to Supabase Storage — v1.0
- ✓ AI text analysis via OpenRouter (GPT-4o-mini) — v1.0
- ✓ AI image analysis via OpenRouter (GPT-4o) — v1.0
- ✓ Nutrition data capture (calories, protein, carbs, fat, fiber, sugar, sodium) — v1.0
- ✓ Confidence scoring for AI analysis — v1.0
- ✓ Edit and delete meal entries — v1.0
- ✓ n8n webhook integration for Telegram bot — v1.0
- ✓ Real-time meal sync from Telegram to web app — v1.0
- ✓ Source tracking (manual, Telegram text, Telegram image, web) — v1.0
- ✓ Today's nutrition totals (calories, protein, carbs, fat) — v1.0
- ✓ Progress bars vs daily goals — v1.0
- ✓ Recent meals list with images — v1.0
- ✓ Real-time updates via Supabase Realtime — v1.0
- ✓ Date range filter — v1.0
- ✓ Meal type filter — v1.0
- ✓ Search functionality — v1.0
- ✓ Pagination — v1.0
- ✓ Time range selector (7d, 30d, 90d, all time) — v1.0
- ✓ Summary stats (total meals, avg calories) — v1.0
- ✓ Calorie trends line chart (Recharts) — v1.0
- ✓ Macro distribution pie chart — v1.0
- ✓ AI-generated insights panel — v1.0
- ✓ Pattern detection — v1.0
- ✓ Supabase database schema with RLS — v1.0
- ✓ Server Actions for mutations — v1.0
- ✓ Next.js 14 App Router with Server Components — v1.0
- ✓ TypeScript throughout — v1.0
- ✓ Shadcn/ui component library — v1.0
- ✓ Tailwind CSS styling — v1.0
- ✓ Image optimization (compression, WebP) — v1.0
- ✓ Error handling and loading states — v1.0
- ✓ Input validation (client and server) — v1.0

### Active

**Authentication & User Management**
- [ ] Apple OAuth configuration (Google already working)
- [ ] Telegram login widget integration
- [ ] Enhanced user profile management (avatar upload, goals, preferences)
- [ ] Timezone and measurement system preferences

**Dashboard**
- [ ] Quick add meal button
- [ ] Weekly trend chart widget
- [ ] Daily streak counter

**Meals Page**
- [ ] Calendar view toggle

**Analytics Page**
- [ ] Meal timing heatmap
- [ ] Goal progress visualization
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
- [ ] Health data tables and RLS policies
- [ ] Goals table and user preferences
- [ ] Additional database indexes as needed

**Technical Infrastructure**
- [ ] React Query for server state (if needed)
- [ ] Zustand for client state (if needed)
- [ ] Code splitting and dynamic imports (optimization phase)

**Security & Performance**
- [ ] Rate limiting on API routes (add if needed)
- [ ] Performance optimization pass

**Deployment & DevOps**
- [ ] Custom domain configuration
- [ ] Error tracking setup (Sentry or similar)
- [ ] Analytics configuration
- [ ] Database backup strategy

### Out of Scope

- **Stripe subscriptions/payments** - Building free tier only for v1. The pricing page will show tiers but payment integration comes in v2 when ready to monetize. Deferring this allows focus on core value (insights) without payment complexity.

## Context

**Current State (v1.0 MVP Shipped):**
- 5,313 lines of TypeScript/TSX/SQL code
- 97 files across Next.js 14 app structure
- Fully functional meal tracking with AI-powered nutrition analysis
- Telegram bot integration via n8n webhooks (deployed to Vercel)
- Real-time dashboard with today's totals and progress tracking
- Complete analytics page with charts and AI-generated insights
- All data secured with Supabase RLS policies

**Tech Stack:**
- Next.js 14 with App Router and Server Components
- TypeScript throughout
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- OpenRouter API (GPT-4o for images, GPT-4o-mini for text)
- Shadcn/ui component library with Tailwind CSS
- Recharts for data visualization
- n8n for Telegram bot integration
- Deployed on Vercel

**User Feedback & Observations:**
- Core functionality working well: meal logging, AI analysis, dashboard views
- Analytics insights provide meaningful patterns (as intended - core value delivered)
- Telegram integration smooth with real-time sync
- Need to add: health app data, user-customizable goals, settings page

**Known Issues:**
- Goals are hardcoded (2000 kcal, 150g protein, 250g carbs, 67g fat) - Phase 7 will add user customization
- No health app integration yet (Terra API integration planned for Phase 6)
- Landing page not yet created (Phase 8)

**Target Users:**
- Primary: Personal use for daily meal tracking and nutrition insights
- Secondary: Small group (family, friends) who will also use the app
- Not targeting massive scale, but want it polished and reliable

**Design Philosophy:**
- Mobile-first responsive design
- Clean, modern UI with focus on data visualization
- Fast, intuitive interactions
- Real-time updates essential for good UX
- AI analysis with confidence scores for transparency

## Constraints

- **Tech Stack**: Next.js 14, TypeScript, Supabase, OpenRouter, Terra API - these choices are locked in based on existing setup and expertise
- **Deployment**: Vercel for Next.js hosting - easiest path with automatic SSL, CDN, and optimizations
- **Integration**: Must work with existing n8n Telegram bot workflow - this is already built and in use
- **Health Data**: Web-only architecture means native health APIs (HealthKit) require bridge service (Terra API) rather than native mobile app
- **AI Models**: OpenRouter provides model access, but costs scale with usage - need to be mindful of token consumption

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vercel deployment over VPS | Easiest Next.js hosting with automatic SSL, global CDN, zero config deploys, generous free tier | ✓ Good - Deployed successfully, zero config |
| OpenRouter for AI models | Access to latest models (GPT-4o for images, GPT-4o-mini for text) without vendor lock-in, competitive pricing | ✓ Good - Cost-effective, reliable API |
| GPT-4o (not mini) for image analysis | GPT-4o-mini uses 20-33x more tokens for vision, costs same as GPT-4o | ✓ Good - Significant cost savings |
| GPT-4o-mini for text-only analysis | 33x cheaper than GPT-4o for text descriptions | ✓ Good - Optimized costs |
| Supabase for backend | Single service handles database, auth, storage, real-time - reduces integration complexity and operational overhead | ✓ Good - Seamless integration, RLS working well |
| Shadcn/ui over component library | Copy-paste components provide full customization without library lock-in, built on accessible Radix primitives | ✓ Good - Full control, consistent design |
| Server Actions with useActionState | Progressive enhancement, loading states, automatic error handling | ✓ Good - Clean pattern, great DX |
| Bearer token auth for webhooks | Simple shared secret for v1 webhook authentication | ✓ Good - Secure and simple |
| Client-side image compression | Compress to 1200px/0.8 quality/WebP before upload | ✓ Good - Reduced storage costs |
| Signed URLs for image upload | Bypasses 1MB Server Action limit | ✓ Good - Enables large image uploads |
| URL search params for UI state | Enables browser back/forward, shareable URLs | ✓ Good - Better UX than client state |
| Avoid route groups in Next.js 16 | Route groups cause 404s with Turbopack | ⚠️ Workaround - Fixed by removing route groups |
| Recharts for analytics | Mature charting library with good React integration | ✓ Good - Clean charts, responsive |
| Comprehensive v1 without payments | Build full feature set to validate complete user experience before adding monetization complexity | — Pending v2 |
| Terra API for health integrations | Unified API for Apple Health and Google Fit without building native mobile app, handles OAuth complexity | — Pending Phase 6 |

---
*Last updated: 2026-01-12 after v1.0 milestone completion*

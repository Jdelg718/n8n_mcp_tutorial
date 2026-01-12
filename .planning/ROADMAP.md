# Roadmap: Meal Tracker SaaS

## Overview

Build a comprehensive meal tracking SaaS from foundation to deployment. Starting with Next.js infrastructure and Supabase setup, we'll implement meal logging with AI-powered analysis, integrate Telegram bot functionality, create dashboard and analytics visualizations, add health app integration via Terra API, and polish with settings management and landing page before deploying to production on Vercel.

## Domain Expertise

None

## Phases

- [x] **Phase 1: Foundation & Database** - Next.js 14 setup, Supabase integration, authentication, database schema with RLS
- [ ] **Phase 2: Meal Logging System** - Manual entry forms, image upload, AI analysis (text + images), edit/delete functionality (In progress)
- [ ] **Phase 3: Telegram Integration** - n8n webhook integration, real-time meal sync, source tracking
- [ ] **Phase 4: Dashboard & Meals** - Dashboard view with today's totals, meals list page with filters and real-time updates
- [ ] **Phase 5: Analytics & Insights** - Charts, trends, time-based analysis, AI-generated insights
- [ ] **Phase 6: Health App Integration** - Terra API setup, Apple Health/Google Fit sync, health data display
- [ ] **Phase 7: Settings & Profile** - User settings, goals management, integrations, theme toggle
- [ ] **Phase 8: Landing Page & Deployment** - Marketing landing page, Vercel deployment, production optimization

## Phase Details

### Phase 1: Foundation & Database
**Goal**: Establish Next.js application infrastructure with Supabase backend, authentication system, and complete database schema with security policies
**Depends on**: Nothing (first phase)
**Research**: Completed (DISCOVERY.md created)
**Research topics**: Next.js 14 App Router patterns, Supabase RLS best practices, authentication flow with Supabase Auth
**Plans**: 3

Plans:
- [x] 01-01: Project Setup & Supabase Configuration (2 tasks) — Complete
- [x] 01-02: Database Schema & Security (2 tasks) — Complete
- [x] 01-03: Authentication System (3 tasks + 1 checkpoint) — Complete

### Phase 2: Meal Logging System
**Goal**: Build complete meal entry system with manual forms, image uploads, and AI-powered nutrition analysis
**Depends on**: Phase 1
**Research**: Completed (02-RESEARCH.md created)
**Research topics**: OpenRouter API integration, GPT-4o-mini and GPT-4 Vision usage, image upload optimization with Supabase Storage
**Plans**: 5

Plans:
- [x] 02-01: Storage & AI Infrastructure (3 tasks) — Complete
- [x] 02-02: Manual Meal Entry Form (3 tasks) — Complete
- [ ] 02-03: Image Upload & Compression — Not started
- [ ] 02-04: AI Nutrition Analysis — Not started
- [ ] 02-05: Edit & Delete Functionality — Not started

### Phase 3: Telegram Integration
**Goal**: Connect existing n8n Telegram bot to web app with real-time meal synchronization
**Depends on**: Phase 2
**Research**: Likely (external webhook integration)
**Research topics**: n8n webhook patterns, Telegram bot API, real-time sync strategies with Supabase
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 4: Dashboard & Meals
**Goal**: Create dashboard with today's nutrition totals and meals browsing page with filters
**Depends on**: Phase 2
**Research**: Unlikely (internal UI using established patterns from earlier phases)
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 5: Analytics & Insights
**Goal**: Build analytics page with charts, trends, and AI-generated nutrition insights
**Depends on**: Phase 4
**Research**: Unlikely (Recharts library, internal data visualization patterns)
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 6: Health App Integration
**Goal**: Integrate Terra API to sync Apple Health and Google Fit data with dashboard display
**Depends on**: Phase 4
**Research**: Likely (external API, OAuth flows)
**Research topics**: Terra API integration, Apple Health/Google Fit data models, OAuth provider setup
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 7: Settings & Profile
**Goal**: Implement user settings page with profile, goals, integrations management, and theme toggle
**Depends on**: Phase 6
**Research**: Unlikely (internal UI, CRUD operations)
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 8: Landing Page & Deployment
**Goal**: Create marketing landing page and deploy to Vercel with production optimization
**Depends on**: Phase 7
**Research**: Likely (deployment configuration)
**Research topics**: Vercel deployment best practices, environment variables, CDN configuration, error tracking setup
**Plans**: TBD

Plans:
- [ ] TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Database | 3/3 | Complete | 2026-01-12 |
| 2. Meal Logging System | 2/5 | In progress | - |
| 3. Telegram Integration | 0/TBD | Not started | - |
| 4. Dashboard & Meals | 0/TBD | Not started | - |
| 5. Analytics & Insights | 0/TBD | Not started | - |
| 6. Health App Integration | 0/TBD | Not started | - |
| 7. Settings & Profile | 0/TBD | Not started | - |
| 8. Landing Page & Deployment | 0/TBD | Not started | - |

---
phase: 02-meal-logging
plan: 01
subsystem: ai
tags: [openrouter, gpt-4o, supabase-storage, zod, nutrition-analysis]

# Dependency graph
requires:
  - phase: 01-foundation-database
    provides: Supabase auth patterns, database schema, RLS patterns
provides:
  - Supabase Storage bucket with user-scoped RLS policies
  - OpenRouter AI client with model selection (GPT-4o/GPT-4o-mini)
  - Structured nutrition analysis prompts and response validation
  - Environment configuration for AI services
affects: [02-02-manual-entry, 02-03-image-upload, 02-04-ai-analysis]

# Tech tracking
tech-stack:
  added: [openai, compressorjs, date-fns, react-hook-form, @hookform/resolvers]
  patterns: [OpenRouter with OpenAI SDK, structured JSON AI responses, Zod validation]

key-files:
  created:
    - supabase/storage_setup.sql
    - lib/ai/openrouter.ts
    - lib/ai/prompts.ts
    - lib/ai/types.ts
  modified:
    - .env.example
    - package.json

key-decisions:
  - "Use GPT-4o (not mini) for image analysis due to token usage parity"
  - "Use GPT-4o-mini for text-only analysis (33x cheaper)"
  - "Structured JSON output with response_format for reliable parsing"
  - "Path-based RLS policies using folder pattern for user isolation"

patterns-established:
  - "OpenRouter client via OpenAI SDK with baseURL override"
  - "Nutrition response validation with Zod schema"
  - "Confidence levels (high/medium/low) for AI uncertainty"

issues-created: []

# Metrics
duration: 6min
completed: 2026-01-12
---

# Phase 2 Plan 1: Storage & AI Infrastructure Summary

**Supabase Storage bucket with RLS policies, OpenRouter AI client (GPT-4o/GPT-4o-mini), and structured nutrition analysis with Zod validation**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-12T11:30:17Z
- **Completed:** 2026-01-12T11:36:34Z
- **Tasks:** 3/3
- **Files modified:** 7

## Accomplishments

- Created Supabase Storage bucket 'meal-images' with RLS policies for user-scoped access
- Built OpenRouter AI client with cost-optimized model selection (GPT-4o for images, GPT-4o-mini for text)
- Defined structured nutrition analysis prompt system with JSON response format
- Created NutritionResponse type and Zod validation schema for reliable AI parsing
- Installed all required dependencies for meal logging features (AI, forms, date handling)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase Storage bucket and RLS policies** - `9a61881` (feat)
2. **Task 2: Create OpenRouter AI client and prompt templates** - `080a6a9` (feat)
3. **Task 3: Install AI dependencies** - `d2a7c09` (chore)

## Files Created/Modified

- `supabase/storage_setup.sql` - Storage bucket and RLS policies for meal images
- `lib/ai/openrouter.ts` - OpenRouter client with analyzeTextMeal() and analyzeImageMeal()
- `lib/ai/prompts.ts` - NUTRITION_SYSTEM_PROMPT with structured JSON format
- `lib/ai/types.ts` - NutritionResponse interface and Zod schema
- `.env.example` - Added OPENROUTER_API_KEY and NEXT_PUBLIC_APP_URL
- `package.json` - Added openai, compressorjs, date-fns, react-hook-form, @hookform/resolvers

## Decisions Made

**Model selection for cost optimization:**
- GPT-4o for image analysis (despite higher per-request cost, mini uses 20-33x more tokens for vision)
- GPT-4o-mini for text-only analysis (33x cheaper, same quality for text)

**Structured JSON output:**
- Use response_format: { type: 'json_object' } to ensure reliable parsing
- Validate all AI responses with Zod schema before use

**Storage security:**
- Path-based RLS policies using `storage.foldername(name)[1]` pattern
- Each user can only access their own folder (user_id/filename structure)

**Environment configuration:**
- OpenRouter API key for AI access
- NEXT_PUBLIC_APP_URL for API tracking and attribution

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Storage infrastructure ready for image uploads with signed URLs
- AI client ready for nutrition analysis (text and image)
- All dependencies installed and build succeeds
- Environment variables configured (users need to add actual OpenRouter API key)

**Ready for Plan 2:** Manual Meal Entry Form - build form UI with validation and Server Actions

---
*Phase: 02-meal-logging*
*Completed: 2026-01-12*

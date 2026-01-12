# Meal Tracker Automation - Project Record

## Project Overview
Built a Telegram-based meal tracking automation using n8n that logs meals to Supabase database with AI-powered nutrition analysis.

**Date Started:** January 11, 2026
**Status:** MVP Complete ✅

---

## What We Built

### Core Workflow Components

1. **Telegram Trigger**
   - Listens for incoming messages from Telegram bot
   - Downloads attachments (images enabled for future use)
   - Captures user_id and chat_id automatically

2. **AI Agent (OpenRouter + GPT-4o-mini)**
   - Analyzes meal descriptions from user text
   - Extracts nutrition data:
     - Meal name
     - Calories
     - Protein (g)
     - Carbs (g)
     - Fat (g)
     - Original meal description
   - Returns structured JSON output

3. **Parse AI Response (Code Node)**
   - Parses AI JSON output
   - Handles both plain JSON and markdown-wrapped responses
   - Extracts Telegram user data (user_id, chat_id)
   - Structures data for database insertion

4. **Supabase Database Integration**
   - Inserts meal logs into `meal_logs` table
   - Stores: user_id, chat_id, meal_name, meal_description, calories, protein_g, carbs_g, fat_g, message_type, created_at

5. **Confirmation Message**
   - Sends formatted response back to user via Telegram
   - Shows logged meal with nutrition breakdown
   - Provides immediate feedback

### Database Schema

**Table: `meal_logs`**
```sql
- id (int8, auto-generated)
- created_at (timestamptz)
- user_id (int8)
- chat_id (int8)
- meal_name (text)
- meal_description (text)
- calories (int4)
- protein_g (numeric)
- carbs_g (numeric)
- fat_g (numeric)
- message_type (text)
```

---

## Technical Stack

- **Automation Platform:** n8n (self-hosted)
- **Database:** Supabase (PostgreSQL)
- **AI Model:** OpenRouter API (GPT-4o-mini)
- **Messaging:** Telegram Bot API
- **Hosting:** Local/VPS

---

## Problems Solved

### 1. Supabase Field Mapping Issue
**Problem:** Error "Could not find the '18' column" - field names were incorrectly mapped.
**Solution:** Corrected Supabase node configuration to use:
- `fieldId`: column name (e.g., "user_id")
- `fieldValue`: expression (e.g., "={{ $json.user_id }}")

### 2. Field Name Formatting
**Problem:** Field names had newline characters causing "chat_id\n" error.
**Solution:** Recreated Supabase node with clean field names.

### 3. Telegram Message Expressions Not Evaluating
**Problem:** Message showed "{{ $json.calories }}" instead of actual values.
**Solution:** Used proper n8n expression syntax with `={{` and string concatenation.

### 4. Chat ID Not Found
**Problem:** Telegram couldn't find chat to send message to.
**Solution:** Added explicit `chatId` parameter pulling from database response.

---

## Key Learnings

1. **n8n Expression Syntax:** Must use `={{` not just `{{` for expressions to evaluate
2. **Supabase Node Structure:** Field ID = column name, Field Value = data expression
3. **Data Flow:** Understanding how data passes between nodes (pinned data helps debugging)
4. **AI Prompt Engineering:** Clear, structured prompts get better JSON responses
5. **Debugging Strategy:** Check each node's output, use pinned data for testing

---

## Current Capabilities

✅ Text-based meal logging via Telegram
✅ AI-powered nutrition estimation
✅ Automatic database storage
✅ Instant confirmation messages
✅ Multi-user support (user_id tracking)

---

## Limitations

❌ No image analysis yet (trigger ready, not implemented)
❌ No meal history queries
❌ No data visualization
❌ No health app integration
❌ No daily summaries
❌ No meal type categorization (breakfast/lunch/dinner)
❌ Single workflow (no error handling)

---

## User Experience Flow

1. User sends message to Telegram bot: "I ate a chicken salad sandwich"
2. Bot processes with AI (2-3 seconds)
3. Bot replies with nutrition breakdown:
   ```
   ✅ Meal logged successfully!

   Chicken Salad Sandwich

   📊 Nutrition:
   • Calories: 450
   • Protein: 30g
   • Carbs: 40g
   • Fat: 18g
   ```
4. Data automatically saved to Supabase

---

## Resources & Credentials

**Telegram Bot:** "Telegram account 2" (credential ID: P5klJPvL0baZPhe8)
**Supabase:** "Supabase account" (credential ID: QobkEo4JXBSwkUtX)
**OpenRouter:** "OpenRouter account" (credential ID: e4DN3SOI9elovs0s)
**Workflow ID:** n0yIHfgxCqbMDE0Y
**Database:** Meal_Tracker_n8n (Supabase project: mdztqnclnayxbvlpnmwc)

---

## Next Session Starting Point

The workflow is production-ready for basic text-based meal logging. Ready to add:
1. Image analysis capability
2. Query commands for meal history
3. Dashboard development

---

## Files & Documentation

- Workflow: "Meal tracker simple" (n8n)
- Database: `meal_logs` table (Supabase)
- Screenshots: `/home/jimde/projects/screenshots/`
- This document: `MEAL_TRACKER_PROJECT_RECORD.md`

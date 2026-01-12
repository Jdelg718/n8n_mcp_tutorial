# Telegram Meal Tracker - Multimodal AI Agent Setup Guide

## Overview

This workflow creates an intelligent Telegram bot that tracks your meals using AI-powered nutrition analysis. Users can send either text or voice messages describing their meals, and the bot will:

- Transcribe voice messages (using OpenAI Whisper)
- Analyze meal descriptions with GPT-4o-mini
- Extract nutrition information (calories, protein, carbs, fat)
- Store meal logs in Supabase
- Send confirmation with nutrition breakdown

**Workflow ID:** `vPYMkjaSDQ2bFzeU`

---

## Prerequisites

Before setting up this workflow, you need:

1. **n8n instance** - Running and accessible at: `https://n8n.edwardleske.us`
2. **Telegram Bot Token** - Created via [@BotFather](https://t.me/botfather)
3. **OpenAI API Key** - From [OpenAI Platform](https://platform.openai.com)
4. **Supabase Account** - Project with API credentials

---

## Step 1: Create Supabase Database Table

### 1.1 Create the `meal_logs` table

In your Supabase SQL editor, run:

```sql
CREATE TABLE meal_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  meal_name TEXT NOT NULL,
  meal_description TEXT,
  calories INTEGER,
  protein_g DECIMAL(10,2),
  carbs_g DECIMAL(10,2),
  fat_g DECIMAL(10,2),
  message_type TEXT CHECK (message_type IN ('text', 'voice'))
);

-- Create index for faster queries
CREATE INDEX idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_created_at ON meal_logs(created_at DESC);
```

### 1.2 Enable Row Level Security (Optional but Recommended)

```sql
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert/select (for n8n)
CREATE POLICY "Allow service role access" ON meal_logs
  FOR ALL
  USING (true);
```

### 1.3 Get Supabase Credentials

From your Supabase project settings:
- **URL:** `https://[your-project].supabase.co`
- **API Key:** Use the `service_role` key (not anon key) for n8n

---

## Step 2: Configure n8n Credentials

You need to create three credentials in n8n:

### 2.1 Telegram Bot API Credential

1. In n8n, go to **Credentials** → **New Credential**
2. Select **Telegram API**
3. **Name:** `Telegram Bot API`
4. **Access Token:** Your bot token from @BotFather (format: `123456:ABC-DEF...`)
5. Click **Save**

**To get a Telegram bot token:**
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the token provided

### 2.2 OpenAI API Credential

1. Go to **Credentials** → **New Credential**
2. Select **OpenAI API**
3. **Name:** `OpenAI API`
4. **API Key:** Your OpenAI API key (starts with `sk-`)
5. Click **Save**

**To get an OpenAI API key:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy and save the key securely

### 2.3 Supabase API Credential

1. Go to **Credentials** → **New Credential**
2. Select **Supabase API**
3. **Name:** `Supabase API`
4. **Host:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
5. **Service Role Secret:** Your Supabase service_role key
6. Click **Save**

**Important:** The workflow expects these exact credential names:
- `telegram_cred` (ID in workflow)
- `openai_cred` (ID in workflow)
- `supabase_cred` (ID in workflow)

If your credential IDs don't match, you'll need to update them in the workflow nodes.

---

## Step 3: Activate the Workflow

### 3.1 Navigate to the Workflow

1. Go to your n8n instance
2. Find the workflow: **"Telegram Meal Tracker - Multimodal AI Agent"**
3. Open it

### 3.2 Update Credential References (if needed)

The workflow references credentials by ID. If you need to update them:

1. Click on **Telegram Trigger** node
2. Select your Telegram credential from the dropdown
3. Repeat for:
   - **Transcribe Voice** node (OpenAI)
   - **Analyze Meal with AI** node (OpenAI)
   - **Log to Supabase** node (Supabase)
   - **Send Confirmation** node (Telegram)

### 3.3 Set the Telegram Webhook

The workflow uses webhook ID: `telegram-meal-tracker`

1. Click the **Telegram Trigger** node
2. Make note of the webhook URL shown
3. The webhook will be automatically registered when you activate the workflow

### 3.4 Activate

1. Toggle the **Active** switch in the top-right corner
2. The workflow status should change to **Active**
3. The Telegram bot is now listening for messages

---

## Step 4: Test the Workflow

### 4.1 Start a Conversation with Your Bot

1. Open Telegram
2. Search for your bot username
3. Send `/start` to begin

### 4.2 Send a Test Message (Text)

Send a text message describing a meal:
```
I just had grilled chicken breast with brown rice and broccoli
```

The bot should respond with:
```
✅ Meal logged successfully!

📝 Meal: Grilled Chicken with Rice and Vegetables
🔥 Calories: 450 kcal

Macros:
🥩 Protein: 45g
🍞 Carbs: 50g
🥑 Fat: 8g
```

### 4.3 Send a Voice Message

Record a voice message describing your meal. The workflow will:
1. Transcribe your voice using OpenAI Whisper
2. Analyze the transcription
3. Log and respond with nutrition data

---

## How It Works: Workflow Architecture

```
Telegram Message Received
         ↓
Check Message Type (If Node)
    ↓           ↓
  Voice        Text
    ↓           ↓
Transcribe   Extract Text
 (OpenAI)        ↓
    ↓           ↓
Extract Voice Text
         ↓
    Merge Paths
         ↓
Analyze Meal with AI (GPT-4o-mini)
         ↓
Parse AI Response (JSON)
         ↓
Log to Supabase
         ↓
Send Confirmation to Telegram
```

### Node Breakdown

| Node Name | Type | Purpose |
|-----------|------|---------|
| **Telegram Trigger** | Trigger | Listens for incoming Telegram messages |
| **Check Message Type** | If | Routes voice vs text messages |
| **Transcribe Voice** | OpenAI | Converts voice to text using Whisper |
| **Extract Voice Text** | Set | Normalizes voice message data |
| **Extract Text Message** | Set | Normalizes text message data |
| **Analyze Meal with AI** | OpenAI | Uses GPT-4o-mini to extract nutrition info |
| **Parse AI Response** | Set | Parses JSON response from AI |
| **Log to Supabase** | Supabase | Stores meal log in database |
| **Send Confirmation** | Telegram | Sends formatted response to user |

---

## Configuration Details

### AI Prompt (Analyze Meal with AI node)

The workflow uses this prompt for nutrition analysis:

```
You are a nutrition expert. Analyze the following meal description and provide estimated nutrition information.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "meal_name": "brief descriptive name",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "meal_description": "original description"
}

User's meal: {{ $json.text }}
```

**Model:** `gpt-4o-mini`
**Temperature:** `0.3` (for consistent, conservative estimates)

### Data Flow

Each node passes data forward:

1. **Telegram Trigger** provides: `message.text`, `message.voice`, `message.from.id`, `message.chat.id`
2. **Extract nodes** normalize to: `text`, `user_id`, `chat_id`, `message_type`
3. **AI Analysis** adds: `nutrition_data` object
4. **Supabase** stores all fields
5. **Send Confirmation** uses `Parse AI Response` data to format message

---

## Troubleshooting

### Bot doesn't respond

1. **Check workflow is Active:** Toggle should be ON
2. **Verify webhook registered:**
   - Go to Telegram Trigger node
   - Click "Execute Node" to re-register webhook
3. **Check credentials:** Ensure Telegram Bot token is correct
4. **Review execution logs:** Check n8n execution history for errors

### Voice messages not transcribed

1. **Verify OpenAI credential:** Test in another workflow
2. **Check OpenAI API quota:** You may have hit rate limits
3. **Ensure "Download" is enabled:** Telegram Trigger → Additional Fields → "Download" = true

### AI returns invalid JSON

The workflow expects strict JSON format. If AI returns markdown:
1. The prompt explicitly requests no markdown
2. Temperature is set to 0.3 for consistency
3. Consider adding error handling node if needed

### Supabase insert fails

1. **Table structure:** Verify `meal_logs` table exists with correct columns
2. **Credentials:** Use `service_role` key, not `anon` key
3. **Field types:** Check data types match (user_id = BIGINT, calories = INTEGER)
4. **RLS policies:** If enabled, ensure service role has access

### Confirmation message not sent

1. **Check Telegram credential:** Same credential for Trigger and Send nodes
2. **Chat ID reference:** Ensure Parse AI Response correctly passes `chat_id`
3. **Message formatting:** n8n expressions must use `=` prefix

---

## Monitoring and Maintenance

### View Execution History

1. Go to **Executions** in n8n sidebar
2. Filter by workflow name
3. Click on execution to see:
   - Input data
   - Node outputs
   - Execution time
   - Errors

### Database Queries

**Daily meal summary:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as meal_count,
  SUM(calories) as total_calories,
  SUM(protein_g) as total_protein
FROM meal_logs
WHERE user_id = [YOUR_USER_ID]
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Recent meals:**
```sql
SELECT
  created_at,
  meal_name,
  calories,
  message_type
FROM meal_logs
WHERE user_id = [YOUR_USER_ID]
ORDER BY created_at DESC
LIMIT 10;
```

### Cost Considerations

**OpenAI Usage:**
- **Whisper (voice transcription):** ~$0.006 per minute
- **GPT-4o-mini (meal analysis):** ~$0.00015 per request (150 tokens avg)

**Typical monthly cost for 1 user:**
- 30 meals/month (mix of text/voice) = ~$0.10-0.20

---

## Extending the Workflow

### Add Image Recognition

1. Add another branch in "Check Message Type" for photos
2. Use OpenAI Vision API to analyze food images
3. Merge with text analysis path

### Weekly Summary Reports

1. Add a Schedule Trigger (runs weekly)
2. Query Supabase for past week's meals
3. Use OpenAI to generate summary
4. Send via Telegram

### Multiple Users/Privacy

1. Add user authentication in Telegram Trigger
2. Create user profiles table in Supabase
3. Implement daily calorie goals per user

### Export to CSV

1. Add a Telegram command handler (`/export`)
2. Query Supabase for user's meals
3. Format as CSV
4. Send document via Telegram

---

## Support and Resources

- **n8n Documentation:** https://docs.n8n.io
- **n8n Community Forum:** https://community.n8n.io
- **Telegram Bot API Docs:** https://core.telegram.org/bots/api
- **OpenAI API Docs:** https://platform.openai.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

## Security Best Practices

1. **Never share credentials:** Keep API keys secure
2. **Use environment variables:** Don't hardcode sensitive data
3. **Enable Supabase RLS:** Protect user data
4. **Monitor API usage:** Set up billing alerts for OpenAI/Supabase
5. **Limit bot scope:** Only enable necessary Telegram permissions

---

## License and Disclaimer

This workflow is provided as-is for educational purposes. Nutrition estimates are AI-generated and should not replace professional medical advice.

**Last Updated:** 2026-01-11
**Workflow Version:** 2
**n8n Version Tested:** 1.122.5

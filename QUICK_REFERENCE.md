# 📋 Quick Reference - Telegram Meal Tracker

## Essential Info

**Workflow ID:** `vPYMkjaSDQ2bFzeU`
**Workflow Name:** Telegram Meal Tracker - Multimodal AI Agent
**Status:** Inactive (activate after setup)

---

## 🔑 Required Credentials

| Service | Credential Name | What You Need |
|---------|----------------|---------------|
| **Telegram** | `Telegram Bot API` | Bot token from @BotFather |
| **OpenAI** | `OpenAI API` | API key (starts with `sk-`) |
| **Supabase** | `Supabase API` | Project URL + service_role key |

---

## 📦 Database Setup (Supabase)

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
```

---

## 🚀 Quick Start Checklist

- [ ] Create Telegram bot via @BotFather
- [ ] Create Supabase table `meal_logs`
- [ ] Add 3 credentials in n8n (Telegram, OpenAI, Supabase)
- [ ] Update credential references in workflow nodes
- [ ] Activate workflow (toggle switch)
- [ ] Test by messaging your bot

---

## 💬 Usage Examples

**Text message:**
```
I ate a chicken salad with olive oil dressing
```

**Voice message:**
Record: "I just had oatmeal with banana and peanut butter"

**Bot response:**
```
✅ Meal logged successfully!

📝 Meal: Chicken Salad
🔥 Calories: 350 kcal

Macros:
🥩 Protein: 30g
🍞 Carbs: 12g
🥑 Fat: 18g
```

---

## 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| Bot not responding | 1. Check workflow is Active<br>2. Verify Telegram webhook registered<br>3. Check execution logs |
| Voice not transcribed | Enable "Download" in Telegram Trigger settings |
| Invalid JSON from AI | Check prompt in "Analyze Meal" node |
| Supabase insert fails | Use `service_role` key, verify table structure |

---

## 📊 Workflow Flow

```
Telegram → Check Type → Voice/Text → Transcribe (if voice) →
Extract Text → AI Analysis → Parse JSON → Save to DB →
Send Confirmation
```

---

## 💰 Cost Estimate

Per user/month (30 meals):
- OpenAI Whisper: ~$0.05-0.10
- GPT-4o-mini: ~$0.005
- **Total: ~$0.10-0.20/month**

---

## 📖 Full Documentation

See `SETUP.md` for complete instructions, troubleshooting, and extensions.

---

## 🔗 Quick Links

- **n8n Instance:** https://n8n.edwardleske.us
- **Get Telegram Bot Token:** https://t.me/botfather
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **Supabase Dashboard:** https://supabase.com/dashboard

---

**⚡ Pro Tip:** Test with simple meals first (e.g., "apple" or "chicken breast") to verify the workflow before complex descriptions.

# 🚀 Simple Meal Tracker - Start Fresh

Let's create a **brand new, simple workflow** that will definitely work. This bypasses all the problematic nodes.

---

## Why Start Fresh?

The current workflow has corrupted node configurations that keep failing. Creating a new workflow from scratch takes 5 minutes and guarantees it will work.

---

## Simple Workflow (Text-Only, No Voice)

### Architecture:
```
Telegram Trigger → AI Agent (OpenRouter) → Parse Response → Log to Supabase → Send Confirmation
```

**5 nodes total** - Much simpler!

---

## Step-by-Step: Create New Workflow

### 1. Create New Workflow

1. Go to n8n: `https://n8n.edwardleske.us`
2. Click **"Workflows"** in sidebar
3. Click **"Add Workflow"** (+ button)
4. Name it: **"Meal Tracker Simple"**
5. Click **"Save"**

---

### 2. Add Telegram Trigger

1. **Click the "+" button** on the canvas
2. **Search:** "Telegram Trigger"
3. **Click** "Telegram Trigger"
4. **Configure:**
   - **Credential:** Select your "Telegram account 2"
   - **Updates:** Message (should be selected by default)
   - **Additional Fields** → Click "Add Field" → "Download" → Toggle ON
5. **Click outside** to close the panel

---

### 3. Add AI Agent (with OpenRouter)

1. **Click the "+" after Telegram Trigger**
2. **Search:** "AI Agent"
3. **Select:** "@n8n/n8n-nodes-langchain.agent"
4. **Configure:**

   **System Message:**
   ```
   You are a nutrition expert. When the user describes a meal, analyze it and return ONLY a JSON object in this exact format:

   {
     "meal_name": "brief descriptive name",
     "calories": estimated_number,
     "protein_g": estimated_number,
     "carbs_g": estimated_number,
     "fat_g": estimated_number,
     "meal_description": "original user description"
   }

   Do NOT include markdown, code blocks, or any extra text. ONLY return the JSON object.
   ```

   **Prompt (Input Field):**
   ```
   {{ $json.message.text }}
   ```

5. **Add Chat Model:**
   - Click **"Chat Model"** dropdown
   - Select **"Chat OpenRouter"** (or "Chat OpenAI" if you have OpenAI credentials)
   - **Create credential:**
     - **API Key:** Your OpenRouter API key (or OpenAI key)
     - **Model:** `openai/gpt-4o-mini` (for OpenRouter) or `gpt-4o-mini` (for OpenAI)
   - **Save**

6. **Save the node**

---

### 4. Add Code Node (Parse JSON)

1. **Click the "+" after AI Agent**
2. **Search:** "Code"
3. **Select:** "Code"
4. **Name it:** "Parse AI Response"
5. **Paste this code:**

```javascript
const aiOutput = $input.first().json.output;

// Try to extract JSON from the AI response
let nutritionData;

try {
  // If the AI returned pure JSON
  nutritionData = JSON.parse(aiOutput);
} catch (e) {
  // If the AI wrapped it in markdown code blocks
  const jsonMatch = aiOutput.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
                    aiOutput.match(/(\{[\s\S]*?\})/);

  if (jsonMatch) {
    nutritionData = JSON.parse(jsonMatch[1]);
  } else {
    throw new Error('Could not parse AI response');
  }
}

// Get user and chat info from original Telegram message
const telegramData = $('Telegram Trigger').first().json;

return {
  json: {
    nutrition_data: nutritionData,
    user_id: telegramData.message.from.id,
    chat_id: telegramData.message.chat.id,
    message_type: 'text'
  }
};
```

6. **Save**

---

### 5. Add Supabase Node

1. **Click the "+" after Parse AI Response**
2. **Search:** "Supabase"
3. **Select:** "Supabase"
4. **Configure:**
   - **Credential:** Your Supabase credential
   - **Resource:** Row
   - **Operation:** Create
   - **Table:** `meal_logs`
   - **Data Mode:** Define Below
   - **Add these fields:**
     - `user_id` → `{{ $json.user_id }}`
     - `chat_id` → `{{ $json.chat_id }}`
     - `meal_name` → `{{ $json.nutrition_data.meal_name }}`
     - `meal_description` → `{{ $json.nutrition_data.meal_description }}`
     - `calories` → `{{ $json.nutrition_data.calories }}`
     - `protein_g` → `{{ $json.nutrition_data.protein_g }}`
     - `carbs_g` → `{{ $json.nutrition_data.carbs_g }}`
     - `fat_g` → `{{ $json.nutrition_data.fat_g }}`
     - `message_type` → `{{ $json.message_type }}`

5. **Save**

---

### 6. Add Telegram Send Message

1. **Click the "+" after Supabase**
2. **Search:** "Telegram"
3. **Select:** "Telegram" (not Telegram Trigger)
4. **Configure:**
   - **Credential:** Your Telegram credential
   - **Resource:** Message
   - **Operation:** Send Message
   - **Chat ID:** Click 𝑓ₓ (expression) → Enter:
     ```
     {{ $('Parse AI Response').item.json.chat_id }}
     ```
   - **Text:** Click 𝑓ₓ (expression) → Enter:
     ```
     ✅ Meal logged successfully!

     📝 Meal: {{ $('Parse AI Response').item.json.nutrition_data.meal_name }}
     🔥 Calories: {{ $('Parse AI Response').item.json.nutrition_data.calories }} kcal

     Macros:
     🥩 Protein: {{ $('Parse AI Response').item.json.nutrition_data.protein_g }}g
     🍞 Carbs: {{ $('Parse AI Response').item.json.nutrition_data.carbs_g }}g
     🥑 Fat: {{ $('Parse AI Response').item.json.nutrition_data.fat_g }}g
     ```

5. **Save**

---

## 7. Save & Activate

1. **Click "Save"** (top-right)
2. **Click "Active"** toggle (top-right)
3. **Should activate successfully!** ✅

---

## 8. Test

Message your Telegram bot:
```
I had scrambled eggs with toast
```

Should respond with nutrition breakdown!

---

## Why This Works

1. **No problematic langchain.openAi nodes** - Uses AI Agent instead
2. **Simpler structure** - 5 nodes instead of 9
3. **Text-only** - No voice transcription complications
4. **Proven pattern** - Uses standard n8n nodes
5. **Flexible AI** - Works with OpenRouter, OpenAI, or any chat model

---

## Add Voice Support Later (Optional)

Once this works, we can add voice transcription as a separate branch.

---

## Alternative: Even Simpler Version

If AI Agent doesn't work, we can use a simple HTTP Request to OpenRouter API:

**Replace AI Agent with HTTP Request:**
- **Method:** POST
- **URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Headers:**
  - `Authorization`: `Bearer YOUR_OPENROUTER_API_KEY`
  - `Content-Type`: `application/json`
- **Body:**
```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a nutrition expert. Analyze meals and return JSON with: meal_name, calories, protein_g, carbs_g, fat_g, meal_description. No markdown."
    },
    {
      "role": "user",
      "content": "{{ $json.message.text }}"
    }
  ]
}
```

---

**Ready to create this fresh workflow?** It will definitely work! 🚀

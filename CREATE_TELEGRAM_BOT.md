# 🤖 Create a New Telegram Bot - Step by Step

## Step 1: Open Telegram and Find BotFather

1. **Open Telegram** on your phone or desktop
2. **Search for:** `@BotFather` (it has a blue checkmark)
3. **Click on it** to open the chat
4. **Click "Start"** or send `/start`

You should see a welcome message with a list of commands.

---

## Step 2: Create Your New Bot

1. **Send this command:**
   ```
   /newbot
   ```

2. **BotFather will ask:** "Alright, a new bot. How are we going to call it? Please choose a name for your bot."

3. **Type a name for your bot** (this is the display name):
   ```
   My Meal Tracker Bot
   ```
   *(or any name you like)*

4. **BotFather will ask:** "Good. Now let's choose a username for your bot. It must end in `bot`. Like this, for example: TetrisBot or tetris_bot."

5. **Type a unique username** (must end with "bot"):
   ```
   my_meal_tracker_bot
   ```
   *(Try different names if taken, like: `meal_logger_2026_bot` or `nutrition_tracker_xyz_bot`)*

---

## Step 3: Get Your Bot Token

Once you've successfully created the bot, BotFather will send you a message like this:

```
Done! Congratulations on your new bot. You will find it at t.me/my_meal_tracker_bot.
You can now add a description, about section and profile picture for your bot.

Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890

Keep your token secure and store it safely, it can be used by anyone to control your bot.
```

---

## Step 4: COPY THE TOKEN

**IMPORTANT:** Copy the entire token that looks like:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
```

**DO NOT share this token with anyone!** (except pasting it into n8n)

---

## Step 5: Update Your n8n Credential

Now let's update your n8n workflow with the new bot token:

### Option A: Update Existing Credential (Recommended)

1. **Go to n8n:** `https://n8n.edwardleske.us`
2. **Click "Credentials"** in the left sidebar (or top menu)
3. **Find:** "Telegram account" credential
4. **Click on it** to edit
5. **Replace the "Access Token"** with your new token
6. **Click "Save"**

### Option B: Create New Credential

1. **Go to n8n:** `https://n8n.edwardleske.us`
2. **Click "Credentials"** → **"New Credential"**
3. **Search for:** "Telegram"
4. **Select:** "Telegram API"
5. **Name:** `My Meal Tracker Bot`
6. **Access Token:** Paste your new token
7. **Click "Save"**

If you created a NEW credential, you need to:
- Open your workflow
- Click on "Telegram Trigger" node
- Select the new credential from dropdown
- Click on "Send a text message" node
- Select the new credential from dropdown
- Save the workflow

---

## Step 6: Test Your New Bot

1. **Find your bot in Telegram:**
   - Search for your bot's username (e.g., `@my_meal_tracker_bot`)
   - Click on it
   - Click "Start"

2. **You should see:**
   ```
   This bot can't talk to you directly. Add it to a group or channel.
   ```
   OR nothing happens (this is normal - the bot isn't active yet)

---

## Step 7: Activate the Workflow in n8n

1. **Open your workflow** in n8n
2. **Make sure the Telegram nodes are using the correct credential**
3. **Click the "Active" toggle** (top-right)
4. **It should activate successfully now!**

---

## Step 8: Test the Complete Setup

Once activated, go back to Telegram and send a test message:

```
I had scrambled eggs with toast
```

**Expected response:**
```
✅ Meal logged successfully!

📝 Meal: Scrambled Eggs with Toast
🔥 Calories: 300 kcal

Macros:
🥩 Protein: 15g
🍞 Carbs: 25g
🥑 Fat: 12g
```

---

## 🔍 Common Issues

### "Username is already taken"
Try a different username with numbers or underscores:
- `meal_tracker_2026_bot`
- `my_nutrition_bot_xyz`
- `food_logger_12345_bot`

### "Bot doesn't respond after activation"
1. Check workflow is Active (green toggle)
2. Check Telegram nodes have correct credential
3. Check n8n execution logs (Executions tab)
4. Send `/start` to your bot first

### "Token doesn't work in n8n"
1. Make sure you copied the ENTIRE token (no spaces)
2. Token format should be: `NUMBER:LETTERS_AND_NUMBERS`
3. Create a brand new credential instead of updating

---

## 📱 Optional: Customize Your Bot

After creating the bot, you can customize it with BotFather:

### Set Description:
```
/setdescription
```
Choose your bot, then enter:
```
I help you track your meals and calculate nutrition information using AI!
```

### Set About:
```
/setabouttext
```
Choose your bot, then enter:
```
AI-powered meal tracking bot. Send me what you ate and I'll log it with nutrition info!
```

### Set Profile Picture:
```
/setuserpic
```
Choose your bot, then upload an image.

---

## ✅ Checklist

Before trying to activate:
- [ ] Created new bot with BotFather
- [ ] Copied the bot token
- [ ] Updated n8n Telegram credential with new token
- [ ] Both Telegram nodes in workflow use the same credential
- [ ] Saved the workflow
- [ ] Ready to activate!

---

**Once you have the new token, paste it here and I'll help you update the workflow!** 🚀
